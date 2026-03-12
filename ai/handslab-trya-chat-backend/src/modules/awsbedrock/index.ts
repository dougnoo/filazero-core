// Module export
export * from './awsbedrock.module';

// Tokens export
export * from './tokens';

// Legacy service export
export * from './awsbedrock.service';

// Clean Architecture exports
export * from './domain';
export * from './infrastructure';
export * from './application';

// Legacy interface export for backward compatibility (explicit export to avoid conflicts)
export { BedrockResponse as LegacyBedrockResponse } from './interfaces/bedrock-response.interface';