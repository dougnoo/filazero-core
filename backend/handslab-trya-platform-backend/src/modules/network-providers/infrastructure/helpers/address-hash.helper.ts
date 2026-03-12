import { createHash } from 'crypto';

export class AddressHashHelper {
  static generate(
    postalCode: string,
    streetName: string,
    streetNumber: string,
    city: string,
    state: string,
  ): string {
    const postalCodeNorm = postalCode.replace(/\D/g, '').padStart(8, '0');
    const streetNameNorm = this.normalize(streetName);
    const streetNumberNorm = streetNumber
      ? this.normalize(streetNumber)
      : 'S/N';
    const cityNorm = this.normalize(city);
    const stateNorm = state.trim().toUpperCase();

    const addressString = [
      postalCodeNorm,
      streetNameNorm,
      streetNumberNorm,
      cityNorm,
      stateNorm,
    ].join('|');

    return createHash('md5').update(addressString, 'utf8').digest('hex');
  }

  private static normalize(str: string): string {
    return str
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  static formatFullAddress(data: {
    streetType?: string;
    streetName: string;
    streetNumber?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode: string;
  }): string {
    const parts: string[] = [];

    if (data.streetType) parts.push(data.streetType);
    parts.push(data.streetName);
    if (data.streetNumber) parts.push(data.streetNumber);
    if (data.complement) parts.push(data.complement);
    if (data.neighborhood) parts.push(data.neighborhood);
    parts.push(data.city);
    parts.push(data.state);
    parts.push(data.postalCode);

    return parts.filter((p) => p).join(', ');
  }
}
