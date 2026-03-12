import { Injectable } from '@nestjs/common';
import { IDateParserService } from '../../domain/services/date-parser.service.interface';
import { InvalidDateError } from '../../domain/errors/invalid-date.error';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelDateParserService implements IDateParserService {
  parseToDate(value: any): Date {
    if (!value) throw new InvalidDateError();

    if (value instanceof Date) return value;

    if (typeof value === 'object' && value.y && value.m && value.d) {
      return new Date(value.y, value.m - 1, value.d);
    }

    if (typeof value === 'number') {
      const parsed = XLSX.SSF.parse_date_code(value);
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }

    const cleaned = String(value).trim();
    if (cleaned.includes('/')) {
      const [day, month, year] = cleaned.split('/');
      return new Date(
        `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      );
    }

    return new Date(cleaned);
  }
}
