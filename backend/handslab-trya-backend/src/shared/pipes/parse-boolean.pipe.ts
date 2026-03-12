import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe customizado para converter query params boolean corretamente
 *
 * NestJS ValidationPipe às vezes converte 'false' para true incorretamente.
 * Este pipe garante a conversão correta.
 */
@Injectable()
export class ParseOptionalBooleanPipe
  implements PipeTransform<string | boolean | undefined, boolean | undefined>
{
  transform(value: string | boolean | undefined): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();

      if (lowerValue === 'true' || lowerValue === '1') {
        return true;
      }

      if (lowerValue === 'false' || lowerValue === '0') {
        return false;
      }
    }

    return undefined;
  }
}
