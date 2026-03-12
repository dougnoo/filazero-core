// Nearby Providers Types (com dados do Google Places)
export interface NearbyProvider {
  id: string;
  name: string;
  address: string;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
  phone?: string | null;
  phone2?: string | null;
  whatsapp?: string | null;
  specialty?: string[];
  distance: number;
  latitude: number;
  longitude: number;
  /** Nota do Google Places (1.0 a 5.0) */
  googleRating?: number | null;
  /** Total de avaliações do Google */
  googleUserRatingsTotal?: number | null;
  /** Horários de funcionamento do Google (array de strings) */
  googleWeekdayText?: string[] | null;
  /** URL direta para o Google Maps */
  googlePlaceUrl?: string | null;
  /** Tempo estimado de percurso em minutos (se disponível do backend) */
  estimatedTravelTimeMinutes?: number | null;
}

/** Calcula o tempo estimado de percurso baseado na distância */
export function calculateTravelTime(distanceKm: number, isPeakHour: boolean): number {
  const avgSpeedKmh = isPeakHour ? 15 : 30;
  return Math.ceil((distanceKm / avgSpeedKmh) * 60);
}

/** Verifica se o horário atual é horário de pico (dias úteis, 7h-9h ou 17h-19h) */
export function isPeakHour(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isMorningPeak = hour >= 7 && hour < 9;
  const isEveningPeak = hour >= 17 && hour < 19;

  return isWeekday && (isMorningPeak || isEveningPeak);
}

export interface NearbyProviderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NearbyProvidersResponse {
  data: NearbyProvider[];
  count: number;
  pagination: NearbyProviderPagination;
}

export interface SearchNearbyParams {
  latitude: number;
  longitude: number;
  searchText?: string;
  distanceKm?: number;
  page?: number;
  limit?: number;
}

// Chat API Types
export interface ChatSearchParams {
  message: string;
  latitude: number;
  longitude: number;
}

export interface ChatSearchResponse {
  data: NearbyProvider[];
  count: number;
  pagination: NearbyProviderPagination;
  /** Mensagem de resposta do assistente */
  message?: string;
  /** Especialidade extraída da mensagem do usuário */
  extractedSpecialty?: string;
}
