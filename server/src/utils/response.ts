import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T | null;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T | null,
  message?: string,
  status: number = StatusCodes.OK,
) => {
  const body: ApiResponse<T> = { success: true };
  if (message !== undefined) body.message = message;
  if (data !== undefined) body.data = data;

  return res.status(status).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  status: number = StatusCodes.INTERNAL_SERVER_ERROR,
) => {
  const body: ApiResponse<null> = { success: false, message, data: null };

  return res.status(status).json(body);
};
