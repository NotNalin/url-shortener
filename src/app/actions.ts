// app/actions.ts
"use server";

import { connectToDatabase } from "@/lib/db";
import { Url } from "../lib/models/url";
import { CreateUrlResponse, VerifyPasswordResponse } from "@/lib/types";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { auth } from "@clerk/nextjs/server";

// Create shortened URL
export async function createShortUrl(
  formData: FormData
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
  password: string
): Promise<VerifyPasswordResponse> {
  await connectToDatabase();

  try {
    const url = await Url.findById(urlId);

    if (!url || !url.passwordHash) {
      return { success: false };
    }

    const passwordMatches = await bcrypt.compare(password, url.passwordHash);

    if (passwordMatches) {
      // Increment click count on successful password verification
      await Url.findByIdAndUpdate(urlId, { $inc: { currentClicks: 1 } });
      return { success: true, originalUrl: url.originalUrl };
    }

    return { success: false };
  } catch (error) {
    console.error("Error verifying password:", error);
    return { success: false };
  }
}
