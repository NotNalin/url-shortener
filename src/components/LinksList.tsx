// components/LinksList.tsx
'use client'

import { useState } from 'react';
import { deleteUrl } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { UrlDocument } from '@/lib/types';

interface LinksListProps {
  urls: UrlDocument[];
}

export function LinksList({ urls }: LinksListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  
  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteUrl(id);
    router.refresh();
    setDeletingId(null);
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Short URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Original URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Clicks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Features
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {urls.map((url) => (
            <tr key={url._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <a 
                  href={`/${url.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  /{url.slug}
                </a>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs truncate text-gray-500">
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
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Password
                    </span>
                  )}
                  {url.expiresAt && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      Expires {new Date(url.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  {url.maxClicks && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Max Clicks: {url.maxClicks}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(url._id)}
                  disabled={deletingId === url._id}
                  className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                >
                  {deletingId === url._id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}