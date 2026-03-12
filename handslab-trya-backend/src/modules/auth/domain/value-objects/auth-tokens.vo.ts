export class AuthTokens {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly idToken: string,
    public readonly expiresIn: number,
  ) {}

  public static create(
    accessToken: string,
    refreshToken: string,
    idToken: string,
    expiresIn: number,
  ): AuthTokens {
    return new AuthTokens(accessToken, refreshToken, idToken, expiresIn);
  }
}
