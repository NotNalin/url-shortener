"use client";

import { useState, FormEvent } from "react";
import { createShortUrl } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa6";
import { FaEyeSlash, FaEye, FaDownload } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";

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
    <div className="p-4 sm:p-6 rounded-lg shadow-md border border-border bg-card">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm sm:text-base font-medium"
            htmlFor="url"
          >
            URL to shorten*
          </label>
          <input
            id="url"
            type="text"
            className="w-full px-4 py-2.5 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com/long-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        {isLoggedIn && (
          <div className="mb-4">
            <label
              className="block mb-2 text-sm sm:text-base font-medium"
              htmlFor="customSlug"
            >
              Custom short URL (optional)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-sm sm:text-base">
                {typeof window !== "undefined"
                  ? window.location.origin.replace(/(^\w+:|^)\/\//, "")
                  : ""}
                /
              </span>
              <input
                id="customSlug"
                type="text"
                className="flex-1 px-4 py-2.5 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm sm:text-base border border-border rounded-lg hover:bg-accent transition-colors"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>
                {showAdvanced
                  ? "Hide advanced options"
                  : "Show advanced options"}
              </span>
              <FaChevronDown
                className={`text-muted-foreground transition-transform ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        )}

        {isLoggedIn && showAdvanced && (
          <div className="mb-6 p-4 space-y-4 rounded-lg border border-border bg-muted/10">
            {/* Expiration Section */}
            <div>
              <label
                className="block mb-2 text-sm sm:text-base font-medium"
                htmlFor="expiryTime"
              >
                Link expiration
              </label>
              <div className="relative">
                <select
                  id="expiryTime"
                  className="w-full px-4 py-2.5 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary appearance-none"
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
                  <FaChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Custom Date */}
            {expiryTime === "custom" && (
              <div>
                <label
                  className="block mb-2 text-sm sm:text-base font-medium"
                  htmlFor="customDate"
                >
                  Custom expiration date
                </label>
                <input
                  id="customDate"
                  type="datetime-local"
                  className="w-full px-4 py-2.5 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
            )}

            {/* Max Uses */}
            <div>
              <label
                className="block mb-2 text-sm sm:text-base font-medium"
                htmlFor="maxUses"
              >
                Maximum uses (clicks)
              </label>
              <input
                id="maxUses"
                type="number"
                className="w-full px-4 py-2.5 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Unlimited"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>

            {/* Password Section */}
            <div>
              <label
                className="block mb-2 text-sm sm:text-base font-medium"
                htmlFor="password"
              >
                Passphrase
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary pr-12"
                  placeholder="Enter passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <FaEye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Leave blank for no passphrase. Required to access the link.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 text-sm sm:text-base text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-6 text-base font-medium text-primary bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Shorten URL"}
        </button>
      </form>

      {/* Result Section */}
      {result && (
        <div className="mt-6 p-4 sm:p-6 bg-success/10 border border-success/20 rounded-lg">
          <h3 className="text-lg sm:text-xl font-semibold text-success mb-4">
            🎉 URL shortened successfully!
          </h3>
          <div className="space-y-6">
            {/* URL Copy Section */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                className="flex-1 px-4 py-2.5 text-base border border-border rounded-lg bg-background"
                href={result.shortUrl}
              >
                {result.shortUrl}
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.shortUrl);
                  alert("Copied to clipboard!");
                }}
                className="px-6 py-2.5 bg-white rounded-lg sm:rounded-l-none hover:bg-primary/90 transition-colors"
              >
                Copy
              </button>
            </div>

            {/* QR Code Section */}
            <div className="p-4 bg-white rounded-lg border border-border">
              <div className="flex flex-col items-center gap-4">
                <div className="p-2 bg-white rounded-md">
                  <QRCodeSVG
                    value={result.shortUrl}
                    size={160}
                    level="H"
                    includeMargin={true}
                    className="rounded-md"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Scan to visit:
                  </p>
                  <p className="text-base font-medium break-all">
                    {result.shortUrl}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Create a temporary link to download the QR code
                    const svg = document.querySelector(".qr-code svg");
                    if (svg) {
                      const svgData = new XMLSerializer().serializeToString(
                        svg,
                      );
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d");
                      const img = new Image();
                      img.onload = () => {
                        // Set canvas size to accommodate QR code and text
                        canvas.width = img.width;
                        canvas.height = img.height + 40; // Extra space for text

                        // Draw white background
                        ctx!.fillStyle = "white";
                        ctx!.fillRect(0, 0, canvas.width, canvas.height);

                        // Draw QR code
                        ctx!.drawImage(img, 0, 0);

                        // Add text
                        ctx!.font = "14px Arial";
                        ctx!.fillStyle = "black";
                        ctx!.textAlign = "center";
                        ctx!.fillText(
                          result.shortUrl,
                          canvas.width / 2,
                          img.height + 20,
                        );

                        const pngFile = canvas.toDataURL("image/png");
                        const downloadLink = document.createElement("a");
                        downloadLink.download = `qr-code-${result.slug}.png`;
                        downloadLink.href = pngFile;
                        downloadLink.click();
                      };
                      img.src = "data:image/svg+xml;base64," + btoa(svgData);
                    }
                  }}
                  className="text-primary hover:text-primary/80 font-medium flex items-center gap-2"
                >
                  <FaDownload className="w-5 h-5" />
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Prompt */}
      {!isLoggedIn && (
        <div className="mt-6 p-4 sm:p-6 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-sm sm:text-base text-info text-center">
            <Link
              href="/sign-in"
              className="font-medium underline hover:text-info/80"
            >
              Sign in
            </Link>{" "}
            or{" "}
            <Link
              href="/sign-up"
              className="font-medium underline hover:text-info/80"
            >
              sign up
            </Link>{" "}
            to unlock custom URLs, expiration dates, click limits, and password
            protection.
          </p>
        </div>
      )}
    </div>
  );
}
