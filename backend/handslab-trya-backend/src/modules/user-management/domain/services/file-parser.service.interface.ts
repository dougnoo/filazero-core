export interface IFileParserService {
  parseSpreadsheet<T>(file: Express.Multer.File): T[];
}
