import mongoose, { Schema, Model } from "mongoose";

import { AnalyticsDocument } from "../types";

type AnalyticsModel = Model<AnalyticsDocument>;

// Main analytics schema
const analyticsSchema = new Schema({
  urlId: { type: String, required: true, index: true },
  slug: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  visitorId: { type: String, required: true },
  ipAddress: { type: String, required: true, index: true },
  referer: { type: String },
  userAgent: { type: String },
  location: {
    country: { type: String },
    countryCode: { type: String },
    region: { type: String },
    city: { type: String },
    isp: { type: String },
  },
});

// Compound indexes for common query patterns
analyticsSchema.index({ urlId: 1, timestamp: 1 }); // time-based queries
analyticsSchema.index({ slug: 1, timestamp: 1 }); // slug-based time queries
analyticsSchema.index({ urlId: 1, "location.country": 1 }); // geographic analytics
analyticsSchema.index({ "userAgent.browser.name": 1 }); // browser analytics
analyticsSchema.index({ "userAgent.device.deviceType": 1 }); // device type analytics
analyticsSchema.index({ "userAgent.os.name": 1 }); // OS analytics

// Prevent model redefinition errors in Next.js dev mode
export const Analytics =
  (mongoose.models.Analytics as AnalyticsModel) ||
  mongoose.model<AnalyticsDocument, AnalyticsModel>(
    "Analytics",
    analyticsSchema
  );
