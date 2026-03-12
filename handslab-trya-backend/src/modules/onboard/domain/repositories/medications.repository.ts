export type ListMedicationsParams = {
  name: string;
};

export type MedicationModel = {
  id: string;
  name: string;
  activePrinciple?: string | null;
};

export abstract class IMedicationsRepository {
  abstract list(params: ListMedicationsParams): Promise<MedicationModel[]>;
  abstract findByNames(names: string[]): Promise<MedicationModel[]>;
}
