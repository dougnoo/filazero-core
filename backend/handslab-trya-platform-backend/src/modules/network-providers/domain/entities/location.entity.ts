export class Location {
  hash: string;
  postalCode: string;
  streetType?: string;
  streetName: string;
  streetNumber?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  geocodedAt?: Date;
  geocodingStatus: 'pending' | 'success' | 'failed' | 'not_found';
  geocodingAttempts: number;
  geocodingError?: string;
  geocodingProvider?: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(data: Partial<Location>) {
    Object.assign(this, data);
  }

  static create(data: {
    hash: string;
    postalCode: string;
    streetName: string;
    city: string;
    state: string;
    fullAddress: string;
    streetType?: string;
    streetNumber?: string;
    complement?: string;
    neighborhood?: string;
  }): Location {
    return new Location({
      ...data,
      geocodingStatus: 'pending',
      geocodingAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(data: Location): Location {
    return new Location(data);
  }

  markGeocoded(latitude: number, longitude: number, provider: string): void {
    this.latitude = latitude;
    this.longitude = longitude;
    this.geocodedAt = new Date();
    this.geocodingStatus = 'success';
    this.geocodingProvider = provider;
    this.updatedAt = new Date();
  }

  markGeocodingFailed(error: string): void {
    this.geocodingAttempts += 1;
    this.geocodingError = error;
    this.geocodingStatus = this.geocodingAttempts >= 3 ? 'not_found' : 'failed';
    this.updatedAt = new Date();
  }
}
