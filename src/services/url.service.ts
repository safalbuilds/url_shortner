import type { ShortUrl } from "../types/url.js";
import { generateShortCode } from "../utils/shortCode.js";

export const createShortUrl = (originalUrl: string): ShortUrl => {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    originalUrl,
    shortCode: generateShortCode(),
    createdAt,
    expiresAt,
  };
};
