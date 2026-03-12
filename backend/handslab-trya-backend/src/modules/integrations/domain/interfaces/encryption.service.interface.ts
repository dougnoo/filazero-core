export interface IEncryptionService {
  encrypt(text: string): Promise<string>;
  decrypt(encryptedText: string): Promise<string>;
}
