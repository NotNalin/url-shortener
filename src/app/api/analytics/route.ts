import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, logger } from "@/lib/db";
import { Analytics } from "@/lib/models/analytics";
import { auth } from "@clerk/nextjs/server";
import { Url } from "@/lib/models/url";
import { AnalyticsData } from "@/lib/types";
import { PipelineStage } from "mongoose";

// Cache for analytics queries to reduce database load
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

type TimeRange = "24h" | "7d" | "30d" | "90d" | "all" | "since_creation";
type CacheEntry = {
  data: AnalyticsData;
  timestamp: number;
};
type DateRange = {
  startDate: Date;
  endDate: Date;
};

const analyticsCache = new Map<string, CacheEntry>();

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of analyticsCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      analyticsCache.delete(key);
    }
  }
}, CACHE_CLEANUP_INTERVAL);

/**
 * Calculate date range based on the requested time range
 */
function calculateDateRange(
  timeRange: TimeRange,
  urlCreationDate: Date,
): DateRange {
  const endDate = new Date(); // Current date and time
  const startDate = new Date(); // Start with current date
  const creationDate = new Date(urlCreationDate);
  creationDate.setHours(0, 0, 0, 0); // Start at beginning of day

  switch (timeRange) {
    case "24h":
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 6); // -6 because we want to include today
      startDate.setHours(0, 0, 0, 0);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 29); // -29 because we want to include today
      startDate.setHours(0, 0, 0, 0);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 89); // -89 because we want to include today
      startDate.setHours(0, 0, 0, 0);
      break;
    case "all":
    case "since_creation":
      startDate.setTime(creationDate.getTime());
      break;
    default:
      startDate.setDate(startDate.getDate() - 6); // Default to last 7 days including today
      startDate.setHours(0, 0, 0, 0);
  }

  // Ensure startDate is never before URL creation date
  if (startDate < creationDate) {
    startDate.setTime(creationDate.getTime());
  }

  // Ensure startDate is not after endDate
  if (startDate > endDate) {
    startDate.setTime(endDate.getTime());
  }

  return { startDate, endDate };
}

/**
 * Get analytics data for a specific URL
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");
    const timeRange = (searchParams.get("timeRange") || "7d") as TimeRange; // Default to 7 days

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Generate cache key
    const cacheKey = `${slug}:${timeRange}:${userId}`;

    // Check cache first
    const cachedEntry = analyticsCache.get(cacheKey);
    const now = Date.now();

    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedEntry.data);
    }

    await connectToDatabase();

    // Verify the URL belongs to the user
    const url = await Url.findOne({ slug, userId });
    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const urlId = url._id.toString();
    const { startDate, endDate } = calculateDateRange(timeRange, url.createdAt);

    // Basic stats query
    const query = {
      urlId,
      timestamp: { $gte: startDate, $lte: endDate },
    };

    // Total visits (total records)
    const totalVisits = await Analytics.countDocuments(query);

    // Unique visitors (distinct visitorIds)
    const uniqueVisitors = await Analytics.distinct("visitorId", query).then(
      (ids) => ids.length,
    );

    // Get total views from URL record
    const totalViews = url.currentClicks || 0;

    // Time series data for graph
    const timeSeriesData = await generateTimeSeriesData(
      urlId,
      startDate,
      endDate,
      timeRange,
    );

    // Location data
    const countries = await getTopMetrics(query, "location.country");
    const regions = await getTopMetrics(query, "location.region");

    // Referers
    const referers = await getTopMetrics(query, "referer");

    // Browser data
    const browsers = await getTopMetrics(query, "userAgent.browser.name");
    const devices = await getTopMetrics(query, "userAgent.device.deviceType");
    const operatingSystems = await getTopMetrics(query, "userAgent.os.name");

    // Get recent clicks
    const recentClicks = await Analytics.find(query)
      .sort({ timestamp: -1 })
      .limit(5)
      .select(
        "timestamp location.country userAgent.browser.name userAgent.os.name userAgent.device.deviceType referer",
      )
      .lean();

    const analyticsData: AnalyticsData = {
      totalVisits,
      uniqueVisitors,
      totalViews,
      timeRangeData: timeSeriesData,
      countries,
      regions,
      referers,
      devices,
      operatingSystems,
      browsers,
      recentClicks: recentClicks.map((click) => ({
        timestamp: click.timestamp,
        country: click.location?.country || "Unknown",
        browser: click.userAgent?.browser?.name || "Unknown",
        os: click.userAgent?.os?.name || "Unknown",
        referer:
          !click.referer || click.referer === ""
            ? "Direct"
            : click.referer.includes("dashboard/analytics")
              ? "Password Protected Link"
              : click.referer,
      })),
    };

    // Update cache
    analyticsCache.set(cacheKey, {
      data: analyticsData,
      timestamp: now,
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

/**
 * Generate time series data for the given time range
 */
async function generateTimeSeriesData(
  urlId: string,
  startDate: Date,
  endDate: Date,
  timeRange: TimeRange,
) {
  // Format for grouping based on time range
  let format = "%Y-%m-%d"; // Default to daily
  if (timeRange === "24h") {
    format = "%Y-%m-%dT%H:00:00.000Z"; // Hourly for 24h view
  }

  const pipeline: PipelineStage[] = [
    {
      // Match documents within the date range for the specific URL
      $match: {
        urlId,
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      // Group by date (or hour for 24h view)
      $group: {
        _id: {
          $dateToString: {
            format: format,
            date: "$timestamp",
          },
        },
        visits: { $sum: 1 }, // Count visits for each interval
      },
    },
    {
      // Sort by date/time
      $sort: { _id: 1 },
    },
    {
      // Project to the desired format
      $project: {
        _id: 0,
        date: "$_id", // Rename _id to date
        visits: 1,
      },
    },
  ];

  // Execute the aggregation pipeline
  // Return the raw aggregated results
  // The frontend will handle filling gaps and formatting
  return await Analytics.aggregate(pipeline);
}

/**
 * Get top metrics for a specific field
 */
async function getTopMetrics(
  query: { urlId: string; timestamp: { $gte: Date; $lte: Date } },
  field: string,
): Promise<Array<{ name: string; count: number; percentage: number }>> {
  // Handle special cases for userAgent fields
  const groupField = field.startsWith("userAgent.")
    ? `$${field}`
    : field === "referer"
      ? {
          $cond: {
            if: { $eq: ["$referer", ""] },
            then: "Direct",
            else: {
              $cond: {
                if: {
                  $regexMatch: { input: "$referer", regex: "^https?://[^/]+$" },
                },
                then: "$referer",
                else: {
                  $cond: {
                    if: {
                      $regexMatch: {
                        input: "$referer",
                        regex: "^/dashboard/analytics/",
                      },
                    },
                    then: "Password Protected Link",
                    else: "$referer",
                  },
                },
              },
            },
          },
        }
      : `$${field}`;

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $group: {
        _id: groupField,
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $project: {
        _id: 0,
        name: {
          $cond: {
            if: { $eq: ["$_id", null] },
            then: "Unknown",
            else: "$_id",
          },
        },
        count: 1,
      },
    },
  ];

  const result = await Analytics.aggregate(pipeline);
  const total = result.reduce((sum, item) => sum + item.count, 0);

  return result.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));
}
