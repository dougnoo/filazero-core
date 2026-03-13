/**
 * Services — Barrel export.
 *
 * Direct service imports for pages that need specific functions.
 * For role-organized access, use `@/services/backends`.
 */
export { authService } from './auth-service';
export * from './intake-service';
export * from './clinical-review-service';
export * from './journey-service';
export * from './dashboard-service';
export * from './case-service';
