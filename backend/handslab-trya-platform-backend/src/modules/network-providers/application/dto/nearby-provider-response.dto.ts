export class NearbyProviderResponseDto {
  id: string;
  name: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  specialty: string[];
  distance: number;
  latitude?: number;
  longitude?: number;
  googleRating?: number;
  googleUserRatingsTotal?: number;
  googleWeekdayText?: string[];
  googlePlaceUrl?: string;
}
