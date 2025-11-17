/**
 * Shared TypeScript type definitions for API requests and responses
 */

/**
 * Generic scan request structure
 */
export interface ScanRequest {
  target: string;
  options?: {
    scanType?: string;
    timeout?: number;
    [key: string]: any;
  };
}

/**
 * Generic successful scan response structure
 */
export interface ScanResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse<T> = ScanResponse<T> | ErrorResponse;
