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
} from "react-icons/fa";
import Link from "next/link";
import QRCodeModal from "./QRCodeModal";

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
                      href={`/dashboard/analytics/${url.slug}`}
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
        <QRCodeModal slug={showQRCode} setShowQRCode={setShowQRCode} />
      )}
    </div>
  );
}
