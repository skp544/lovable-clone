import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestSource = "body" | "query" | "params";

const validate =
  (source: RequestSource, schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
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
