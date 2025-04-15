export interface UrlDocument {
  _id: string;
  originalUrl: string;
  slug: string;
  createdAt: Date;
  userId?: string;
  expiresAt?: Date;
  maxClicks?: number;
  currentClicks: number;
  passwordHash?: string;
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

// Analytics types
export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  totalViews: number;
  timeRangeData: TimeSeriesDataPoint[];
  countries: CountryData[];
  regions: RegionData[];
  referers: RefererData[];
  devices: DeviceData[];
  operatingSystems: OSData[];
  browsers: BrowserData[];
  recentClicks: RecentClickData[];
}

export interface TimeSeriesDataPoint {
  date: string;
  visits: number;
}

export interface CountryData {
  name: string;
  count: number;
  percentage: number;
}

export interface RegionData {
  name: string;
  count: number;
  percentage: number;
}

export interface RefererData {
  name: string;
  count: number;
  percentage: number;
}

export interface DeviceData {
  name: string;
  count: number;
  percentage: number;
}

export interface OSData {
  name: string;
  count: number;
  percentage: number;
}

export interface BrowserData {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentClickData {
  timestamp: string | Date;
  country: string;
  browser: string;
  os: string;
  referer: string;
}
