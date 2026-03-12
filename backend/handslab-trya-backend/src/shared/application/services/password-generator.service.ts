import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordGeneratorService {
  /**
   * Gera uma senha temporária segura seguindo boas práticas de segurança
   * @returns string - Senha temporária de 12 caracteres
   */
  generateTemporaryPassword(): string {
    // Conjunto de caracteres para geração da senha
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    // Garantir pelo menos um caractere de cada tipo para maior segurança
    password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // Maiúscula
    password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz'); // Minúscula
    password += this.getRandomChar('0123456789'); // Número
    password += this.getRandomChar('!@#$%^&*'); // Símbolo

    // Completar com caracteres aleatórios até 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += this.getRandomChar(chars);
    }

    // Embaralhar a senha para maior aleatoriedade
    return this.shuffleString(password);
  }

  /**
   * Seleciona um caractere aleatório de uma string
   * @param charSet - Conjunto de caracteres disponíveis
   * @returns string - Caractere aleatório selecionado
   */
  private getRandomChar(charSet: string): string {
    return charSet[Math.floor(Math.random() * charSet.length)];
  }

  /**
   * Embaralha os caracteres de uma string
   * @param str - String a ser embaralhada
   * @returns string - String embaralhada
   */
  private shuffleString(str: string): string {
    return str
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
