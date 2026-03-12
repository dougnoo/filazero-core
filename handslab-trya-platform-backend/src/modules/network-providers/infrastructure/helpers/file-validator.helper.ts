import { BadRequestException } from '@nestjs/common';

/**
 * Colunas obrigatórias para o template de rede credenciada
 * Cada coluna pode ter aliases (variações aceitas)
 * Baseado no template real da operadora
 */
export const REQUIRED_COLUMNS = {
  nome: [
    'nome',
    'prestador',
    'nome_prestador',
    'nome_do_prestador',
    'provider_name',
    'name',
  ],
  cep: ['cep', 'codigo_postal', 'postal_code', 'zip'],
  logradouro: [
    'logradouro',
    'endereco',
    'endereco_prestador',
    'address',
    'rua',
    'street',
  ],
  cidade: ['cidade', 'city', 'municipio'],
  uf: ['uf', 'estado', 'state'],
} as const;

/**
 * Colunas opcionais reconhecidas pelo template
 * Baseado no template real da operadora
 */
export const OPTIONAL_COLUMNS = {
  operadora: ['nome_da_operadora', 'operadora', 'operator'],
  filial: ['nome_da_filial', 'filial', 'branch'],
  rede: ['nome_da_rede', 'rede', 'network'],
  capitulo: ['capitulo_orientador', 'capitulo', 'chapter'],
  categoria: [
    'elemento_de_divulgacao',
    'categoria',
    'category',
    'tipo',
    'tipo_servico',
    'service_type',
  ],
  especialidade: ['especialidade', 'specialty', 'esp'],
  tipo_logradouro: ['tipo_de_logradouro', 'tipo_logradouro', 'street_type'],
  numero: ['numero', 'number', 'num'],
  complemento: ['complemento', 'complement'],
  bairro: ['bairro', 'neighborhood'],
  ddd_telefone1: ['ddd_telefone_1', 'ddd_telefone1', 'ddd1'],
  telefone1: ['telefone_1', 'telefone1', 'telefone', 'phone', 'tel'],
  ddd_telefone2: ['ddd_telefone_2', 'ddd_telefone2', 'ddd2'],
  telefone2: ['telefone_2', 'telefone2'],
  ddd_whatsapp: ['ddd_whatsapp'],
  whatsapp: ['whatsapp'],
  cnpj: ['cnpj', 'documento', 'document'],
  email: ['email', 'e_mail'],
  plano: ['plano', 'plan', 'tipo_plano', 'plan_type'],
} as const;

/**
 * Colunas sensíveis que NÃO devem estar na planilha (LGPD)
 */
export const FORBIDDEN_COLUMNS = [
  'cpf',
  'rg',
  'data_nascimento',
  'birth_date',
  'senha',
  'password',
  'cartao',
  'card',
  'beneficiario',
  'paciente',
  'patient',
];

export interface ColumnValidationResult {
  valid: boolean;
  missingColumns: string[];
  foundColumns: Record<string, string>; // mapping: requiredKey -> actualColumnName
  forbiddenColumns: string[];
  warnings: string[];
}

export interface OperatorValidationResult {
  valid: boolean;
  expectedOperator: string;
  foundOperators: string[];
  inconsistentRows: OperatorInconsistency[];
}

export interface OperatorInconsistency {
  row: number;
  column: string;
  foundValue: string;
  expectedValue: string;
  message: string;
}

export class FileValidatorHelper {
  /**
   * Normaliza o nome da coluna para comparação
   */
  private static normalizeColumnName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]/g, '_') // substitui caracteres especiais por _
      .replace(/_+/g, '_') // remove underscores duplicados
      .replace(/^_|_$/g, ''); // remove underscores no início/fim
  }

  /**
   * Valida as colunas do arquivo contra o template esperado
   */
  static validateColumns(headers: string[]): ColumnValidationResult {
    const normalizedHeaders = headers.map((h) => this.normalizeColumnName(h));
    const result: ColumnValidationResult = {
      valid: true,
      missingColumns: [],
      foundColumns: {},
      forbiddenColumns: [],
      warnings: [],
    };

    // Verifica colunas obrigatórias
    for (const [key, aliases] of Object.entries(REQUIRED_COLUMNS)) {
      const foundIndex = normalizedHeaders.findIndex((h) =>
        aliases.some((alias) => h === alias || h.includes(alias)),
      );

      if (foundIndex === -1) {
        result.missingColumns.push(key);
        result.valid = false;
      } else {
        result.foundColumns[key] = headers[foundIndex];
      }
    }

    // Verifica colunas proibidas (LGPD)
    for (const header of normalizedHeaders) {
      const isForbidden = FORBIDDEN_COLUMNS.some(
        (forbidden) => header === forbidden || header.includes(forbidden),
      );
      if (isForbidden) {
        result.forbiddenColumns.push(
          headers[normalizedHeaders.indexOf(header)],
        );
      }
    }

    if (result.forbiddenColumns.length > 0) {
      result.valid = false;
    }

    return result;
  }

  /**
   * Valida o conteúdo básico do arquivo (não vazio, tem linhas)
   */
  static validateFileContent(rows: Record<string, string>[]): void {
    if (!rows || rows.length === 0) {
      throw new BadRequestException(
        'Arquivo vazio ou sem dados válidos. Verifique se a planilha contém dados na primeira aba.',
      );
    }

    if (rows.length < 1) {
      throw new BadRequestException(
        'A planilha deve conter ao menos uma linha de dados além do cabeçalho.',
      );
    }
  }

  /**
   * Gera mensagem de erro detalhada para colunas faltantes
   */
  static formatMissingColumnsError(missingColumns: string[]): string {
    const columnDescriptions: Record<string, string> = {
      nome: 'Nome do prestador (ex: "Nome do Prestador", "Prestador", "Nome")',
      cep: 'CEP do endereço (ex: "CEP", "Código Postal")',
      logradouro:
        'Logradouro/Endereço (ex: "Endereço Prestador", "Logradouro", "Rua")',
      cidade: 'Cidade/Município (ex: "Municipio", "Cidade")',
      uf: 'Estado/UF (ex: "UF", "Estado")',
    };

    const details = missingColumns
      .map((col) => `  - ${columnDescriptions[col] || col}`)
      .join('\n');

    return `Colunas obrigatórias ausentes:\n${details}\n\nBaixe o template oficial para ver o formato correto.`;
  }

  /**
   * Gera mensagem de erro para colunas proibidas (LGPD)
   */
  static formatForbiddenColumnsError(forbiddenColumns: string[]): string {
    return `A planilha contém colunas com dados sensíveis não permitidos (LGPD): ${forbiddenColumns.join(', ')}. Remova essas colunas antes de importar.`;
  }

  /**
   * Valida o tipo MIME do arquivo
   */
  static validateMimeType(mimetype: string): void {
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo inválido: "${mimetype}". Apenas arquivos CSV (.csv) e Excel (.xlsx, .xls) são aceitos.`,
      );
    }
  }

  /**
   * Valida o tamanho do arquivo (max 10MB por padrão)
   */
  static validateFileSize(size: number, maxSizeMB: number = 10): void {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (size > maxSizeBytes) {
      throw new BadRequestException(
        `Arquivo muito grande (${(size / 1024 / 1024).toFixed(2)}MB). O tamanho máximo permitido é ${maxSizeMB}MB.`,
      );
    }
  }

  /**
   * Normaliza nome de operadora para comparação
   */
  private static normalizeOperatorName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]/g, '') // remove caracteres especiais
      .trim();
  }

  /**
   * Verifica se dois nomes de operadora são equivalentes
   */
  private static areOperatorsEquivalent(name1: string, name2: string): boolean {
    const normalized1 = this.normalizeOperatorName(name1);
    const normalized2 = this.normalizeOperatorName(name2);

    // Verifica igualdade exata após normalização
    if (normalized1 === normalized2) return true;

    // Verifica se um contém o outro (para casos como "Bradesco" vs "Bradesco Saúde")
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1))
      return true;

    return false;
  }

  /**
   * Valida se os registros da planilha são compatíveis com a operadora selecionada
   * Verifica a coluna "operadora" (ou equivalente) usando amostragem para performance
   * Para arquivos grandes, verifica apenas as primeiras linhas + amostra aleatória
   */
  static validateOperatorCompatibility(
    rows: Record<string, string>[],
    headers: string[],
    expectedOperatorName: string,
  ): OperatorValidationResult {
    const result: OperatorValidationResult = {
      valid: true,
      expectedOperator: expectedOperatorName,
      foundOperators: [],
      inconsistentRows: [],
    };

    // Encontra a coluna de operadora
    const normalizedHeaders = headers.map((h) => this.normalizeColumnName(h));
    const operatorAliases = OPTIONAL_COLUMNS.operadora;

    const operatorColumnIndex = normalizedHeaders.findIndex((h) =>
      operatorAliases.some((alias) => h === alias || h.includes(alias)),
    );

    // Se não tem coluna de operadora, não há como validar - retorna válido
    if (operatorColumnIndex === -1) {
      return result;
    }

    const operatorColumnName = headers[operatorColumnIndex];
    const uniqueOperators = new Set<string>();
    const maxInconsistencies = 10;
    const sampleSize = Math.min(rows.length, 500);

    // Para arquivos grandes, usa amostragem
    const indicesToCheck: number[] = [];

    if (rows.length <= 500) {
      // Arquivos pequenos: verifica todas as linhas
      for (let i = 0; i < rows.length; i++) {
        indicesToCheck.push(i);
      }
    } else {
      // Arquivos grandes: primeiras 100 + últimas 50 + amostra do meio
      for (let i = 0; i < 100; i++) {
        indicesToCheck.push(i);
      }
      for (let i = rows.length - 50; i < rows.length; i++) {
        indicesToCheck.push(i);
      }
      // Adiciona amostras do meio (a cada N linhas)
      const step = Math.floor(rows.length / 350);
      for (
        let i = 100;
        i < rows.length - 50 && indicesToCheck.length < sampleSize;
        i += step
      ) {
        indicesToCheck.push(i);
      }
    }

    // Valida as linhas selecionadas
    for (const index of indicesToCheck) {
      const row = rows[index];
      const rowOperator = row[operatorColumnName]?.trim();

      if (!rowOperator) {
        continue;
      }

      uniqueOperators.add(rowOperator);

      // Verifica compatibilidade
      if (!this.areOperatorsEquivalent(rowOperator, expectedOperatorName)) {
        result.valid = false;
        if (result.inconsistentRows.length < maxInconsistencies) {
          result.inconsistentRows.push({
            row: index + 2,
            column: operatorColumnName,
            foundValue: rowOperator,
            expectedValue: expectedOperatorName,
            message: `Linha ${index + 2}: Operadora "${rowOperator}" não corresponde à operadora selecionada "${expectedOperatorName}"`,
          });
        }

        // Early return: se já encontrou inconsistência, não precisa continuar
        // Apenas coleta mais algumas para o relatório
        if (result.inconsistentRows.length >= maxInconsistencies) {
          break;
        }
      }
    }

    result.foundOperators = Array.from(uniqueOperators);

    return result;
  }

  /**
   * Gera mensagem de erro detalhada para incompatibilidade de operadora
   */
  static formatOperatorMismatchError(
    validation: OperatorValidationResult,
    maxExamples: number = 5,
  ): string {
    const examples = validation.inconsistentRows.slice(0, maxExamples);
    const remaining = validation.inconsistentRows.length - maxExamples;

    let message = `A planilha contém registros de operadora(s) diferente(s) da selecionada.\n\n`;
    message += `Operadora selecionada: ${validation.expectedOperator}\n`;
    message += `Operadora(s) encontrada(s) na planilha: ${validation.foundOperators.join(', ')}\n\n`;
    message += `Exemplos de inconsistências:\n`;

    examples.forEach((inc) => {
      message += `  - ${inc.message}\n`;
    });

    if (remaining > 0) {
      message += `  ... e mais ${remaining} linha(s) com inconsistências.\n`;
    }

    message += `\nPor favor, selecione a operadora correta ou utilize uma planilha compatível.`;

    return message;
  }
}
