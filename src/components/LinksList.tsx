// components/LinksList.tsx
'use client'

import { useState } from 'react';
import { deleteUrl } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { UrlDocument } from '@/lib/types';
import { FaTrash, FaCopy, FaKey, FaClock, FaMousePointer } from 'react-icons/fa';

interface LinksListProps {
  urls: UrlDocument[];
}

function formatDateTime(date: Date | string) {
  const options: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return new Date(date).toLocaleString('en-US', options);
}

export function LinksList({ urls }: LinksListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
              <tr key={url._id} className="hover:bg-muted/50 transition-colors">
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
                        <span className="block w-4 h-4 animate-pulse">...</span>
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
  );
}