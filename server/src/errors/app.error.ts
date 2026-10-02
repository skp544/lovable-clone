import { StatusCodes, getReasonPhrase } from "http-status-codes";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = getReasonPhrase(StatusCodes.BAD_REQUEST)) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = getReasonPhrase(StatusCodes.UNAUTHORIZED)) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = getReasonPhrase(StatusCodes.FORBIDDEN)) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = getReasonPhrase(StatusCodes.NOT_FOUND)) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = getReasonPhrase(StatusCodes.CONFLICT)) {
    super(message, StatusCodes.CONFLICT);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY)) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}
