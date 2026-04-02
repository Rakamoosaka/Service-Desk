import { NextResponse } from "next/server";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TOO_MANY_REQUESTS"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  init?: ResponseInit,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    {
      status,
      headers: init?.headers,
    },
  );
}
