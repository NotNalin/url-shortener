"use client";

import { useState } from "react";
import { deleteUrl } from "@/app/actions";
import { useRouter } from "next/navigation";
import { UrlDocument } from "@/lib/types";
import {
  FaTrash,
  FaCopy,
  FaKey,
  FaClock,
  FaChartBar,
  FaQrcode,
  FaSpinner,
  FaClipboard,
  FaDownload,
} from "react-icons/fa";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface LinksListProps {
  urls: UrlDocument[];
}

function formatDateTime(date: Date | string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return new Date(date).toLocaleString("en-US", options);
}

export function LinksList({ urls }: LinksListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this link?")) {
      setDeletingId(id);
      await deleteUrl(id);
      router.refresh();
      setDeletingId(null);
    }
  }

  function copyToClipboard(slug: string) {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  }

  function downloadQRCode(slug: string) {
    const url = `${window.location.origin}/${slug}`;
    const svg = document.querySelector(`#qr-code-${slug} svg`);
    if (!svg) return;

    // Create temporary canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height + 40; // Extra space for text

      // Draw white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code
      ctx.drawImage(img, 0, 0);

      // Add text
      ctx.font = "14px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(url, canvas.width / 2, img.height + 20);

      // Download image
      try {
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qr-code-${slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      } catch (e) {
        console.error("Error generating QR code download:", e);
      }
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  }

  return (
    <div className="space-y-6 p-3">
      <div className="rounded-xl border border-border shadow-md overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-border">
            <thead className="bg-muted/40 sticky top-0 z-10 text-sm">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left font-bold uppercase tracking-wide text-muted-foreground">
                  Short URL
                </th>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                  Original URL
                </th>
                <th className="px-3 sm:px-6 py-3 text-center font-bold uppercase tracking-wide text-muted-foreground">
                  Clicks
                </th>
                <th className="px-3 sm:px-6 py-3 text-center font-bold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10 text-m">
              {urls.map((url) => (
                <tr
                  key={url._id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <a
                      href={`/${url.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover font-semibold transition-colors"
                    >
                      /{url.slug}
                    </a>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {url.passwordHash && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                          <FaKey className="w-3 h-3" />
                          <span className="hidden sm:inline">Protected</span>
                        </span>
                      )}
                      {url.expiresAt && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md">
                          <FaClock className="w-3 h-3" />
                          <span className="hidden sm:inline">Expires</span>
                        </span>
                      )}
                    </div>
                    <div className="md:hidden mt-1">
                      <div className="text-m font-bold text-muted-foreground truncate max-w-[200px]">
                        {url.originalUrl}
                      </div>
                      <div className="text-m font-bold text-muted-foreground mt-0.5">
                        {formatDateTime(url.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell align-top">
                    <div className="max-w text-m truncate text-muted-foreground hover:text-foreground transition-colors font-bold">
                      {url.originalUrl}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                      {formatDateTime(url.createdAt)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-center align-top">
                    <div className="font-bold">
                      {url.currentClicks}
                      {url.maxClicks && (
                        <span className="text-sm"> / {url.maxClicks}</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap align-top">
                    <div className="flex justify-center mt-3">
                      <Link
                        href={`/dashboard/analytics/${url.slug}`}
                        className="text-indigo-500 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-500/10 rounded-md"
                        title="View Analytics"
                      >
                        <FaChartBar className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setShowQRCode(url.slug)}
                        className="text-green-500 hover:text-green-600 transition-colors p-1.5 hover:bg-green-500/10 rounded-md"
                        title="Show QR Code"
                      >
                        <FaQrcode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(url.slug)}
                        className="text-yellow-500 hover:text-tellow-600 transition-colors p-1.5 hover:bg-yellow-500/10 rounded-md"
                        title="Copy URL"
                      >
                        <FaCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(url._id)}
                        disabled={deletingId === url._id}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors p-1.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-md"
                        title="Delete URL"
                      >
                        {deletingId === url._id ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {urls.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No URLs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowQRCode(null)}
        >
          <div className="bg-background p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm border border-border/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">QR Code</h3>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/20 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div
                className="p-3 sm:p-4 bg-white rounded-lg shadow-sm"
                id={`qr-code-${showQRCode}`}
              >
                <QRCodeSVG
                  value={`${window.location.origin}/${showQRCode}`}
                  size={180}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1 sm:mb-2">
                  Scan to visit:
                </p>
                <p className="text-sm font-medium break-all max-w-[250px]">
                  {window.location.origin}/{showQRCode}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-1 sm:mt-2">
                <button
                  onClick={() => downloadQRCode(showQRCode)}
                  className="text-sm px-4 py-2 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
                >
                  <FaDownload className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${showQRCode}`;
                    navigator.clipboard.writeText(url);
                    alert("URL copied to clipboard!");
                  }}
                  className="text-sm px-4 py-2 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
                >
                  <FaClipboard className="w-4 h-4" />
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
