import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError, NotFoundError } from "../errors/app.error";
import { sendError } from "../utils/response";

interface ErrorInfo {
  status: number;
  message: string;
}

const formatZodError = (error: ZodError) =>
  error.issues
    .map((issue) =>
      issue.path.length
        ? `${issue.path.join(".")}: ${issue.message}`
        : issue.message,
    )
    .join(", ");

const fromPrismaKnownError = (
  error: Prisma.PrismaClientKnownRequestError,
): ErrorInfo => {
  switch (error.code) {
    case "P2002":
      return {
        status: StatusCodes.CONFLICT,
        message: "A record with this value already exists",
      };
    case "P2025":
      return { status: StatusCodes.NOT_FOUND, message: "Record not found" };
    case "P2003":
      return {
        status: StatusCodes.BAD_REQUEST,
        message: "Related record does not exist",
      };
    case "P2000":
      return {
        status: StatusCodes.BAD_REQUEST,
        message: "Provided value is too long",
      };
    default:
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Database error",
      };
  }
};

const toErrorInfo = (error: unknown): ErrorInfo => {
  if (error instanceof AppError) {
    return { status: error.statusCode, message: error.message };
  }

  if (error instanceof ZodError) {
    return {
      status: StatusCodes.BAD_REQUEST,
      message: formatZodError(error),
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return fromPrismaKnownError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: StatusCodes.BAD_REQUEST,
      message: "Invalid data provided",
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: StatusCodes.SERVICE_UNAVAILABLE,
      message: "Database unavailable",
    };
  }

  // Errors raised by Express itself, e.g. malformed JSON or an oversized body.
  const httpError = error as { status?: number; expose?: boolean } | null;
  if (
    httpError &&
    typeof httpError.status === "number" &&
    httpError.status >= StatusCodes.BAD_REQUEST &&
    httpError.status < StatusCodes.INTERNAL_SERVER_ERROR &&
    httpError.expose
  ) {
    const message =
      error instanceof Error
        ? error.message
        : getReasonPhrase(StatusCodes.BAD_REQUEST);
    return { status: httpError.status, message };
  }

  return {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  };
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const { status, message } = toErrorInfo(error);

  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) {
    console.error(error);
  }

  sendError(res, message, status);
};
