/**
 * Dependency Injection tokens for Medical Image module
 * Using Symbols ensures type-safe injection without string literals
 */

export const MEDICAL_IMAGE_ANALYZER_TOKEN = Symbol('IMedicalImageAnalyzer');
export const RATE_LIMITER_TOKEN = Symbol('IRateLimiter');
export const RESPONSE_PARSER_TOKEN = Symbol('IResponseParser');
