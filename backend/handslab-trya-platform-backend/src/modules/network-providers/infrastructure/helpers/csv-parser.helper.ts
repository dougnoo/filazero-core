import csv from 'csv-parser';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';
import { BadRequestException } from '@nestjs/common';
import { FileValidatorHelper } from './file-validator.helper';

export interface ParseResult {
  rows: Record<string, string>[];
  headers: string[];
  columnMapping: Record<string, string>;
}

export class CsvParserHelper {
  static async parseCSV(buffer: Buffer): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const results: Record<string, string>[] = [];
      let headers: string[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('headers', (h: string[]) => {
          headers = h;
        })
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Valida colunas
          const validation = FileValidatorHelper.validateColumns(headers);
          
          if (validation.forbiddenColumns.length > 0) {
            reject(
              new BadRequestException(
                FileValidatorHelper.formatForbiddenColumnsError(validation.forbiddenColumns),
              ),
            );
            return;
          }

          if (!validation.valid) {
            reject(
              new BadRequestException(
                FileValidatorHelper.formatMissingColumnsError(validation.missingColumns),
              ),
            );
            return;
          }

          resolve({
            rows: results,
            headers,
            columnMapping: validation.foundColumns,
          });
        })
        .on('error', (error) => {
          reject(
            new BadRequestException(
              `Erro ao processar arquivo CSV: ${error.message}. Verifique se o arquivo não está corrompido.`,
            ),
          );
        });
    });
  }

  static parseXLSX(buffer: Buffer): ParseResult {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new BadRequestException(
          'Arquivo Excel inválido ou corrompido. Não foi possível encontrar nenhuma aba na planilha.',
        );
      }

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        throw new BadRequestException(
          `Não foi possível ler a aba "${sheetName}" da planilha. Verifique se o arquivo não está corrompido.`,
        );
      }

      // Extrai headers da primeira linha
      const range = xlsx.utils.decode_range(sheet['!ref'] || 'A1');
      const headers: string[] = [];

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = xlsx.utils.encode_cell({ r: range.s.r, c: col });
        const cell = sheet[cellAddress];
        headers.push(cell ? String(cell.v) : '');
      }

      // Valida colunas
      const validation = FileValidatorHelper.validateColumns(headers);

      if (validation.forbiddenColumns.length > 0) {
        throw new BadRequestException(
          FileValidatorHelper.formatForbiddenColumnsError(validation.forbiddenColumns),
        );
      }

      if (!validation.valid) {
        throw new BadRequestException(
          FileValidatorHelper.formatMissingColumnsError(validation.missingColumns),
        );
      }

      const rows = xlsx.utils.sheet_to_json<Record<string, string>>(sheet, {
        raw: false,
      });

      // Valida se há dados
      FileValidatorHelper.validateFileContent(rows);

      return {
        rows,
        headers,
        columnMapping: validation.foundColumns,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao processar arquivo Excel: ${error.message}. Verifique se o arquivo não está corrompido ou protegido por senha.`,
      );
    }
  }

  /**
   * Parse rápido apenas das primeiras linhas para validação de operadora
   * Usa sheetRows para limitar a leitura do arquivo, muito mais eficiente para arquivos grandes
   */
  static parseXLSXSample(
    buffer: Buffer,
    sampleSize: number = 500,
  ): {
    headers: string[];
    sampleRows: Record<string, string>[];
    totalRows: number;
  } {
    try {
      // Usa sheetRows para ler apenas as primeiras N linhas (muito mais rápido)
      const maxRowsToRead = Math.min(sampleSize + 1, 1000); // +1 para o header
      const workbook = xlsx.read(buffer, {
        type: 'buffer',
        sheetRows: maxRowsToRead,
      });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new BadRequestException(
          'Arquivo Excel inválido ou corrompido. Não foi possível encontrar nenhuma aba na planilha.',
        );
      }

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        throw new BadRequestException(
          `Não foi possível ler a aba "${sheetName}" da planilha. Verifique se o arquivo não está corrompido.`,
        );
      }

      const range = xlsx.utils.decode_range(sheet['!ref'] || 'A1');
      const headers: string[] = [];

      // Extrai headers
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = xlsx.utils.encode_cell({ r: range.s.r, c: col });
        const cell = sheet[cellAddress];
        headers.push(cell ? String(cell.v) : '');
      }

      // Converte para JSON
      const sampleRows = xlsx.utils.sheet_to_json<Record<string, string>>(
        sheet,
        { raw: false },
      );

      // Para arquivos grandes, não sabemos o total exato, mas temos a amostra
      // O total real será determinado quando o arquivo completo for parseado
      const totalRows = sampleRows.length;

      return { headers, sampleRows, totalRows };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao processar arquivo Excel: ${error.message}. Verifique se o arquivo não está corrompido ou protegido por senha.`,
      );
    }
  }

  static async parse(
    buffer: Buffer,
    mimetype: string,
  ): Promise<ParseResult> {
    // Valida tipo MIME
    FileValidatorHelper.validateMimeType(mimetype);

    if (mimetype === 'text/csv') {
      return this.parseCSV(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel'
    ) {
      return this.parseXLSX(buffer);
    } else {
      throw new BadRequestException(
        `Tipo de arquivo não suportado: ${mimetype}. Use CSV ou Excel (.xlsx).`,
      );
    }
  }

  /**
   * Método legado para compatibilidade - retorna apenas as linhas
   */
  static async parseRows(
    buffer: Buffer,
    mimetype: string,
  ): Promise<Record<string, string>[]> {
    const result = await this.parse(buffer, mimetype);
    return result.rows;
  }
}
