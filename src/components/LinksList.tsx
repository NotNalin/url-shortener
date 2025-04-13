// components/LinksList.tsx
'use client'

import { useState } from 'react';
import { deleteUrl } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { UrlDocument } from '@/lib/types';
import { FaTrash, FaCopy } from 'react-icons/fa';

interface LinksListProps {
  urls: UrlDocument[];
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
    <div className="rounded-lg shadow-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-muted">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Short URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Original URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Features
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {urls.map((url) => (
              <tr key={url._id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <a 
                    href={`/${url.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    /{url.slug}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate text-muted-foreground">
                    {url.originalUrl}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {url.currentClicks}
                  {url.maxClicks ? ` / ${url.maxClicks}` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(url.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {url.passwordHash && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded">
                        Password
                      </span>
                    )}
                    {url.expiresAt && (
                      <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-300 rounded">
                        Expires {new Date(url.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                    {url.maxClicks && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 rounded">
                        Max: {url.maxClicks}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => copyToClipboard(url.slug)}
                      className="text-primary hover:text-primary-hover"
                      title="Copy URL"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => handleDelete(url._id)}
                      disabled={deletingId === url._id}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 dark:text-red-500 dark:hover:text-red-400"
                      title="Delete URL"
                    >
                      {deletingId === url._id ? '...' : <FaTrash />}
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