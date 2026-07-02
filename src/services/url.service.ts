import { generateShortCode } from "../utils/shortCode.js";
import * as repo from "../repositories/url.respository.js";

export const createShortUrl = async (originalUrl: string) => {

  let shortCode: string;

  do {
    shortCode = generateShortCode();
  } while (await repo.findByShortCode(shortCode));

  return await repo.insertUrl(originalUrl, shortCode);
};

export const getOriginalUrl = async (shortCode: string) => {
  return await repo.findByShortCode(shortCode)
}
