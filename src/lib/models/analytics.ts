import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface for analytics data
 */
export interface AnalyticsDocument extends Document {
  urlId: string;
  slug: string;
  timestamp: Date;
  visitorId: string;
  ipAddress: string;
  referer: string;
  userAgent: {
    browser: {
      name: string;
      version: string;
      major: string;
      browserType: string;
    };
    cpu: {
      architecture: string;
    };
    device: {
      vendor: string;
      model: string;
      deviceType: string;
    };
    engine: {
      name: string;
      version: string;
    };
    os: {
      name: string;
      version: string;
    };
  };
  location: {
    country: string;
    region: string;
    isp: string;
  };
}

type AnalyticsModel = Model<AnalyticsDocument>;

// Sub-schemas to avoid conflicts with the "type" key
const browserSchema = new Schema({
  name:    { type: String },
  version: { type: String },
  major:   { type: String },
  browserType: { type: String }
}, { _id: false });

const cpuSchema = new Schema({
  architecture: { type: String }
}, { _id: false });

const deviceSchema = new Schema({
  vendor:     { type: String },
  model:      { type: String },
  deviceType: { type: String }
}, { _id: false });

const engineSchema = new Schema({
  name:    { type: String },
  version: { type: String }
}, { _id: false });

const osSchema = new Schema({
  name:    { type: String },
  version: { type: String }
}, { _id: false });

// Main analytics schema
const analyticsSchema = new Schema({
  urlId:      { type: String, required: true, index: true },
  slug:       { type: String, required: true, index: true },
  timestamp:  { type: Date,   default: Date.now, index: true },
  visitorId:  { type: String, required: true },
  ipAddress:  { type: String, required: true, index: true },
  referer:    { type: String },
  userAgent: {
    browser: browserSchema,
    cpu:     cpuSchema,
    device:  deviceSchema,
    engine:  engineSchema,
    os:      osSchema
  },
  location: {
    country: { type: String },
    region:  { type: String },
    isp:     { type: String }
  }
});

// Compound indexes for common query patterns
analyticsSchema.index({ urlId: 1, timestamp: 1 });                // time-based queries
analyticsSchema.index({ slug: 1, timestamp: 1 });                 // slug-based time queries
analyticsSchema.index({ urlId: 1, "location.country": 1 });      // geographic analytics
analyticsSchema.index({ "userAgent.browser.name": 1 });          // browser analytics
analyticsSchema.index({ "userAgent.device.deviceType": 1 });     // device type analytics
analyticsSchema.index({ "userAgent.os.name": 1 });               // OS analytics

// Prevent model redefinition errors in Next.js dev mode
export const Analytics =
  (mongoose.models.Analytics as AnalyticsModel) ||
  mongoose.model<AnalyticsDocument, AnalyticsModel>(
    "Analytics",
    analyticsSchema
  );
