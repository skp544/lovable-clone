import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T | null;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T | null,
  message?: string,
  status = 200,
) => {
  const body: ApiResponse<T> = { success: true };
  if (message !== undefined) body.message = message;
  if (data !== undefined) body.data = data;

  return res.status(status).json(body);
};

export const sendError = (res: Response, message: string, status = 500) => {
  const body: ApiResponse<null> = { success: false, message, data: null };

  return res.status(status).json(body);
};
