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
  FaMousePointer,
  FaChartBar,
  FaQrcode,
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
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
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
        ctx!.fillText(url, canvas.width / 2, img.height + 20);

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qr-code-${slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl shadow-lg border border-border overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Short URL
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Original URL
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Clicks
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Features
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {urls.map((url) => (
                <tr
                  key={url._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <a
                      href={`/${url.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      /{url.slug}
                    </a>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-xs truncate text-muted-foreground hover:text-foreground transition-colors">
                      {url.originalUrl}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap font-medium">
                    {url.currentClicks}
                    {url.maxClicks && (
                      <span className="text-muted-foreground">
                        {` / ${url.maxClicks}`}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">
                    {formatDateTime(url.createdAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {url.passwordHash && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full ring-1 ring-inset ring-blue-400/30 dark:ring-blue-400/20">
                          <FaKey className="w-3 h-3" />
                          Protected
                        </span>
                      )}
                      {url.expiresAt && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full ring-1 ring-inset ring-purple-400/30 dark:ring-purple-400/20">
                          <FaClock className="w-3 h-3" />
                          {formatDateTime(url.expiresAt)}
                        </span>
                      )}
                      {url.maxClicks && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full ring-1 ring-inset ring-green-400/30 dark:ring-green-400/20">
                          <FaMousePointer className="w-3 h-3" />
                          {url.currentClicks}/{url.maxClicks}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-4">
                      <Link
                        href={`/dashboard/analytics/${url.slug}`}
                        className="text-indigo-500 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-500/10 rounded-md"
                        title="View Analytics"
                      >
                        <FaChartBar className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setShowQRCode(url.slug)}
                        className="text-primary hover:text-primary-hover transition-colors p-1.5 hover:bg-primary/10 rounded-md"
                        title="Show QR Code"
                      >
                        <FaQrcode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(url.slug)}
                        className="text-primary hover:text-primary-hover transition-colors p-1.5 hover:bg-primary/10 rounded-md"
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
                          <span className="block w-4 h-4 animate-pulse">
                            ...
                          </span>
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">QR Code</h3>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div
                className="p-4 bg-white rounded-lg"
                id={`qr-code-${showQRCode}`}
              >
                <QRCodeSVG
                  value={`${window.location.origin}/${showQRCode}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Scan to visit:
                </p>
                <p className="text-sm font-medium break-all max-w-[280px]">
                  {window.location.origin}/{showQRCode}
                </p>
              </div>
              <button
                onClick={() => downloadQRCode(showQRCode)}
                className="text-sm text-primary hover:underline"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
