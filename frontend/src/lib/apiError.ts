import { HTTPError } from "ky";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your inputs.",
  401: "Session expired. Please log in again.",
  403: "You don't have permission to do that.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Server error. Please try again.",
  502: "External service unavailable. Please try again.",
  503: "Service temporarily overloaded. Please try again in a few seconds.",
};

export async function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.clone().json()) as {
        detail?: string | unknown[];
        code?: string;
      };
      if (typeof body.detail === "string" && body.detail.length < 200) {
        return body.detail;
      }
    } catch {
      // body not JSON or already consumed
    }
    return STATUS_MESSAGES[error.response.status] ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
