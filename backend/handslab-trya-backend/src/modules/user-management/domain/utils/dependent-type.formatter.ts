export class DependentTypeFormatter {
  static format(dependentType: string | null, principalName?: string): string {
    if (!dependentType || dependentType === 'SELF') {
      return 'Titular';
    }

    const typeDescriptions: Record<string, string> = {
      SPOUSE: 'Cônjuge',
      CHILD: 'Filho(a)',
      STEPCHILD: 'Enteado(a)',
    };

    const description = typeDescriptions[dependentType] || dependentType;
    return `${description} de ${principalName}`;
  }

  static formatTypeOnly(dependentType: string | null): string {
    if (!dependentType || dependentType === 'SELF') {
      return 'Titular';
    }

    const typeDescriptions: Record<string, string> = {
      SPOUSE: 'Cônjuge',
      CHILD: 'Filho(a)',
      STEPCHILD: 'Enteado(a)',
    };

    return typeDescriptions[dependentType] || dependentType;
  }
}
