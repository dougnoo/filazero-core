/**
 * Features — Domain feature modules.
 *
 * Each feature groups its components, hooks, and logic:
 *   - clinical-review/  → Professional medical validation
 *   - intake/           → AI-assisted clinical intake
 *   - journey/          → Patient care journey timeline
 *   - shared/           → Cross-domain components (RiskBadge, etc.)
 */

export * from './clinical-review';
export * from './intake';
export * from './journey';
export * from './shared';
