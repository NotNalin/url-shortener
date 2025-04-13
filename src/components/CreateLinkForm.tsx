"use client";

import { useState, FormEvent } from "react";
import { createShortUrl } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa6";
import { FaEyeSlash, FaEye } from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
    <div className="p-6 rounded-lg shadow-md border border-border">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="url">
            URL to shorten*
          </label>
          <input
            id="url"
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://example.com/long-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        {isLoggedIn && (
          <div className="mb-4">
            <label className="block mb-2 font-medium" htmlFor="customSlug">
              Custom short URL (optional)
            </label>
            <div className="flex items-center">
              <span className="mr-1 text-muted-foreground">
                {typeof window !== "undefined"
                  ? window.location.origin.replace(/(^\w+:|^)\/\//, "")
                  : ""}
                /
              </span>
              <input
                id="customSlug"
                type="text"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors duration-200"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>
                {showAdvanced
                  ? "Hide advanced options"
                  : "Show advanced options"}
              </span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        )}

        {isLoggedIn && showAdvanced && (
          <div className="mb-6 p-4 rounded-md border border-border">
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="expiryTime">
                Link expiration
              </label>
              <div className="relative">
                <select
                  id="expiryTime"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10"
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <FaChevronDown />
                </div>
              </div>
            </div>

            {expiryTime === "custom" && (
              <div className="mb-4">
                <label className="block mb-2 font-medium" htmlFor="customDate">
                  Custom expiration date
                </label>
                <input
                  id="customDate"
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="maxUses">
                Maximum uses (clicks)
              </label>
              <input
                id="maxUses"
                type="number"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Unlimited"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="password">
                Passphrase
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  placeholder="Enter passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-sm mt-1 text-muted-foreground">
                Leave blank for no passphrase. This will be required to access
                the link.
              </p>
            </div>
          </div>
        )}

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md btn-primary disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Shorten URL"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <h3 className="font-medium text-green-800 dark:text-green-400 mb-2">
            URL shortened successfully!
          </h3>
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-l-md"
              value={result.shortUrl}
              readOnly
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.shortUrl);
                alert("Copied to clipboard!");
              }}
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-blue-800 dark:text-blue-400">
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/sign-up" className="underline">
              sign up
            </Link>{" "}
            to use custom URLs, expiration dates, click limits and password
            protection.
          </p>
        </div>
      )}
    </div>
  );
}
