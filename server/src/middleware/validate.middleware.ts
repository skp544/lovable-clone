import type { RequestHandler } from "express";
import type { ZodError, ZodType } from "zod";
import { sendError } from "../utils/response";

type RequestSource = "body" | "query" | "params";

const formatError = (error: ZodError) =>
  error.issues
    .map((issue) =>
      issue.path.length
        ? `${issue.path.join(".")}: ${issue.message}`
        : issue.message,
    )
    .join(", ");

const validate =
  (source: RequestSource, schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      sendError(res, formatError(result.error), 400);
      return;
    }

    if (source === "query") {
      // req.query is a read-only getter in Express 5, so it has to be redefined.
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[source] = result.data as never;
    }

    next();
  };

export const validateBody = (schema: ZodType) => validate("body", schema);

export const validateQuery = (schema: ZodType) => validate("query", schema);

export const validateParams = (schema: ZodType) => validate("params", schema);
