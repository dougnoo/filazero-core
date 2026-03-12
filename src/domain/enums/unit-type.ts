export enum UnitType {
  UBS = 'UBS',
  HOSPITAL = 'HOSPITAL',
  UPA = 'UPA',
  CLINIC = 'CLINIC',
  SPECIALTY_CENTER = 'SPECIALTY_CENTER',
}

export const unitTypeConfig: Record<UnitType, { label: string }> = {
  [UnitType.UBS]: { label: 'UBS - Unidade Básica de Saúde' },
  [UnitType.HOSPITAL]: { label: 'Hospital' },
  [UnitType.UPA]: { label: 'UPA - Unidade de Pronto Atendimento' },
  [UnitType.CLINIC]: { label: 'Clínica' },
  [UnitType.SPECIALTY_CENTER]: { label: 'Centro de Especialidades' },
};
