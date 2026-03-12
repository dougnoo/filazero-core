export class UnauthorizedApprovalError extends Error {
  constructor(doctorId: string, assignedDoctorId: string) {
    super(
      `Doctor ${doctorId} is not authorized to approve this request. Request is assigned to doctor ${assignedDoctorId}.`,
    );
    this.name = 'UnauthorizedApprovalError';
  }
}
