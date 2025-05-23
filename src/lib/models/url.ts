import mongoose, { Schema, Document, Model } from "mongoose";
import { UrlDocument } from "../types";
import {
  browserSchema,
  cpuSchema,
  deviceSchema,
  engineSchema,
  osSchema,
} from "./analytics";

type UrlModel = Model<UrlDocument & Document>;

const urlSchema = new Schema<UrlDocument & Document>({
  originalUrl: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String },
  expiresAt: { type: Date },
  maxClicks: { type: Number },
  currentClicks: { type: Number, default: 0 },
  passwordHash: { type: String },
  ipAddress: { type: String },
  referer: { type: String },
  userAgent: {
    browser: browserSchema,
    cpu: cpuSchema,
    device: deviceSchema,
    engine: engineSchema,
    os: osSchema,
  },
  location: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
    isp: { type: String },
  },
});

// This approach prevents model redefinition errors in Next.js development mode
export const Url =
  (mongoose.models.Url as UrlModel) ||
  mongoose.model<UrlDocument & Document, UrlModel>("Url", urlSchema);
