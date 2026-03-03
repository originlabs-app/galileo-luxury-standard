import { API_URL } from "./constants";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const json = await response.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function api<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const url = `${API_URL}${path}`;

  const headers = new Headers(fetchOptions.headers);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    // Attempt token refresh (deduplicate concurrent refresh attempts)
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().then((result) => {
        // Clear the promise only after the result has been captured,
        // so all concurrent callers get the same resolved value.
        refreshPromise = null;
        return result;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      // Retry the original request with the new token
      const newToken = getAccessToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
      }

      const retryResponse = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!retryResponse.ok) {
        throw new ApiError(retryResponse.status, await getErrorMessage(retryResponse));
      }

      return retryResponse.json() as Promise<T>;
    }

    // Refresh failed — clear tokens
    clearTokens();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    // API wraps errors as { success: false, error: { code, message } }
    if (data.error?.message) return data.error.message;
    return data.message ?? "An unexpected error occurred";
  } catch {
    return "An unexpected error occurred";
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
