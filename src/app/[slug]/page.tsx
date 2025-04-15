import { connectToDatabase } from "@/lib/db";
import { Url } from "../../lib/models/url";
import { Analytics } from "../../lib/models/analytics";
import { notFound, redirect } from "next/navigation";
import { PasswordPrompt } from "../../components/PasswordPrompt";
import Link from "next/link";
import { headers } from "next/headers";
import { getCachedLocationFromIP } from "@/lib/utils/geolocation";
import { parseUserAgent } from "@/lib/utils/userAgent";
import { getClientIP } from "@/lib/utils/ipAddress";
import { verifyUrlPassword } from "../actions";
import { UrlDocument } from "@/lib/types";
import { createHash } from "crypto";

interface RedirectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Record analytics data for a URL visit
 */
async function recordAnalytics(url: UrlDocument, slug: string) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const referer = headersList.get("referer") || "";
    const requestUrl = new URL(headersList.get("url") || "");

    // Check for original_referrer parameter
    const originalReferrer = requestUrl.searchParams.get("original_referrer");
    const effectiveReferrer = originalReferrer || referer;

    // Get IP address using our utility function
    const ipAddress = await getClientIP();

    // Get location data with caching
    const locationData = await getCachedLocationFromIP(ipAddress);

    // Generate a more consistent visitor ID for server-side tracking
    const visitorIdInput = `${ipAddress}-${userAgent}`;
    const visitorId = createHash("sha256")
      .update(visitorIdInput)
      .digest("hex")
      .substring(0, 16);

    // Parse user agent data using our utility function
    const userAgentData = parseUserAgent(userAgent);

    // Create analytics entry with location data
    const analyticsEntry = await Analytics.create({
      urlId: url._id.toString(),
      slug,
      visitorId,
      ipAddress,
      referer: effectiveReferrer,
      userAgent: userAgentData,
      location: locationData,
      timestamp: new Date(),
    });
    return true;
  } catch (error) {
    console.error(`[recordAnalytics] Error recording analytics:`, error);
    return false;
  }
}

export default async function RedirectPage({
  params,
  searchParams,
}: RedirectPageProps) {
  const { slug } = await params;
  await connectToDatabase();

  const url = await Url.findOne({ slug });

  if (!url) {
    notFound();
  }

  // Check if expired
  if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-red-50 rounded-lg shadow">
        <h2 className="text-xl font-bold text-red-700">Link Expired</h2>
        <p className="mt-2">
          This shortened URL has expired and is no longer valid.
        </p>
        <Link href="/" className="block mt-4 text-blue-600 hover:underline">
          Create a new shortened URL
        </Link>
      </div>
    );
  }

  // Check if max clicks reached
  if (url.maxClicks && url.currentClicks >= url.maxClicks) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-yellow-50 rounded-lg shadow">
        <h2 className="text-xl font-bold text-yellow-700">
          Usage Limit Reached
        </h2>
        <p className="mt-2">
          This link has reached its maximum number of allowed uses.
        </p>
        <Link href="/" className="block mt-4 text-blue-600 hover:underline">
          Create a new shortened URL
        </Link>
      </div>
    );
  }

  // If password protected, check for key parameter
  if (url.passwordHash) {
    // Get search params asynchronously
    const params = await searchParams;

    // Access key from awaited params
    const key = params.key as string;

    if (key) {
      // Verify password from URL parameter
      const result = await verifyUrlPassword(url._id.toString(), key);

      if (result.success) {
        // Only record analytics if they weren't already recorded by verifyUrlPassword
        if (!("analyticsRecorded" in result) || !result.analyticsRecorded) {
          await recordAnalytics(url, slug);

          // Increment click count - separated from analytics for reliability
          await Url.findByIdAndUpdate(url._id, { $inc: { currentClicks: 1 } });
        }

        // Redirect to the original URL
        return redirect(url.originalUrl);
      } else {
      }
    } else {
    }

    // Show password prompt if no key or verification failed
    return <PasswordPrompt urlId={url._id.toString()} slug={slug} />;
  }

  // For non-password protected URLs
  try {
    // Record analytics
    await recordAnalytics(url, slug);

    // Increment click count - separated operation for reliability
    await Url.findByIdAndUpdate(url._id, { $inc: { currentClicks: 1 } });

    // Redirect to the original URL
    redirect(url.originalUrl);
  } catch (error) {
    console.error("[RedirectPage] Error processing redirect:", error);
    // Still redirect even if analytics or click tracking fails
    redirect(url.originalUrl);
  }
}
