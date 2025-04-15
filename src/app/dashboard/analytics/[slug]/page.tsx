import { getUserUrls } from "@/app/actions";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import Link from "next/link";
import { UrlDocument } from "@/lib/types";

interface AnalyticsPageProps {
  params: {
    slug: string;
  };
}

/**
 * Analytics page for a specific URL
 */
export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { userId } = await auth();
  const { slug } = await params;

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Unauthorized</h2>
          <p className="mt-2">Please sign in to view analytics</p>
        </div>
      </div>
    );
  }

  // Get the user's URLs to verify they own this one
  const urls = await getUserUrls();
  const url = urls.find((url: UrlDocument) => url.slug === slug);

  if (!url) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <AnalyticsDashboard slug={slug} />
    </div>
  );
}
