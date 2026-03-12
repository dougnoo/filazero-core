export class SessionAlreadyExistsError extends Error {
  constructor(sessionId: string) {
    super(
      `Medical approval request with session_id '${sessionId}' already exists`,
    );
    this.name = 'SessionAlreadyExistsError';
  }
}
