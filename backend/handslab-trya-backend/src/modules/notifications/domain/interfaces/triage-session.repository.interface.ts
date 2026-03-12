export interface AttachmentData {
  name: string;
  filename: string;
  link: string;
  size: string;
  extension: string;
}

export interface UserSessionData {
  userId: string;
  specialty?: string;
}

export interface ITriageSessionRepository {
  findUserIdBySession(sessionId: string): Promise<UserSessionData | null>;
  completeSession(
    sessionId: string,
    attachments: AttachmentData[],
    doctorName: string,
  ): Promise<void>;
}

export const TRIAGE_SESSION_REPOSITORY_TOKEN =
  'TRIAGE_SESSION_REPOSITORY_TOKEN';
