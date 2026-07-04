import type { Request, Response } from "express";
import path from "path";

const README_PATH = path.join(process.cwd(), "README.md");

export const getDocs = (req: Request, res: Response) => {
  res.sendFile(README_PATH, {
    headers: { "Content-Type": "text/markdown" },
  });
};
