import { cache } from "react";

/**
 * Interface for location data returned by the geolocation service
 */
interface LocationData {
  country: string;
  region: string;
  city: string;
  isp: string;
}

/**
 * Get location data from IP address using ipapi.co with retry mechanism
 * @param ipAddress - The IP address to look up
 * @param retryCount - Number of retries attempted (default: 0)
 * @returns Location data or null if lookup fails
 */
async function getLocationFromIP(
  ipAddress: string,
  retryCount = 0,
): Promise<LocationData | null> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000; // 1 second delay between retries

  if (!ipAddress) return null;

  // Skip processing for local/private IP addresses
  if (isLocalIP(ipAddress)) {
    return getFallbackLocation();
  }

  try {
    // Add a timeout to the fetch to prevent long-running requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "URL-Shortener-App/1.0",
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit hit - either retry or use fallback
        if (retryCount < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return getLocationFromIP(ipAddress, retryCount + 1);
        }
        return getFallbackLocation();
      }
      console.warn(
        `[getLocationFromIP] HTTP error: ${response.status} for IP: ${ipAddress}`,
      );
      return getFallbackLocation();
    }

    const data = await response.json();

    // Check if we got valid data - don't throw, just log and use fallback
    if (data.error) {
      console.warn(
        `[getLocationFromIP] API returned error: ${data.error} for IP: ${ipAddress}`,
      );
      return getFallbackLocation();
    }

    return {
      country: data.country_name || "Unknown",
      region: data.region || "Unknown",
      city: data.city || "Unknown",
      isp: data.org || "Unknown", // Internet Service Provider
    };
  } catch (error) {
    // Retry on network errors or temporary failures
    if (
      retryCount < MAX_RETRIES &&
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("fetch"))
    ) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return getLocationFromIP(ipAddress, retryCount + 1);
    }

    console.error(
      `[getLocationFromIP] Error fetching geolocation for IP ${ipAddress}:`,
      error,
    );
    return getFallbackLocation();
  }
}

/**
 * Check if an IP address is a local/private address
 * @param ip - The IP address to check
 * @returns boolean indicating if IP is local/private
 */
function isLocalIP(ip: string): boolean {
  // Normalize IP first
  const normalizedIP = ip.trim().toLowerCase();

  // Check for IPv6 localhost variants
  if (
    normalizedIP === "::1" ||
    normalizedIP.includes("localhost") ||
    normalizedIP.startsWith("::ffff:127.") ||
    normalizedIP.startsWith("::ffff:0:127.")
  ) {
    return true;
  }

  // Extract IPv4 from IPv6-mapped addresses
  let ipToCheck = normalizedIP;
  if (normalizedIP.startsWith("::ffff:")) {
    ipToCheck = normalizedIP.substring(7);
  }

  // Check for IPv4 localhost and private ranges
  return (
    ipToCheck === "127.0.0.1" ||
    ipToCheck.startsWith("10.") ||
    ipToCheck.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ipToCheck) ||
    ipToCheck === "0.0.0.0"
  );
}

/**
 * Get fallback location data when API fails
 */
function getFallbackLocation(): LocationData {
  return {
    country: "Unknown",
    region: "Unknown",
    city: "Unknown",
    isp: "Unknown",
  };
}

/**
 * Cache for storing geolocation results to reduce API calls
 * Using a TTL of 24 hours for cached values
 */
type CacheEntry = {
  data: LocationData;
  timestamp: number;
};

const geolocationCache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_MAX_SIZE = 1000; // Maximum number of entries to prevent memory leaks

/**
 * Get cached location data or fetch new data
 * @param ipAddress - The IP address to look up
 * @returns Location data or fallback if lookup fails
 */
export const getCachedLocationFromIP = cache(
  async (ipAddress: string): Promise<LocationData> => {
    if (!ipAddress) {
      return getFallbackLocation();
    }

    // Normalize IP address to handle potential formatting issues
    const normalizedIP = ipAddress.trim();

    // Check cache first
    const cachedEntry = geolocationCache.get(normalizedIP);
    const now = Date.now();

    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return cachedEntry.data;
    }

    // If not in cache or expired, fetch new data
    try {
      const location = await getLocationFromIP(normalizedIP);

      // Use fallback if no location found
      const locationData = location || getFallbackLocation();

      // Implement cache eviction strategy if we've reached the max size
      if (geolocationCache.size >= CACHE_MAX_SIZE) {
        // Find and remove the oldest entry
        let oldestKey = "";
        let oldestTime = now;

        for (const [key, entry] of geolocationCache.entries()) {
          if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp;
            oldestKey = key;
          }
        }

        if (oldestKey) {
          geolocationCache.delete(oldestKey);
        }
      }

      // Update cache
      geolocationCache.set(normalizedIP, {
        data: locationData,
        timestamp: now,
      });

      return locationData;
    } catch (error) {
      console.error(
        "[getCachedLocationFromIP] Error getting location data:",
        error,
      );
      return getFallbackLocation();
    }
  },
);
