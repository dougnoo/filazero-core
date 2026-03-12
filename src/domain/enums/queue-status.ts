export enum QueueStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_ATTENDANCE = 'IN_ATTENDANCE',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

export const queueStatusConfig: Record<QueueStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [QueueStatus.WAITING]: { label: 'Aguardando', variant: 'outline' },
  [QueueStatus.CALLED]: { label: 'Chamado', variant: 'default' },
  [QueueStatus.IN_ATTENDANCE]: { label: 'Em Atendimento', variant: 'secondary' },
  [QueueStatus.COMPLETED]: { label: 'Finalizado', variant: 'outline' },
  [QueueStatus.NO_SHOW]: { label: 'Não Compareceu', variant: 'destructive' },
  [QueueStatus.CANCELLED]: { label: 'Cancelado', variant: 'destructive' },
};
