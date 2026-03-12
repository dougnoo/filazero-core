/**
 * Platform API Configuration
 *
 * This file contains all configuration constants for the Platform API integration.
 * The Platform API is used exclusively by the medical module (médico).
 */

/**
 * Base URL for the Platform API
 * Defaults to localhost:3001/api if not configured
 * Note: The /api prefix is required as the NestJS backend uses a global prefix
 */
export const PLATFORM_API_BASE_URL =
  process.env.NEXT_PUBLIC_PLATFORM_API_BASE_URL || "http://localhost:3001/api";

/**
 * LocalStorage keys for Platform API authentication
 */
export const PLATFORM_STORAGE_KEYS = {
  ACCESS_TOKEN: "platform_accessToken",
} as const;
