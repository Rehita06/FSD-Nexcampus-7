// Shared fetch wrapper for the NexCampus Express API.
// Base URL comes from VITE_API_URL (see .env.example). Default '/api' works with the Vite dev proxy
// and when Express serves the built app itself.
const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status = 0, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the NexCampus server. Check that the backend is running and try again.');
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. a proxy error page). Handled below.
  }

  if (!response.ok) {
    const payload = (data ?? {}) as { message?: string; errors?: Record<string, string> };
    const message =
      payload.message ??
      (response.status >= 500
        ? 'The NexCampus server is unavailable right now. Please try again shortly.'
        : `Request failed (${response.status}).`);
    throw new ApiError(message, response.status, payload.errors ?? {});
  }

  if (data === null) throw new ApiError('The server sent an unexpected response.', response.status);
  return data as T;
}
