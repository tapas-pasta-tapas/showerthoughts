import { RequestError } from "@/types/error";
import { NextResponse } from "next/server";

/**
 * Create a new NextResponse for the error
 * @param error error from the request
 * @returns 500 response by default, else the error response
 */
export default function NewRequestError(error: any) {
  let errorMessage = "error: internal server error";
  let statusCode = 500;
  let contentType = "application/json";

  if (error instanceof RequestError) {
    errorMessage = error.message;
    statusCode = error.statusCode;
    contentType = error.contentType;
  }

  return new NextResponse(JSON.stringify({ message: errorMessage }), {
    status: statusCode,
    headers: {
      "Content-Type": contentType,
    },
  });
}
