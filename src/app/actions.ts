"use server";

import { connectToDatabase } from "@/lib/db";
import { Url } from "../lib/models/url";
import { Analytics } from "../lib/models/analytics";
import {
  CreateUrlResponse,
  VerifyPasswordResponse,
  UrlDocument,
} from "@/lib/types";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { getCachedLocationFromIP } from "@/lib/utils/geolocation";
import { parseUserAgent } from "@/lib/utils/userAgent";
import { getClientIP } from "@/lib/utils/ipAddress";
import { createHash } from "crypto";

// Create shortened URL
export async function createShortUrl(
  formData: FormData,
): Promise<CreateUrlResponse> {
  const originalUrl = formData.get("url") as string;
  const customSlug = formData.get("customSlug") as string;
  const expiryTime = formData.get("expiryTime") as string;
  const maxUses = formData.get("maxUses") as string;
  const password = formData.get("password") as string;

  if (!originalUrl) {
    return { success: false, error: "URL is required" };
  }

  try {
    new URL(originalUrl);
  } catch {
    return {
      success: false,
      error: "Please enter a valid URL including http:// or https://",
    };
  }

  await connectToDatabase();
  const { userId } = await auth();

  // Generate slug or use custom one
  const slug = customSlug || nanoid(6);

  // Check if custom slug is already taken
  if (customSlug) {
    const existing = await Url.findOne({ slug: customSlug });
    if (existing) {
      return { success: false, error: "Custom link already taken" };
    }
  }

  // Basic URL data
  const urlData: {
    originalUrl: string;
    slug: string;
    userId: string | null;
    expiresAt?: Date;
    maxClicks?: number;
    passwordHash?: string;
  } = {
    originalUrl,
    slug,
    userId,
  };

  // Add optional fields for authenticated users
  if (userId) {
    if (expiryTime && expiryTime !== "never") {
      let expiryDate: Date | undefined;

      switch (expiryTime) {
        case "1h":
          expiryDate = new Date(Date.now() + 60 * 60 * 1000);
          break;
        case "24h":
          expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          break;
        case "7d":
          expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          // Custom date format: custom:2023-12-31T23:59
          if (expiryTime.startsWith("custom:")) {
            const customDate = expiryTime.replace("custom:", "");
            expiryDate = new Date(customDate);
          }
      }

      if (expiryDate && !isNaN(expiryDate.getTime())) {
        urlData.expiresAt = expiryDate;
      }
    }

    if (maxUses && parseInt(maxUses) > 0) {
      urlData.maxClicks = parseInt(maxUses);
    }

    if (password) {
      urlData.passwordHash = await bcrypt.hash(password, 10);
    }
  }

  try {
    const newUrl = new Url(urlData);
    await newUrl.save();
    return { success: true, slug };
  } catch (error) {
    console.error("Error creating shortened URL:", error);
    return { success: false, error: "Failed to create shortened URL" };
  }
}

// Get user's URLs
export async function getUserUrls() {
  const { userId } = await auth();
  if (!userId) return [];

  await connectToDatabase();

  try {
    const urls = await Url.find({ userId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(urls));
  } catch (error) {
    console.error("Error fetching user URLs:", error);
    return [];
  }
}

// Delete URL
export async function deleteUrl(id: string) {
  const { userId } = await auth();
  if (!userId) return { success: false };

  await connectToDatabase();

  try {
    await Url.deleteOne({ _id: id, userId });
    return { success: true };
  } catch (error) {
    console.error("Error deleting URL:", error);
    return { success: false, error: "Failed to delete URL" };
  }
}

// Verify password for protected URLs
export async function verifyUrlPassword(
  urlId: string,
  password: string,
): Promise<VerifyPasswordResponse> {
  await connectToDatabase();

  try {
    const url = await Url.findById(urlId);

    if (!url || !url.passwordHash) {
      return { success: false };
    }

    const passwordMatches = await bcrypt.compare(password, url.passwordHash);

    if (passwordMatches) {
      // Increment click count only after successful password verification
      await Url.findByIdAndUpdate(urlId, { $inc: { currentClicks: 1 } });

      // Record analytics for this visit
      await recordPasswordProtectedVisit(url);

      // Add a flag to indicate that analytics have been recorded
      // This will be used in the slug page to avoid double-counting
      return {
        success: true,
        originalUrl: url.originalUrl,
        analyticsRecorded: true,
      };
    }
    return { success: false };
  } catch (error) {
    console.error("Error verifying password:", error);
    return { success: false };
  }
}

/**
 * Record analytics for password-protected URLs
 */
async function recordPasswordProtectedVisit(url: UrlDocument) {
  try {
    // Ensure database connection is established
    await connectToDatabase();

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const referer = headersList.get("referer") || "";

    // Extract request URL information safely
    let requestUrl: URL | null = null;
    const urlHeader = headersList.get("url") || "";

    // Get referrer information for URL parameters
    let originalReferrer = "";

    try {
      if (urlHeader) {
        requestUrl = new URL(urlHeader);
        originalReferrer =
          requestUrl.searchParams.get("original_referrer") || "";
      }
    } catch (error) {
      console.error(
        "[recordPasswordProtectedVisit] Invalid URL from headers:",
        error,
      );
    }

    // Use the effective referrer for analytics
    const effectiveReferrer = originalReferrer || referer;

    // Get IP address using our utility function
    const ipAddress = await getClientIP();

    // Get location data with caching
    let locationData;
    try {
      locationData = await getCachedLocationFromIP(ipAddress);
    } catch (locError) {
      console.error(
        `[recordPasswordProtectedVisit] Error getting location:`,
        locError,
      );
      locationData = { country: "Unknown", region: "Unknown", isp: "Unknown" };
    }

    // Generate a more consistent visitor ID using hash
    const visitorIdInput = `${ipAddress}-${userAgent}`;
    const visitorId = createHash("sha256")
      .update(visitorIdInput)
      .digest("hex")
      .substring(0, 16);

    // Parse user agent data with shared utility
    const userAgentData = parseUserAgent(userAgent);

    // Make sure we have a valid location object even if parts of it are unknown
    const safeLocationData = {
      country: locationData?.country || "Unknown",
      region: locationData?.region || "Unknown",
      isp: locationData?.isp || "Unknown",
    };

    // Validate url ID
    if (!url._id) {
      console.error(
        `[recordPasswordProtectedVisit] Missing URL ID for slug: ${url.slug}`,
      );
      return false;
    }

    // Create analytics entry with location data
    const analyticsRecord = {
      urlId: url._id.toString(),
      slug: url.slug,
      visitorId,
      ipAddress,
      referer: effectiveReferrer,
      userAgent: {
        browser: {
          name: userAgentData.browser.name,
          version: userAgentData.browser.version,
          major: userAgentData.browser.major,
          browserType: userAgentData.browser.browserType,
        },
        cpu: {
          architecture: userAgentData.cpu.architecture,
        },
        device: {
          vendor: userAgentData.device.vendor,
          model: userAgentData.device.model,
          deviceType: userAgentData.device.deviceType,
        },
        engine: {
          name: userAgentData.engine.name,
          version: userAgentData.engine.version,
        },
        os: {
          name: userAgentData.os.name,
          version: userAgentData.os.version,
        },
      },
      location: safeLocationData,
      timestamp: new Date(),
    };

    await Analytics.create(analyticsRecord);
    return true;
  } catch (error) {
    console.error(
      `[recordPasswordProtectedVisit] Error recording analytics for slug: ${url.slug}:`,
      error,
    );
    return false;
  }
}
