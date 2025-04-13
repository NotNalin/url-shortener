// components/CreateLinkForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { createShortUrl } from "@/app/actions";
import { useRouter } from "next/navigation";

interface CreateLinkFormProps {
  isLoggedIn: boolean;
}

type FormResult = {
  shortUrl: string;
  slug: string;
} | null;

export function CreateLinkForm({ isLoggedIn }: CreateLinkFormProps) {
  const [url, setUrl] = useState<string>("");
  const [customSlug, setCustomSlug] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [expiryTime, setExpiryTime] = useState<string>("never");
  const [maxUses, setMaxUses] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [customDate, setCustomDate] = useState<string>("");
  const [result, setResult] = useState<FormResult>(null);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!url) {
      setError("URL is required");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("url", url);

    if (customSlug && isLoggedIn) {
      formData.append("customSlug", customSlug);
    }

    if (isLoggedIn && showAdvanced) {
      if (expiryTime === "custom" && customDate) {
        formData.append("expiryTime", `custom:${customDate}`);
      } else {
        formData.append("expiryTime", expiryTime);
      }

      if (maxUses) {
        formData.append("maxUses", maxUses);
      }

      if (password) {
        formData.append("password", password);
      }
    }

    try {
      const response = await createShortUrl(formData);

      if (!response.success) {
        setError(response.error || "Failed to create shortened URL");
      } else {
        setResult({
          shortUrl: `${window.location.origin}/${response.slug}`,
          slug: response.slug as string,
        });

        // Reset form
        setUrl("");
        setCustomSlug("");
        setExpiryTime("never");
        setMaxUses("");
        setPassword("");
        setCustomDate("");

        // Refresh router to update any lists
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="url">
            URL to shorten*
          </label>
          <input
            id="url"
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://example.com/long-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        {isLoggedIn && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="customSlug">
              Custom short URL (optional)
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">
                {typeof window !== "undefined" ? window.location.origin : ""}/
              </span>
              <input
                id="customSlug"
                type="text"
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="my-link"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
              />
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="mb-4">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide advanced options" : "Show advanced options"}
            </button>
          </div>
        )}

        {isLoggedIn && showAdvanced && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="expiryTime">
                Link expiration
              </label>
              <select
                id="expiryTime"
                className="w-full px-3 py-2 border rounded-md"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
              >
                <option value="never">Never</option>
                <option value="1h">1 hour</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="custom">Custom date</option>
              </select>
            </div>

            {expiryTime === "custom" && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="customDate"
                >
                  Custom expiration date
                </label>
                <input
                  id="customDate"
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded-md"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="maxUses">
                Maximum uses (clicks)
              </label>
              <input
                id="maxUses"
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Unlimited"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password protection
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="No password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank for no password
              </p>
            </div>
          </div>
        )}

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Shorten URL"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800 mb-2">
            URL shortened successfully!
          </h3>
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-l-md bg-white"
              value={result.shortUrl}
              readOnly
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.shortUrl);
                alert("Copied to clipboard!");
              }}
              className="bg-gray-200 px-4 py-2 rounded-r-md hover:bg-gray-300"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">
            <a href="/sign-in" className="underline">
              Sign in
            </a>{" "}
            or{" "}
            <a href="/sign-up" className="underline">
              sign up
            </a>{" "}
            to use custom URLs, expiration dates, click limits and password
            protection.
          </p>
        </div>
      )}
    </div>
  );
}
