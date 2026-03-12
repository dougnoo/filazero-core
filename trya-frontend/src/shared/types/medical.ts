/**
 * Medical and Memed related types and enums
 * Shared across the application
 */

// Board codes for medical professionals
export enum BoardCode {
  CRM = "CRM",
  CRO = "CRO", 
  COREN = "COREN",
  CRMV = "CRMV",
  CRF = "CRF",
  CRN = "CRN",
  CREFITO = "CREFITO",
  CRP = "CRP",
  CRFa = "CRFa",
  CREF = "CREF",
}

export const BOARD_CODE_OPTIONS = [
  { value: BoardCode.CRM, label: "CRM - Conselho Regional de Medicina" },
  { value: BoardCode.CRO, label: "CRO - Conselho Regional de Odontologia" },
  { value: BoardCode.COREN, label: "COREN - Conselho Regional de Enfermagem" },
  {
    value: BoardCode.CRMV,
    label: "CRMV - Conselho Regional de Medicina Veterinária",
  },
  { value: BoardCode.CRF, label: "CRF - Conselho Regional de Farmácia" },
  { value: BoardCode.CRN, label: "CRN - Conselho Regional de Nutricionistas" },
  {
    value: BoardCode.CREFITO,
    label: "CREFITO - Conselho Regional de Fisioterapia e Terapia Ocupacional",
  },
  { value: BoardCode.CRP, label: "CRP - Conselho Regional de Psicologia" },
  {
    value: BoardCode.CRFa,
    label: "CRFa - Conselho Regional de Fonoaudiologia",
  },
  {
    value: BoardCode.CREF,
    label: "CREF - Conselho Regional de Educação Física",
  },
];