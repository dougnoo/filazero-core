// HealthData - Componentes compartilhados para dados de saúde do paciente

// Steps
export { StepConditions } from './steps/StepConditions';
export type { StepConditionsProps } from './steps/StepConditions';
export { StepMedications } from './steps/StepMedications';
export type { StepMedicationsProps } from './steps/StepMedications';
export { StepAllergies } from './steps/StepAllergies';
export type { StepAllergiesProps } from './steps/StepAllergies';

// Components
export { HealthDataStepper } from './HealthDataStepper';
export type { DialogStepperProps } from './HealthDataStepper';
export { HealthDataDialog } from './HealthDataDialog';
export type { HealthDataDialogProps } from './HealthDataDialog';
export { HealthDataCard } from './HealthDataCard';
export type { HealthDataCardProps } from './HealthDataCard';

// Hooks
export { useChronicConditionsSearch } from './hooks/useChronicConditionsSearch';
export type { ChronicCondition } from './hooks/useChronicConditionsSearch';
export { useMedicationsSearch } from './hooks/useMedicationsSearch';
export type { Medication } from './hooks/useMedicationsSearch';
export { useHealthDataSubmit } from './hooks/useHealthDataSubmit';
export type { HealthDataDialogState } from './hooks/useHealthDataSubmit';
