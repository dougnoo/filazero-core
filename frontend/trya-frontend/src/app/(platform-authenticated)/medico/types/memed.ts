/**
 * Memed integration types specific to the medical module
 */

import { BoardCode } from "@/shared/types/medical";


// Memed integration status
export enum MemedStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE", 
  PENDING = "PENDING",
  ERROR = "ERROR",
}

// Basic beneficiary data interface (generic)
export interface BeneficiaryData {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  mother_name?: string;
  social_name?: string;
  birthdate?: string; // ISO date string
  gender?: string; // 'male', 'female', etc.
}

// Memed sync request interface
export interface SyncMemedRequest {
  doctorId: string;
  boardCode: BoardCode;
  boardNumber: string;
  boardState: string;
  cityId?: number;
  specialtyId?: number;
}

// Memed sync response interface
export interface SyncMemedResponse {
  doctorId: string;
  memedId: number;
  memedToken: string;
  memedStatus: MemedStatus;
  message: string;
}

// Get token response interface
export interface GetTokenResponse {
  doctorId: string;
  doctorName: string;
  memedToken: string;
  memedStatus: MemedStatus;
  boardCode: BoardCode;
  boardNumber: string;
  boardState: string;
}

// Beneficiary data for Memed integration using BeneficiaryDetails structure
export interface MemedBeneficiaryData {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  birthDate: string; // ISO date string (matches BeneficiaryDetails)
  gender: string; // matches BeneficiaryDetails.gender
  email?: string;
  mother_name?: string;
  social_name?: string;
}