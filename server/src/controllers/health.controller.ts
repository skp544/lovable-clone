import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response";

export const healthCheck = (_req: Request, res: Response) => {
  sendSuccess(res, { status: "ok" });
};
