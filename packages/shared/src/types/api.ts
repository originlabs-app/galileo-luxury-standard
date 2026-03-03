/** Generic API success response wrapper */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/** API error response */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/** Structured API error */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** Auth tokens response */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Health check response */
export interface HealthResponse {
  status: "ok";
  version: string;
  uptime: number;
}
