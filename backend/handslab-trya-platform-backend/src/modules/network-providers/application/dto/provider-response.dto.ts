export class ProviderResponseDto {
  id: string;
  name: string;
  category: string;
  address: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  location?: {
    hash: string;
    latitude?: number;
    longitude?: number;
    formattedAddress?: string;
    googleRating?: number;
    googleUserRatingsTotal?: number;
    googleWeekdayText?: string[];
    googlePlaceUrl?: string;
  };
  services: Array<{
    id: string;
    specialty: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
