import { Injectable } from '@nestjs/common';
import type { IFileParserService } from '../../domain/services/file-parser.service.interface';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelFileParserService implements IFileParserService {
  parseSpreadsheet<T>(file: Express.Multer.File): T[] {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<T>(sheet);
  }
}
