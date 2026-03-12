import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  AmilProvider,
  AmilEstablishment,
  AmilPlanDetails,
  AmilResult,
} from '../../domain/entities/amil-provider.entity';

@Injectable()
export class HtmlParserService {
  private readonly logger = new Logger(HtmlParserService.name);

  parseResultadoHtml(html: string): AmilResult {
    const $ = cheerio.load(html);

    // Check if it's an error page
    const isErrorPage =
      $('body#errorPage').length > 0 || $('title').text().includes('Desculpe');
    if (isErrorPage) {
      this.logger.error('[parseResultadoHtml] Amil returned an error page');
      throw new BadRequestException(
        'A API da Amil retornou um erro. Verifique os parâmetros da busca e tente novamente.',
      );
    }

    // Check for no results page
    const hasNoResults = $('#semResultados').length > 0;
    const quantidadeText = $('.qtdeResultados span').first().text().trim();

    if (
      hasNoResults ||
      quantidadeText.includes('não localizou nenhum prestador')
    ) {
      this.logger.log('[parseResultadoHtml] No providers found');
      throw new BadRequestException(
        'Nenhum prestador foi encontrado com os critérios informados. Verifique a localização e o tipo de serviço.',
      );
    }

    // Extract quantity
    const quantity = parseInt(quantidadeText.match(/\d+/)?.[0] || '0', 10);
    this.logger.debug(
      `[parseResultadoHtml] Quantity text: "${quantidadeText}", parsed: ${quantity}`,
    );

    // Extract specialty
    const especialidadeText = $('.credenciado-especialidade')
      .first()
      .text()
      .trim();
    const specialty = especialidadeText || 'Não especificado';
    this.logger.debug(`[parseResultadoHtml] Specialty: "${specialty}"`);

    // Count potential provider rows
    const credenciadoRows = $('tr.credenciado').length;
    const estabelecimentoRows = $('tr.estabelecimento').length;
    const totalRows = $('tr').length;
    this.logger.debug(
      `[parseResultadoHtml] Rows found - Total: ${totalRows}, Credenciado: ${credenciadoRows}, Estabelecimento: ${estabelecimentoRows}`,
    );

    // Extract plan info (if available)
    let plan: AmilPlanDetails | undefined;
    const planoText = $('.nomePlano').first().text().trim();
    if (planoText) {
      plan = new AmilPlanDetails({
        code: '',
        name: planoText,
      });
    }

    // Extract providers
    const providers = this.extractProviders($);
    this.logger.log(
      `[parseResultadoHtml] Extracted ${providers.length} providers`,
    );

    return new AmilResult({
      quantity,
      specialty,
      providers,
      plan,
    });
  }

  private extractProviders($: cheerio.CheerioAPI): AmilProvider[] {
    const providers: AmilProvider[] = [];
    let currentProvider: Partial<AmilProvider> | null = null;

    $('tr').each((_, element) => {
      const $row = $(element);

      // Check if this is a credenciado row (provider header)
      if ($row.hasClass('credenciado')) {
        // Save previous provider if exists
        if (currentProvider) {
          providers.push(new AmilProvider(currentProvider));
        }

        // Start new provider - extract data from td
        const $td = $row.find('td').first();
        const tradeName = $td.find('.nomeFantasia').text().trim();
        const cnpjText = $td.text();
        const cnpjMatch = cnpjText.match(/CNPJ:\s*([\d.\/-]+)/);
        const cnpj = cnpjMatch ? cnpjMatch[1].trim() : undefined;

        // Extract qualifications from etiquetaQualificacao spans
        const qualifications: string[] = [];
        $td.find('.etiquetaQualificacao').each((_, qualEl) => {
          const qual = $(qualEl).attr('title');
          if (qual) qualifications.push(qual.trim());
        });

        currentProvider = {
          tradeName,
          cnpj,
          qualifications:
            qualifications.length > 0 ? qualifications : undefined,
          establishments: [],
        };
      }

      // Check if this is an estabelecimento row
      if ($row.hasClass('estabelecimento') && currentProvider) {
        const establishment = this.extractEstablishment($, $row);
        currentProvider.establishments?.push(establishment);
      }
    });

    // Save last provider
    if (currentProvider) {
      providers.push(new AmilProvider(currentProvider));
    }

    return providers;
  }

  private extractEstablishment(
    $: cheerio.CheerioAPI,
    $row: cheerio.Cheerio<any>,
  ): AmilEstablishment {
    // Address is in .logradouro
    const street = $row.find('.logradouro').text().trim();
    const complement = $row.find('.complemento').text().trim();
    const address = complement ? `${street} ${complement}` : street;

    const neighborhood = $row.find('.bairro').text().trim();
    const zipCode = $row.find('.cep').text().trim();

    // City and state are in hidden inputs
    const city = ($row.find('input.cidade').val() as string) || '';
    const state = ($row.find('input.estado').val() as string) || '';

    // Phone numbers
    const phone = $row.find('.telefone').first().text().trim();
    const cellphone = $row.find('.celular').first().text().trim();

    // Extract coordinates from hidden inputs
    const latitude = $row.find('input.latitude').val() as string;
    const longitude = $row.find('input.longitude').val() as string;

    return new AmilEstablishment({
      address,
      neighborhood: neighborhood || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      phone: phone || undefined,
      cellphone: cellphone || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
    });
  }
}
