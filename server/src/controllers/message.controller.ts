import type { Request, Response } from "express";
import { getMessagesByProjectId } from "../services/message.service";
import { sendSuccess } from "../utils/response";

export const getProjectMessages = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const messages = await getMessagesByProjectId(req.params.id);
  sendSuccess(res, messages);
};
