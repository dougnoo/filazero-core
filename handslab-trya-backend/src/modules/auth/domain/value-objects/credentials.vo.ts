import { InvalidCredentialsError } from '../errors/invalid-credentials.error';

export class Credentials {
  private constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}

  public static create(emailOrCpf: string, password: string): Credentials {
    if (!emailOrCpf || emailOrCpf.trim().length === 0) {
      throw new InvalidCredentialsError('Email ou CPF inválido');
    }

    if (!password || password.length < 8) {
      throw new InvalidCredentialsError(
        'Senha deve ter no mínimo 8 caracteres',
      );
    }

    return new Credentials(emailOrCpf.toLowerCase().trim(), password);
  }
}
