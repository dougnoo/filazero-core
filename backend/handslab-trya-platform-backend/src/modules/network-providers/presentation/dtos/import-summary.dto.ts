export class ImportSummaryDto {
  id: string;
  filename: string;
  operatorId?: string;
  operatorName?: string;
  status: string;
  summary: {
    totalRows?: number;
    processedRows: number;
    newLocations: number;
    newProviders: number;
    newServices: number;
  };
  startedAt: Date;
  completedAt?: Date;
  durationSeconds?: number;
  errorMessage?: string;
  fileKey?: string;
}
