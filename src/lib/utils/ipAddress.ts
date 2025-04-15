import { headers } from "next/headers";

/**
 * Extract the client IP address from request headers with fallbacks
 * @returns IP address string or default value for local development
 */
export async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    
    // Use type assertion to work around possible typing issues
    const h = headersList as unknown as { get(name: string): string | null };

    // Check headers in order of preference
    const headerPriority = [
      "x-forwarded-for",
      "x-real-ip",
      "cf-connecting-ip",
      "true-client-ip",
      "x-client-ip",
      "x-forwarded",
      "forwarded-for",
      "forwarded",
      "remote-addr",
      "client-ip",
    ];

    for (const header of headerPriority) {
      const value = h.get(header);
      if (value) {
        // For x-forwarded-for and similar headers, get the first IP
        if (
          header === "x-forwarded-for" ||
          header === "forwarded-for" ||
          header === "forwarded"
        ) {
          const ip = value.split(",")[0].trim();
          return ip;
        }
        return value.trim();
      }
    }
    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}
