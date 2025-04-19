import { getUserUrls } from "../actions";
import { LinksList } from "@/components/LinksList";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  FaLink,
  FaChartBar,
  FaMousePointer,
  FaClock,
  FaKey,
  FaPlus,
} from "react-icons/fa";
import Link from "next/link";
import { UrlDocument } from "@/lib/types";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const urls = await getUserUrls();

  // Calculate summary metrics
  const totalLinks = urls.length;
  const totalClicks = urls.reduce(
    (sum: number, url: UrlDocument) => sum + url.currentClicks,
    0,
  );
  const protectedLinks = urls.filter(
    (url: UrlDocument) => url.passwordHash,
  ).length;
  const expiringLinks = urls.filter((url: UrlDocument) => url.expiresAt).length;

  return (
    <section className="space-y-6">
      {/* Header with title and action button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">Dashboard</span>
        </h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5"
        >
          <FaPlus className="w-4 h-4" />
          <span>Create New Link</span>
        </Link>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Total Links</h3>
            <div className="text-primary bg-primary/10 p-2 rounded-full">
              <FaLink className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2">
            {totalLinks.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Total Clicks</h3>
            <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-full">
              <FaMousePointer className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2">
            {totalClicks.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Protected Links</h3>
            <div className="text-blue-500 bg-blue-500/10 p-2 rounded-full">
              <FaKey className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2">
            {protectedLinks.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Expiring Links</h3>
            <div className="text-purple-500 bg-purple-500/10 p-2 rounded-full">
              <FaClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2">
            {expiringLinks.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Links List Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          <FaChartBar className="w-4 h-4 mr-2 text-primary" />
          Your Links
        </h3>
        {urls.length === 0 ? (
          <div className="p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <FaLink />
            </div>
            <p className="text-muted-foreground text-lg">
              There are no shortened URLs yet.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg font-medium transition-all"
            >
              <FaPlus className="w-4 h-4" />
              <span>Create your first shortened URL</span>
            </Link>
          </div>
        ) : (
          <div className="-mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
            <LinksList urls={urls} />
          </div>
        )}
      </div>
    </section>
  );
}
