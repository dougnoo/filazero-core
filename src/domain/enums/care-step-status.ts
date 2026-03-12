export enum CareStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  BLOCKED = 'BLOCKED',
}

export const careStepStatusConfig: Record<CareStepStatus, { label: string; icon: string }> = {
  [CareStepStatus.PENDING]: { label: 'Pendente', icon: 'circle' },
  [CareStepStatus.IN_PROGRESS]: { label: 'Em andamento', icon: 'loader' },
  [CareStepStatus.COMPLETED]: { label: 'Concluído', icon: 'check-circle' },
  [CareStepStatus.SKIPPED]: { label: 'Pulado', icon: 'skip-forward' },
  [CareStepStatus.BLOCKED]: { label: 'Bloqueado', icon: 'alert-circle' },
};
