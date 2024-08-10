/**
 * Custom error class for request errors
 */
export class RequestError extends Error {
  public statusCode: number;
  public contentType: string;

  constructor(message: string, statusCode: number, contentType: string) {
    super(message);
    this.statusCode = statusCode;
    this.contentType = contentType;

    // Set the prototype explicitly for custom error classes
    Object.setPrototypeOf(this, RequestError.prototype);
  }
}
