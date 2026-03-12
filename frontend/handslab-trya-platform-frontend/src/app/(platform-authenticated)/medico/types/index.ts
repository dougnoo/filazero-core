// Re-export all medical approval request types
export * from "./medicalApprovalRequest";

// Type aliases for backward compatibility (if needed)
export type {
  MedicalApprovalRequestItem as Evaluation,
  MedicalApprovalRequestStatus as EvaluationStatus,
  ListMedicalApprovalRequestsParams as EvaluationFilters,
  ListMedicalApprovalRequestsResponse as PaginatedEvaluations,
} from "./medicalApprovalRequest";