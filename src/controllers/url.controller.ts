import type { Request, Response } from "express";
import { createShortUrl, getOriginalUrl } from "../services/url.service.js";
import { createUrlSchema } from "../schemas/url.schema.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import * as repo from "../repositories/url.respository.js";
import { getBaseUrl } from "../utils/baseUrl.js";

export const shortenUrl = async (req: Request, res: Response) => {
  const result = createUrlSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(errorResponse(result.error.message));
  }

  const shortUrlData = await createShortUrl(
    result.data.url,
    getBaseUrl(req),
  );

  return res.status(201).json(
    successResponse("Short URL created successfully", {
      shortUrl: shortUrlData.short_url,
    }),
  );
};

export const customShortUrl = async (req: Request, res: Response) => {
  const { url, shortCode } = req.body;

  const result = createUrlSchema.safeParse({ url });

  if (!result.success) {
    return res.status(400).json(errorResponse(result.error.message));
  }

  const existing = await repo.findByShortCode(shortCode);

  if (existing) {
    return res.status(409).json(errorResponse("Short code already exists"));
  }

  const shortUrl = `${getBaseUrl(req)}/${shortCode}`;

  const shortUrlData = await repo.insertUrl(
    url,
    shortCode,
    shortUrl,
  );

  return res.status(201).json(
    successResponse("Custom short URL created successfully", {
      shortUrl: shortUrlData.short_url,
    }),
  );
};

export const redirectToOriginalUrl = async (
  req: Request,
  res: Response,
) => {
  const shortCode = req.params.shortCode as string;

  if (!shortCode) {
    return res.status(400).json(errorResponse("Short code is required"));
  }

  const url = await getOriginalUrl(shortCode);

  await repo.updateClickCount(shortCode);

  return res.redirect(url.original_url);
};

export const getStats = async (req: Request, res: Response) => {
  const shortCode = req.params.shortCode as string;

  if (!shortCode) {
    return res.status(400).json(errorResponse("Short code is required"));
  }

  const url = await repo.findByShortCode(shortCode);

  if (!url) {
    return res.status(404).json(errorResponse("Short URL not found"));
  }

  return res.json(
    successResponse("Statistics fetched successfully", url),
  );
};