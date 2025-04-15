"use client";

import React, { useEffect, useState } from "react";
import { AnalyticsData, RecentClickData } from "@/lib/types";
import {
  FaChartBar,
  FaLink,
  FaMousePointer,
  FaClock,
  FaDesktop,
  FaMobileAlt,
  FaTabletAlt,
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaInternetExplorer,
  FaOpera,
  FaGlobe,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import dynamic from "next/dynamic";

// Add CSS variables for chart colors that work in both light and dark mode
const chartStyles = {
  "--chart-primary": "var(--primary, #10b981)",
  "--chart-blue": "var(--blue, #3b82f6)",
  "--chart-amber": "var(--amber, #f59e0b)",
  "--chart-purple": "var(--purple, #8b5cf6)",
  "--chart-red": "var(--red, #ef4444)",
  "--chart-visits": "var(--orange, #f97316)",
  "--chart-visitors": "var(--cyan, #06b6d4)",
} as React.CSSProperties;

// Dynamically import the ClientWorldMap component with no SSR
const ClientWorldMap = dynamic(() => import("./ClientWorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-80 border border-border/20 rounded-lg overflow-hidden bg-background">
      Loading map...
    </div>
  ),
});

interface AnalyticsDashboardProps {
  slug: string;
}

/**
 * Dashboard to display URL analytics data
 */
export default function AnalyticsDashboard({ slug }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [activeLocationTab, setActiveLocationTab] = useState("country");
  const [activeDeviceTab, setActiveDeviceTab] = useState("device");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Clear cache by adding timestamp to avoid browser caching
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/analytics?slug=${slug}&timeRange=${timeRange}&t=${timestamp}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError("Unable to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug, timeRange]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          No analytics data available for this link yet
        </p>
      </div>
    );
  }

  // Extract necessary data for the simplified chart
  const rawTimeSeriesData = analytics.timeRangeData;

  // Create data for the combined visits and visitors chart
  const combinedChartData = analytics.timeRangeData.map((item) => {
    // Create an approximated unique visitors number based on the total ratio
    const approximateVisitors =
      analytics.uniqueVisitors > 0
        ? Math.round(
            item.visits * (analytics.uniqueVisitors / analytics.totalVisits),
          )
        : 0;

    // Parse the date
    const date = new Date(item.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Format the display date
    let displayDate = item.date;
    if (!item.date.includes(":")) {
      // Skip for hourly data
      if (date.toDateString() === today.toDateString()) {
        displayDate = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        displayDate = "Yesterday";
      } else {
        displayDate = date.toLocaleDateString(undefined, { weekday: "short" });
      }
    }

    return {
      ...item,
      date: displayDate,
      rawDate: item.date,
      visitors: approximateVisitors,
      tooltipLabel: formatTooltipDate(item.date, timeRange),
    };
  });

  // Sort data chronologically
  combinedChartData.sort((a, b) => {
    const dateA = new Date(a.rawDate);
    const dateB = new Date(b.rawDate);
    return dateA.getTime() - dateB.getTime();
  });

  // Format referrer for display
  const formatReferrer = (referrer: string) => {
    if (!referrer || referrer === "Direct") return "Direct";
    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return referrer;
    }
  };

  // Format device names for better display
  const formatDeviceName = (name: string) => {
    if (!name) return "Unknown";
    const deviceMap: Record<string, string> = {
      desktop: "Desktop",
      mobile: "Mobile",
      tablet: "Tablet",
      smartphone: "Smartphone",
      unknown: "Unknown",
    };
    return (
      deviceMap[name.toLowerCase()] ||
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    );
  };


  // Recent clicks data
  const recentClicksData = analytics.recentClicks.map(
    (click: RecentClickData, i: number) => {
      const date = new Date(click.timestamp);
      return {
        id: i + 1,
        date: formatTooltipDate(date.toISOString(), timeRange),
        time: date.toLocaleTimeString(),
        country: click.country,
        browser: click.browser,
        os: click.os,
        referrer:
          click.referer === "Direct" ? "Direct" : formatReferrer(click.referer),
      };
    },
  );
  // Get device icon based on device name
  const getDeviceIcon = (name: string) => {
    const deviceName = name.toLowerCase();
    if (deviceName.includes("desktop"))
      return <FaDesktop className="inline mr-2 text-blue-400" />;
    if (deviceName.includes("mobile") || deviceName.includes("smartphone"))
      return <FaMobileAlt className="inline mr-2 text-green-400" />;
    if (deviceName.includes("tablet"))
      return <FaTabletAlt className="inline mr-2 text-purple-400" />;
    return <FaDesktop className="inline mr-2 text-gray-400" />;
  };

  // Get browser icon based on browser name
  const getBrowserIcon = (name: string) => {
    const browserName = name.toLowerCase();
    if (browserName.includes("chrome"))
      return <FaChrome className="inline mr-2 text-blue-400" />;
    if (browserName.includes("firefox"))
      return <FaFirefox className="inline mr-2 text-orange-400" />;
    if (browserName.includes("safari"))
      return <FaSafari className="inline mr-2 text-blue-300" />;
    if (browserName.includes("edge"))
      return <FaEdge className="inline mr-2 text-teal-400" />;
    if (browserName.includes("explorer"))
      return <FaInternetExplorer className="inline mr-2 text-blue-500" />;
    if (browserName.includes("opera"))
      return <FaOpera className="inline mr-2 text-red-400" />;
    return <FaGlobe className="inline mr-2 text-gray-400" />;
  };

  // Get OS icon based on OS name
  const getOSIcon = (name: string) => {
    const osName = name.toLowerCase();
    if (osName.includes("windows"))
      return <FaWindows className="inline mr-2 text-blue-400" />;
    if (osName.includes("mac") || osName.includes("ios"))
      return <FaApple className="inline mr-2 text-gray-300" />;
    if (osName.includes("linux"))
      return <FaLinux className="inline mr-2 text-yellow-400" />;
    if (osName.includes("android"))
      return <FaAndroid className="inline mr-2 text-green-400" />;
    return <FaDesktop className="inline mr-2 text-gray-400" />;
  };

  return (
    <div className="space-y-6" style={chartStyles}>
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">/{slug}</span>
          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
            Analytics
          </span>
        </h2>
        <DateRangePicker currentRange={timeRange} onChange={setTimeRange} />
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Visits"
          value={analytics.totalVisits}
          icon={<FaChartBar className="w-5 h-5" />}
          color="primary"
        />
        <MetricCard
          title="Unique Visitors"
          value={analytics.uniqueVisitors}
          icon={<FaMousePointer className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Referrer Sources"
          value={analytics.referers.length}
          icon={<FaLink className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Combined Visits & Visitors Chart - Pass simplified props */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          <FaChartBar className="w-4 h-4 mr-2 text-primary" />
          Traffic Overview
        </h3>
        <div className="h-72 w-full">
          <CombinedTrafficChart
            rawData={rawTimeSeriesData} // Pass raw data from API
            timeRange={timeRange}
            totalVisits={analytics.totalVisits}
            uniqueVisitors={analytics.uniqueVisitors}
          />
        </div>
      </div>

      {/* Recent Clicks Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          <FaMousePointer className="w-4 h-4 mr-2 text-primary" />
          Recent Clicks
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Country
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Browser
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Operating System
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Referrer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {recentClicksData.map(
                (click: {
                  id: number;
                  date: string;
                  time: string;
                  country: string;
                  browser: string;
                  os: string;
                  referrer: string;
                }) => (
                  <tr key={click.id} className="hover:bg-muted/5">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">
                        {click.date.split("(")[0]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {click.time}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center">
                        <span className="mr-2">
                          {getCountryFlag(click.country)}
                        </span>
                        {click.country}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center">
                        {getBrowserIcon(click.browser)}
                        {click.browser}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center">
                        {getOSIcon(click.os)}
                        {click.os}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {click.referrer === "Direct" ? (
                        <span className="flex items-center text-muted-foreground">
                          Direct Traffic
                        </span>
                      ) : (
                        <span className="truncate max-w-[200px] block">
                          {click.referrer}
                        </span>
                      )}
                    </td>
                  </tr>
                ),
              )}
              {recentClicksData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No recent clicks available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Locations Section */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          <FaGlobe className="w-4 h-4 mr-2 text-blue-500" />
          Locations
        </h3>

        <div className="flex mb-6 border-b border-border">
          <button
            className={`px-4 py-2 ${
              activeLocationTab === "country"
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveLocationTab("country")}
          >
            Country
          </button>
          <button
            className={`px-4 py-2 ${
              activeLocationTab === "region"
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveLocationTab("region")}
          >
            Region
          </button>
        </div>

        {/* Map and Location Data in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* World Map */}
          <div className="lg:col-span-1">
            <div className="border border-border/30 rounded-lg overflow-hidden bg-card h-[300px] sm:h-[380px]">
              <ClientWorldMap countries={analytics.countries} />
            </div>
          </div>

          {/* Country/Region Table */}
          <div className="h-[300px] sm:h-[380px] overflow-y-auto scrollbar-thin lg:col-span-1">
            <table className="min-w-full">
              <thead className="bg-muted/30 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Name
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {(activeLocationTab === "country"
                  ? analytics.countries
                  : analytics.regions
                ).map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {activeLocationTab === "country" && (
                        <span className="mr-2">
                          {getCountryFlag(item.name)}
                        </span>
                      )}
                      {item.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">
                        ({item.percentage}%)
                      </span>
                      <div className="w-full bg-muted/20 h-1.5 rounded-full mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
                {(activeLocationTab === "country"
                  ? analytics.countries.length === 0
                  : analytics.regions.length === 0) && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No location data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Referrers Section - Table Only */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          <FaLink className="w-4 h-4 mr-2 text-blue-500" />
          Referrer Sources
        </h3>
        <div className="h-64 overflow-y-auto scrollbar-thin">
          <table className="min-w-full">
            <thead className="bg-muted/30 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Source
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {analytics.referers.map((referer, index) => (
                <tr key={index} className="hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3">
                    {referer.name === "(None)" ? (
                      <span className="flex items-center">
                        <span className="inline-block w-4 h-4 mr-2 bg-blue-400/20 text-blue-400 rounded-full flex items-center justify-center">
                          <FaLink className="w-2 h-2" />
                        </span>
                        Direct Traffic
                      </span>
                    ) : (
                      <a
                        href={
                          referer.name.startsWith("http")
                            ? referer.name
                            : `https://${referer.name}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary truncate max-w-xs flex items-center"
                      >
                        <span className="inline-block w-4 h-4 mr-2 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center">
                          <FaLink className="w-2 h-2" />
                        </span>
                        {referer.name}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium">
                      {referer.count.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      ({referer.percentage}%)
                    </span>
                    <div className="w-full bg-muted/20 h-1.5 rounded-full mt-1">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${referer.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
              {analytics.referers.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No referrer data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Information with Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Devices with Tabs */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <FaDesktop className="w-4 h-4 mr-2 text-primary" />
              Devices
            </h3>
          </div>

          <div className="flex mb-4 border-b border-border">
            <button
              className={`px-4 py-2 ${
                activeDeviceTab === "device"
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveDeviceTab("device")}
            >
              Device Type
            </button>
            <button
              className={`px-4 py-2 ${
                activeDeviceTab === "os"
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveDeviceTab("os")}
            >
              Operating System
            </button>
          </div>

          <div className="space-y-4">
            {(activeDeviceTab === "device"
              ? analytics.devices
              : analytics.operatingSystems
            ).map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base flex items-center">
                    {activeDeviceTab === "device" ? (
                      <>
                        {getDeviceIcon(item.name)}
                        {formatDeviceName(item.name)}
                      </>
                    ) : (
                      <>
                        {getOSIcon(item.name)}
                        {item.name}
                      </>
                    )}
                  </span>
                  <span className="font-semibold">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted/20 h-1.5 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${
                      activeDeviceTab === "device"
                        ? item.name.toLowerCase().includes("desktop")
                          ? "bg-blue-500"
                          : item.name.toLowerCase().includes("mobile")
                            ? "bg-green-500"
                            : "bg-purple-500"
                        : item.name.toLowerCase().includes("windows")
                          ? "bg-blue-500"
                          : item.name.toLowerCase().includes("mac") ||
                              item.name.toLowerCase().includes("ios")
                            ? "bg-gray-400"
                            : item.name.toLowerCase().includes("linux")
                              ? "bg-yellow-500"
                              : item.name.toLowerCase().includes("android")
                                ? "bg-green-500"
                                : "bg-purple-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {(activeDeviceTab === "device"
              ? analytics.devices
              : analytics.operatingSystems
            ).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No {activeDeviceTab === "device" ? "device" : "OS"} data
                available
              </div>
            )}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <FaChrome className="w-4 h-4 mr-2 text-primary" />
              Browsers
            </h3>
          </div>

          <div className="space-y-4">
            {analytics.browsers.map((browser, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base flex items-center">
                    {getBrowserIcon(browser.name)}
                    {browser.name}
                  </span>
                  <span className="font-semibold">
                    {browser.count.toLocaleString()} ({browser.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted/20 h-1.5 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${
                      browser.name.toLowerCase().includes("chrome")
                        ? "bg-blue-500"
                        : browser.name.toLowerCase().includes("firefox")
                          ? "bg-orange-500"
                          : browser.name.toLowerCase().includes("safari")
                            ? "bg-blue-300"
                            : browser.name.toLowerCase().includes("edge")
                              ? "bg-teal-500"
                              : browser.name.toLowerCase().includes("explorer")
                                ? "bg-blue-600"
                                : browser.name.toLowerCase().includes("opera")
                                  ? "bg-red-500"
                                  : "bg-purple-500"
                    }`}
                    style={{ width: `${browser.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {analytics.browsers.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No browser data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple metric card component with icon
 */
function MetricCard({
  title,
  value,
  icon,
  color = "primary",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "primary" | "emerald" | "blue" | "purple" | "amber";
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">{title}</h3>
        <div className={`${colorClasses[color]} p-2 rounded-full`}>{icon}</div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold mt-2">
        {value.toLocaleString() || 0}
      </p>
    </div>
  );
}

/**
 * Date range picker component
 */
function DateRangePicker({
  currentRange,
  onChange,
}: {
  currentRange: string;
  onChange: (range: string) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <FaClock className="text-primary w-4 h-4" />
      <select
        value={currentRange}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
      >
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="all">All time</option>
      </select>
    </div>
  );
}

/**
 * Simplified combined traffic chart showing both visits and visitors
 */
function CombinedTrafficChart({
  rawData,
  timeRange,
  totalVisits,
  uniqueVisitors,
}: {
  rawData: { date: string; visits: number }[];
  timeRange: string;
  totalVisits: number;
  uniqueVisitors: number;
}) {
  const { startDate, endDate } = calculateClientDateRange(timeRange);

  // Create a map for quick lookup of visits by date/hour
  const visitsMap = new Map<string, number>();
  rawData.forEach((item) => {
    visitsMap.set(item.date, item.visits);
  });

  // Generate the full series of dates/hours for the selected range
  const chartData = [];
  const current = new Date(startDate);

  if (timeRange === "24h") {
    // Hourly data for 24h view
    while (current <= endDate) {
      const hourStr = current.toISOString().slice(0, 13) + ":00:00.000Z";
      const displayHour = `${current.getHours().toString().padStart(2, "0")}:00`;
      const visits = visitsMap.get(hourStr) || 0;
      chartData.push({
        date: displayHour,
        rawDate: hourStr, // Keep ISO string for sorting/tooltips
        visits,
      });
      current.setHours(current.getHours() + 1);
    }
  } else {
    // Daily data for other views
    // Create a copy of endDate to avoid modifying the original
    const compareEndDate = new Date(endDate);

    // We need to ensure the loop includes the current day
    // So we'll add a day to our comparison end date
    compareEndDate.setDate(compareEndDate.getDate() + 1);

    while (current < compareEndDate) {
      const dateStr = current.toISOString().split("T")[0];
      const visits = visitsMap.get(dateStr) || 0;

      // Always use the date formatting, never "Today" or "Yesterday"
      const displayDate = formatChartDate(dateStr, timeRange);

      chartData.push({
        date: displayDate,
        rawDate: dateStr, // Keep ISO string for sorting/tooltips
        visits,
      });
      current.setDate(current.getDate() + 1);
    }
  }

  // Calculate approximate visitors for each data point
  const visitorRatio = totalVisits > 0 ? uniqueVisitors / totalVisits : 0;
  const completeChartData = chartData.map((item) => ({
    ...item,
    visitors: Math.round(item.visits * visitorRatio),
    tooltipLabel: formatTooltipDate(item.rawDate, timeRange),
  }));

  // Ensure data exists
  if (!completeChartData || completeChartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No traffic data available yet
      </div>
    );
  }

  // Add a dummy point if only one point exists to make chart visible
  if (completeChartData.length === 1) {
    const firstPoint = completeChartData[0];
    const nextDate = new Date(firstPoint.rawDate);
    if (timeRange === "24h") {
      nextDate.setHours(nextDate.getHours() + 1);
      const hourStr = nextDate.toISOString().slice(0, 13) + ":00:00.000Z";
      const displayHour = `${nextDate.getHours().toString().padStart(2, "0")}:00`;
      completeChartData.push({
        date: displayHour,
        rawDate: hourStr,
        visits: 0,
        visitors: 0,
        tooltipLabel: formatTooltipDate(hourStr, timeRange),
      });
    } else {
      nextDate.setDate(nextDate.getDate() + 1);
      const dateStr = nextDate.toISOString().split("T")[0];
      completeChartData.push({
        date: formatChartDate(dateStr, timeRange),
        rawDate: dateStr,
        visits: 0,
        visitors: 0,
        tooltipLabel: formatTooltipDate(dateStr, timeRange),
      });
    }
  }

  // Calculate appropriate x-axis tick interval
  let xAxisInterval = 0; // Show all ticks by default
  if (timeRange === "30d") {
    xAxisInterval = 4; // Show every 4-5 days (about 6-7 ticks)
  } else if (timeRange === "90d") {
    xAxisInterval = 14; // Show every 2 weeks (about 6-7 ticks)
  } else if (completeChartData.length > 10) {
    xAxisInterval = Math.ceil(completeChartData.length / 10);
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={completeChartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--chart-visits)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--chart-visits)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--chart-visitors)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--chart-visitors)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          opacity={0.3}
        />
        <XAxis
          dataKey="date"
          padding={{ left: 20, right: 20 }}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
          interval={xAxisInterval}
          height={50}
          angle={-30}
          textAnchor="end"
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
          allowDecimals={false}
          domain={[0, (dataMax: number) => Math.max(5, dataMax * 1.1)]}
          width={35}
        />
        <RechartsTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-card border border-border shadow-md text-foreground p-3 rounded-md">
                  <p className="text-sm font-medium">{data.tooltipLabel}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-orange-500 font-medium flex items-center text-sm">
                      <FaChartBar className="mr-1 h-3 w-3" />
                      {data.visits} {data.visits === 1 ? "visit" : "visits"}
                    </p>
                    <p className="text-cyan-500 font-medium flex items-center text-sm">
                      <FaMousePointer className="mr-1 h-3 w-3" />
                      {data.visitors}{" "}
                      {data.visitors === 1 ? "visitor" : "visitors"}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="visits"
          name="Visits"
          stroke="var(--chart-visits)"
          fillOpacity={1}
          strokeWidth={2}
          activeDot={{
            r: 6,
            fill: "var(--background)",
            stroke: "var(--chart-visits)",
          }}
          fill="url(#colorVisits)"
        />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Visitors"
          stroke="var(--chart-visitors)"
          fillOpacity={1}
          strokeWidth={2}
          activeDot={{
            r: 6,
            fill: "var(--background)",
            stroke: "var(--chart-visitors)",
          }}
          fill="url(#colorVisitors)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Format date for chart X-axis display
 */
function formatChartDate(dateStr: string, timeRange: string): string {
  // Check if this is an hour format (for 24h timeframe)
  if (dateStr.includes(":")) {
    return dateStr;
  }

  // Try to parse the date string into a Date object
  let date;
  try {
    date = new Date(dateStr);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if not valid
    }
  } catch {
    return dateStr; // Fall back to original string on error
  }

  // Format based on time range
  switch (timeRange) {
    case "7d":
      // For 7 days, show abbreviated weekday name
      return date.toLocaleDateString(undefined, { weekday: "short" });
    case "30d":
      // For 30 days, show day/month without year
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });
    case "90d":
      // For 90 days, show day/month
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });
    case "all":
      // For all time, use adaptive formatting
      const today = new Date();
      const diffMonths =
        (today.getFullYear() - date.getFullYear()) * 12 +
        today.getMonth() -
        date.getMonth();

      if (diffMonths > 6) {
        // If more than 6 months, show month/year
        return date.toLocaleDateString(undefined, {
          month: "short",
          year: "2-digit",
        });
      } else {
        // Otherwise show month/day
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }
    default:
      // Default format
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
  }
}

/**
 * Format tooltip date for display
 */
function formatTooltipDate(dateStr: string, timeRange: string): string {
  // Handle hourly display for 24h
  if (timeRange === "24h" && dateStr.includes(":")) {
    const today = new Date();
    return `${today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`;
  }

  // Try to parse the date
  let date;
  try {
    date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid Date";
  } catch {
    return "Invalid Date";
  }

  // Format the date with full details
  const fullDate = date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return fullDate;
}

/**
 * Helper function to calculate client-side date range.
 * This avoids passing Date objects from server components.
 */
function calculateClientDateRange(timeRange: string): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();

  // Set endDate to end of current day to ensure today is included
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);

  switch (timeRange) {
    case "24h":
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 89);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "all":
      // For 'all', we need a reasonable start date for the client
      // Let's default to 90 days, the API handles the actual range
      startDate.setDate(startDate.getDate() - 89);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
  }
  return { startDate, endDate };
}

/**
 * Get country flag emoji from country name
 */
function getCountryFlag(countryName: string): string {
  // ISO 3166-1 alpha-2 codes for common countries
  const countryCodes: Record<string, string> = {
    "United States": "US",
    "United Kingdom": "GB",
    Canada: "CA",
    Australia: "AU",
    Germany: "DE",
    France: "FR",
    Italy: "IT",
    Spain: "ES",
    Japan: "JP",
    China: "CN",
    India: "IN",
    Brazil: "BR",
    Mexico: "MX",
    Russia: "RU",
    Netherlands: "NL",
    Sweden: "SE",
    Norway: "NO",
    Unknown: "unknown",
  };

  // Get the country code or default to empty
  const code = countryCodes[countryName] || "";

  // Convert country code to flag emoji (works in modern browsers)
  if (code === "unknown" || !code) return "🌍";

  // For valid country codes, convert to regional indicator symbols
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
