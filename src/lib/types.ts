import { Document } from "mongoose";

export interface UrlDocument extends Document {
  _id: string;
  originalUrl: string;
  slug: string;
  createdAt: Date;
  userId?: string;
  expiresAt?: Date;
  maxClicks?: number;
  currentClicks: number;
  passwordHash?: string;
  ipAddress?: string;
  referer?: string;
  userAgent?: string;
  location?: {
    country: string;
    countryCode: string;
    region: string;
    city: string;
    isp: string;
  };
}

export interface AnalyticsDocument extends Document {
  urlId: string;
  slug: string;
  timestamp: Date;
  visitorId: string;
  ipAddress: string;
  referer: string;
  userAgent: string;
  location: {
    country: string;
    countryCode: string;
    region: string;
    city: string;
    isp: string;
  };
}

export type CreateUrlResponse = {
  success: boolean;
  slug?: string;
  error?: string;
};

export type VerifyPasswordResponse = {
  success: boolean;
  originalUrl?: string;
  analyticsRecorded?: boolean;
};
interface AnalyticsMetric {
  name: string;
  count: number;
  percentage: number;
}

interface CountriesMetric extends AnalyticsMetric {
  countryCode: string;
}
export interface RecentClick {
  timestamp: Date;
  country: string;
  countryCode: string;
  browser: string;
  os: string;
  referer: string;
}

// Analytics types
export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  totalViews: number;
  timeRangeData: TimeSeriesDataPoint[];
  countries: CountriesMetric[];
  regions: CountriesMetric[];
  referers: AnalyticsMetric[];
  devices: AnalyticsMetric[];
  operatingSystems: AnalyticsMetric[];
  browsers: AnalyticsMetric[];
  recentClicks: RecentClick[];
}

export interface TimeSeriesDataPoint {
  date: string;
  visits: number;
}