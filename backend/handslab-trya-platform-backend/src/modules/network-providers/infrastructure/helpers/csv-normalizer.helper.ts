export interface NormalizedRow {
  postalCode: string;
  streetType?: string;
  streetName: string;
  streetNumber?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  name: string;
  phone1AreaCode?: string;
  phone1?: string;
  phone2AreaCode?: string;
  phone2?: string;
  whatsappAreaCode?: string;
  whatsapp?: string;
  insuranceCompany: string;
  branchName: string;
  networkName: string;
  category: string;
  specialty: string;
}

export class CsvNormalizerHelper {
  private static loggedColumns = false;

  static normalize(csvRow: Record<string, string>): NormalizedRow {
    // Debug: log das colunas disponíveis (apenas na primeira linha)
    if (!this.loggedColumns) {
      console.log('=== COLUNAS DISPONÍVEIS NO CSV ===');
      console.log(Object.keys(csvRow));
      console.log('\n=== INSPEÇÃO DETALHADA DE CADA COLUNA ===');
      Object.keys(csvRow).forEach((colName, idx) => {
        console.log(`[${idx}] "${colName}" = "${csvRow[colName]}"`);
      });
      console.log('==================================\n');
      this.loggedColumns = true;
    }

    if (!this.loggedColumns) {
      this.loggedColumns = true;
    }

    const result: NormalizedRow = {
      // Location
      postalCode: csvRow['CEP'] || '',
      streetType: csvRow['Tipo de Logradouro'] || '',
      streetName: csvRow['Endereço Prestador'] || '',
      streetNumber: csvRow['Número'] || '',
      complement: csvRow['Complemento'] || '',
      neighborhood: csvRow['Bairro'] || '',
      city: csvRow['Municipio'] || '',
      state: csvRow['UF'] || '',

      // Provider
      name: csvRow['Nome do Prestador'] || '',
      phone1AreaCode: csvRow['DDD Telefone 1'] || '',
      phone1: csvRow['Telefone 1'] || '',
      phone2AreaCode: csvRow['DDD Telefone 2'] || '',
      phone2: csvRow['Telefone 2'] || '',
      whatsappAreaCode: csvRow['DDD Whatsapp'] || '',
      whatsapp: csvRow['Whatsapp'] || '',

      // Insurance
      insuranceCompany: csvRow['Nome da Operadora'] || '',
      branchName: csvRow['Nome da Filial'] || '',
      networkName: csvRow['Nome da Rede'] || '',

      // Service
      category: csvRow['Capítulo Orientador'] || '',
      specialty: csvRow['Elemento de Divulgação'] || '',
    };

    return result;
  }
}
