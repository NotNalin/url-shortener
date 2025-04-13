// lib/types.ts
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
};
