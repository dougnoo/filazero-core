import csv from 'csv-parser';
import * as iconv from 'iconv-lite';
import { Readable } from 'stream';
import { BadRequestException } from '@nestjs/common';

export interface ClaimRow {
  operadora: string;          // Nome da Operadora
  rede: string;               // Nome da Rede
  prestador: string;          // Nome do Prestador
  elementoDivulgacao: string; // Elemento de Divulgação (Especialidade)
  sinistro: string;           // Sinistro (valor)
}

export interface ClaimsParseResult {
  rows: ClaimRow[];
  headers: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors: string[];
  };
}

/**
 * Parser específico para CSV de sinistros da AMIL
 * Trata encoding Latin-1 e estrutura específica do arquivo
 */
export class CsvClaimsParserHelper {
  /**
   * Parse CSV de sinistros com encoding Latin-1
   * Formato esperado: separador `;`, colunas conforme template AMIL
   */
  static async parseClaimsCSV(buffer: Buffer): Promise<ClaimsParseResult> {
    return new Promise((resolve, reject) => {
      const results: ClaimRow[] = [];
      const errors: string[] = [];
      let headers: string[] = [];
      let lineNumber = 0;
      let validRows = 0;

      try {
        // Detecta encoding - tenta Latin-1 primeiro, fallback UTF-8
        const decoded = this.detectAndDecode(buffer);
        const stream = Readable.from(decoded);

        stream
          .pipe(
            csv({
              separator: ';',
              skipLines: 0,
              headers: false, // Vamos processar manualmente pois o header tem colunas vazias
              strict: false,
              mapValues: ({ value }) => (value || '').trim(),
            }),
          )
          .on('data', (row: any) => {
            lineNumber++;

            // Linha 1 = Headers
            if (lineNumber === 1) {
              headers = Object.values(row);
              return;
            }

            try {
              const parsed = this.parseRow(row, headers);
              if (parsed) {
                results.push(parsed);
                validRows++;
              }
            } catch (error) {
              errors.push(`Line ${lineNumber}: ${error.message}`);
            }
          })
          .on('end', () => {
            resolve({
              rows: results,
              headers,
              stats: {
                totalRows: lineNumber - 1, // Exclude header
                validRows,
                invalidRows: lineNumber - 1 - validRows,
                errors,
              },
            });
          })
          .on('error', (error) => {
            reject(
              new BadRequestException(
                `Erro ao processar CSV de sinistros: ${error.message}`,
              ),
            );
          });
      } catch (error) {
        reject(
          new BadRequestException(
            `Erro ao decodificar arquivo: ${error.message}`,
          ),
        );
      }
    });
  }

  /**
   * Detecta encoding e decodifica buffer
   */
  private static detectAndDecode(buffer: Buffer): string {
    // Tenta Latin-1 (Windows-1252) primeiro - comum em exports do Brasil
    try {
      const decoded = iconv.decode(buffer, 'latin1');
      // Verifica se tem caracteres válidos
      if (decoded.includes('Operadora') || decoded.includes('Prestador')) {
        return decoded;
      }
    } catch {
      // Ignora erro e tenta UTF-8
    }

    // Fallback para UTF-8
    return buffer.toString('utf-8');
  }

  /**
   * Parse individual row baseado nas 5 colunas necessárias
   */
  private static parseRow(row: any, headers: string[]): ClaimRow | null {
    const values = Object.values(row) as string[];

    // Mapeamento de índices das 5 colunas
    const indices = this.findColumnIndices(headers);

    // Validação básica
    const prestador = values[indices.prestador];
    const sinistro = values[indices.sinistro];

    if (!prestador || !sinistro) {
      return null; // Linha inválida
    }

    return {
      operadora: this.cleanText(values[indices.operadora] || ''),
      rede: this.cleanText(values[indices.rede] || ''),
      prestador: this.cleanText(prestador),
      elementoDivulgacao: this.cleanText(values[indices.elementoDivulgacao] || ''),
      sinistro: this.parseDecimal(sinistro),
    };
  }

  /**
   * Encontra índices das colunas no header
   */
  private static findColumnIndices(headers: string[]): {
    operadora: number;
    rede: number;
    prestador: number;
    elementoDivulgacao: number;
    sinistro: number;
  } {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const findIndex = (possibleNames: string[]): number => {
      for (let i = 0; i < headers.length; i++) {
        const normalizedHeader = normalize(headers[i] || '');
        if (possibleNames.some((name) => normalizedHeader.includes(name))) {
          return i;
        }
      }
      return -1;
    };

    return {
      operadora: findIndex(['operadora', 'nome da operadora']),
      rede: findIndex(['rede', 'nome da rede']),
      prestador: findIndex(['prestador', 'nome do prestador']),
      elementoDivulgacao: findIndex(['elemento', 'divulgacao', 'elemento de divulgacao']),
      sinistro: findIndex(['sinistro', 'valor']),
    };
  }

  /**
   * Limpa texto removendo caracteres estranhos de encoding
   */
  private static cleanText(text: string): string {
    return text
      .replace(/�/g, '') // Remove caracteres de encoding quebrado
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }



  /**
   * Parse decimal no formato brasileiro (1.234,56 ou 1234,5600)
   */
  private static parseDecimal(value: string): string {
    if (!value) return '0.00';

    return value
      .replace(/\./g, '') // Remove separador de milhar
      .replace(',', '.'); // Troca vírgula por ponto
  }



  /**
   * Valida estrutura do CSV de sinistros
   */
  static validateClaimsStructure(headers: string[]): {
    valid: boolean;
    missingColumns: string[];
  } {
    const requiredColumns = [
      'Operadora',
      'Rede',
      'Prestador',
      'Elemento de Divulgação', // Especialidade
      'Sinistro',
    ];

    const missingColumns: string[] = [];

    for (const required of requiredColumns) {
      const found = headers.some(
        (h) =>
          h &&
          h
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(
              required
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''),
            ),
      );
      if (!found) {
        missingColumns.push(required);
      }
    }

    return {
      valid: missingColumns.length === 0,
      missingColumns,
    };
  }
}
