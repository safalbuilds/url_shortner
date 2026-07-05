import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import * as repo from "../repositories/url.respository.js";

export const fetchAll = async (req: Request, res: Response) => {
  const key = req.query.key;

  if (key !== process.env.KEY) {
    return res.status(401).json(errorResponse("Key not matched"));
  }

  const urls = await repo.getAll();

  return res.json(successResponse("URLs fetched successfully", urls));
};

export const deleteRow = async (req: Request, res: Response) => {
  const key = req.query.key;
  const shortCode = req.params.shortcode as string;

  if (key !== process.env.KEY) {
    return res.status(401).json(errorResponse("Key not matched"));
  }

  const deleted = await repo.deleteRow(shortCode);

  if (!deleted) {
    return res.status(404).json(errorResponse("Short URL not found"));
  }

  return res.json(
    successResponse("Short URL deleted successfully", deleted),
  );
};
