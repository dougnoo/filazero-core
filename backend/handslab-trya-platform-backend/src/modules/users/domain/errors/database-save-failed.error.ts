export class DatabaseSaveFailedError extends Error {
  constructor(message: string = 'Failed to save data to database') {
    super(message);
    this.name = 'DatabaseSaveFailedError';
  }
}
