export class ImportResponseDto {
  success: boolean;
  importId: string;
  summary: {
    totalRows: number;
    processedRows: number;
    newLocations: number;
    newProviders: number;
    newServices: number;
  };
  geocoding: {
    pending: number;
    estimatedTimeMinutes: number;
  };
  message?: string;
}
