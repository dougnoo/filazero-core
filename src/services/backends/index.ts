/**
 * Backend Services — Role-based barrel exports.
 *
 * Each "backend" module groups the services consumed by a specific actor:
 *   - patient-backend  → Cidadão (intake, journey)
 *   - professional-backend → Médico (clinical review, validation)
 *   - manager-backend  → Gestor (dashboards, analytics)
 *   - ubs-backend      → UBS context (shared queue, orchestration)
 *
 * All modules respect DEMO_MODE: when true, zero API calls are made.
 */

export * as patientBackend from './patient-backend';
export * as professionalBackend from './professional-backend';
export * as managerBackend from './manager-backend';
export * as ubsBackend from './ubs-backend';
