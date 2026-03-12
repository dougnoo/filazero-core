export type ListChronicConditionsParams = {
  name: string;
};

export type ChronicConditionModel = {
  id: string;
  name: string;
};

export abstract class IChronicConditionsRepository {
  abstract list(
    params: ListChronicConditionsParams,
  ): Promise<ChronicConditionModel[]>;
  abstract findByNames(names: string[]): Promise<ChronicConditionModel[]>;
}
