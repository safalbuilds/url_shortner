import { generateShortCode } from "../utils/shortCode.js";
import * as repo from "../repositories/url.respository.js";
import { AppError } from "../errors/AppError.js";

export const createShortUrl = async (
  originalUrl: string,
  baseUrl: string,
) => {
  let shortCode: string;

  do {
    shortCode = generateShortCode();
  } while (await repo.findByShortCode(shortCode));

  const shortUrl = `${baseUrl}/${shortCode}`;

  return await repo.insertUrl(originalUrl, shortCode, shortUrl);
};

export const getOriginalUrl = async (shortCode: string) => {
  const url = await repo.findByShortCode(shortCode);

  if (!url) {
    throw new AppError(404, "Short URL does not exist");
  }

  if (new Date(url.expires_at) < new Date()) {
    throw new AppError(410, "This short URL has expired");
  }

  return url;
};