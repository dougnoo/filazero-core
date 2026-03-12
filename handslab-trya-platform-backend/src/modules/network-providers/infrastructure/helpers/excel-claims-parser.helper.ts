import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';
import { ClaimRow, ClaimsParseResult } from './csv-claims-parser.helper';

/**
 * Parser para arquivos Excel de sinistros
 * Suporta formatos .xlsx e .xls
 */
export class ExcelClaimsParserHelper {
  /**
   * Parse Excel de sinistros
   */
  static parseClaimsExcel(buffer: Buffer): ClaimsParseResult {
    try {
      // Lê o workbook do buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      // Pega a primeira sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new BadRequestException('Arquivo Excel vazio ou sem planilhas');
      }

      const worksheet = workbook.Sheets[sheetName];
      
      // Converte para JSON, mantendo headers na primeira linha
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      }) as any[][];

      if (jsonData.length === 0) {
        throw new BadRequestException('Arquivo Excel vazio');
      }

      // Primeira linha é o header
      const headers = (jsonData[0] || []).map((h) => String(h || '').trim());
      const dataRows = jsonData.slice(1);

      const results: ClaimRow[] = [];
      const errors: string[] = [];
      let validRows = 0;

      // Processa cada linha de dados
      for (let lineNumber = 2; lineNumber <= dataRows.length + 1; lineNumber++) {
        const row = dataRows[lineNumber - 2];

        // Pula linhas vazias
        if (!row || row.every((cell) => !cell || String(cell).trim() === '')) {
          continue;
        }

        try {
          const parsed = this.parseRow(row, headers);
          if (parsed) {
            results.push(parsed);
            validRows++;
          }
        } catch (error) {
          errors.push(`Linha ${lineNumber}: ${error.message}`);
        }
      }

      return {
        rows: results,
        headers,
        stats: {
          totalRows: dataRows.length,
          validRows,
          invalidRows: dataRows.length - validRows,
          errors,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao processar arquivo Excel: ${error.message}`,
      );
    }
  }

  /**
   * Parse individual row baseado nas 5 colunas necessárias
   */
  private static parseRow(row: any[], headers: string[]): ClaimRow | null {
    // Mapeamento de índices das 5 colunas
    const indices = this.findColumnIndices(headers);

    // Validação básica
    const prestador = String(row[indices.prestador] || '').trim();
    const sinistro = String(row[indices.sinistro] || '').trim();

    if (!prestador || !sinistro) {
      return null; // Linha inválida
    }

    return {
      operadora: this.cleanText(String(row[indices.operadora] || '')),
      rede: this.cleanText(String(row[indices.rede] || '')),
      prestador: this.cleanText(prestador),
      elementoDivulgacao: this.cleanText(String(row[indices.elementoDivulgacao] || '')),
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
    return String(text)
      .replace(/�/g, '') // Remove caracteres de encoding quebrado
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  /**
   * Parse decimal no formato brasileiro (1.234,56 ou 1234,5600 ou 1234.56)
   */
  private static parseDecimal(value: string): string {
    if (!value) return '0.00';

    value = String(value).trim();

    // Se já é número, converte para string
    if (!isNaN(Number(value))) {
      return String(Number(value));
    }

    // Trata formato brasileiro (1.234,56)
    if (value.includes(',')) {
      return value
        .replace(/\./g, '') // Remove separador de milhar
        .replace(',', '.'); // Troca vírgula por ponto
    }

    // Trata formato com ponto
    return value;
  }

  /**
   * Valida estrutura do Excel de sinistros
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
