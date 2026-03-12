/**
 * Dependency Injection Tokens
 * Following Dependency Inversion Principle (SOLID)
 * High-level modules depend on abstractions, not concrete implementations
 */

// Storage Client Token
export const STORAGE_CLIENT_TOKEN = Symbol('STORAGE_CLIENT');

// Transcription Client Token
export const TRANSCRIPTION_CLIENT_TOKEN = Symbol('TRANSCRIPTION_CLIENT');

// Transcription Streaming Client Token
export const TRANSCRIPTION_STREAMING_CLIENT_TOKEN = Symbol('TRANSCRIPTION_STREAMING_CLIENT');

// Transcription Parser Token
export const TRANSCRIPTION_PARSER_TOKEN = Symbol('TRANSCRIPTION_PARSER');
