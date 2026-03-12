export class Import {
  id?: string;
  filename: string;
  totalRows?: number;
  processedRows: number;
  newLocations: number;
  newProviders: number;
  newServices: number;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;

  private constructor(data: Partial<Import>) {
    Object.assign(this, data);
  }

  static create(filename: string): Import {
    return new Import({
      filename,
      processedRows: 0,
      newLocations: 0,
      newProviders: 0,
      newServices: 0,
      status: 'processing',
      startedAt: new Date(),
    });
  }

  static reconstitute(data: Import): Import {
    return new Import(data);
  }

  complete(): void {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  fail(errorMessage: string): void {
    this.status = 'failed';
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
  }

  getDurationSeconds(): number | null {
    if (!this.completedAt) return null;
    return Math.floor(
      (this.completedAt.getTime() - this.startedAt.getTime()) / 1000,
    );
  }
}
