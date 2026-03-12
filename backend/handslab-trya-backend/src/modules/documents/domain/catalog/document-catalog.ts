import { MedicalDocumentType } from '../../../../database/entities/medical-document.entity';

export interface DocumentCatalogEntry {
  type: MedicalDocumentType;
  label: string;
  categories: string[];
}

export const DOCUMENT_CATALOG: DocumentCatalogEntry[] = [
  {
    type: MedicalDocumentType.LAB_EXAM,
    label: 'Exame Laboratorial',
    categories: [
      'Hemograma',
      'Glicemia',
      'Colesterol e Triglicerídeos',
      'Função Renal',
      'Função Hepática',
      'Hormônios',
      'Urina',
      'Fezes',
      'Outros',
    ],
  },
  {
    type: MedicalDocumentType.IMAGING_EXAM,
    label: 'Exame de Imagem',
    categories: [
      'Raio-X',
      'Ultrassonografia',
      'Tomografia',
      'Ressonância Magnética',
      'Mamografia',
      'Densitometria Óssea',
      'Ecocardiograma',
      'Outros',
    ],
  },
  {
    type: MedicalDocumentType.REPORT,
    label: 'Laudos',
    categories: [
      'Laudo Médico',
      'Laudo Cardiológico',
      'Laudo Oftalmológico',
      'Laudo Neurológico',
      'Laudo Psiquiátrico',
      'Laudo Ortopédico',
      'Outros',
    ],
  },
  {
    type: MedicalDocumentType.VACCINATION,
    label: 'Vacinação',
    categories: [
      'COVID-19',
      'Gripe (Influenza)',
      'Hepatite A',
      'Hepatite B',
      'Febre Amarela',
      'Tétano',
      'Sarampo/Caxumba/Rubéola',
      'HPV',
      'Pneumocócica',
      'Meningocócica',
      'Outros',
    ],
  },
  {
    type: MedicalDocumentType.CLINICAL_FILE,
    label: 'Arquivo Clínico',
    categories: [
      'Prontuário',
      'Evolução Clínica',
      'Anamnese',
      'Ficha de Atendimento',
      'Encaminhamento',
      'Outros',
    ],
  },
  {
    type: MedicalDocumentType.PRESCRIPTION,
    label: 'Receita',
    categories: [
      'Receita Simples',
      'Receita Controlada',
      'Receita de Antibiótico',
      'Outros',
    ],
  },
];

export function getCategoriesForType(type: MedicalDocumentType): string[] {
  const entry = DOCUMENT_CATALOG.find((e) => e.type === type);
  return entry?.categories ?? [];
}

export function isValidCategory(
  type: MedicalDocumentType,
  category: string,
): boolean {
  const categories = getCategoriesForType(type);
  return categories.includes(category);
}

export function getDocumentTypeLabel(type: MedicalDocumentType): string {
  const entry = DOCUMENT_CATALOG.find((e) => e.type === type);
  return entry?.label ?? type;
}
