import { Injectable, Logger } from '@nestjs/common';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationWithDistance {
  id: string;
  nome: string;
  tipo: string;
  endereco: string;
  coordinates: Coordinates;
  distanciaKm: number;
  distanciaFormatada: string;
  telefone?: string;
  especialidades?: string[];
  funcionamento?: string;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  /**
   * Calcula a distância entre dois pontos usando a fórmula de Haversine
   * Retorna a distância em quilômetros
   * 
   * @param lat1 Latitude do primeiro ponto
   * @param lon1 Longitude do primeiro ponto
   * @param lat2 Latitude do segundo ponto
   * @param lon2 Longitude do segundo ponto
   * @returns Distância em quilômetros
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
  }

  /**
   * Converte graus para radianos
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Formata a distância para exibição
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} metros`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }

  /**
   * Ordena uma lista de locais por distância em relação a um ponto de origem
   * 
   * @param userLocation Localização do usuário
   * @param locations Lista de locais para ordenar
   * @param maxResults Número máximo de resultados a retornar (padrão: 10)
   * @returns Lista ordenada dos locais mais próximos com distância calculada
   */
  findNearestLocations(
    userLocation: Coordinates,
    locations: any[],
    maxResults: number = 10
  ): LocationWithDistance[] {
    this.logger.debug(`🗺️ Calculando distâncias para ${locations.length} locais`);
    this.logger.debug(`📍 Localização do usuário: ${userLocation.latitude}, ${userLocation.longitude}`);

    // Calcular distância para cada local
    const locationsWithDistance: LocationWithDistance[] = locations.map((location, index) => {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.coordinates.latitude,
        location.coordinates.longitude
      );

      this.logger.debug(`  Local ${index + 1}: ${location.nome} - ${distance} km`);

      return {
        id: location.id || `loc-${index}`,
        nome: location.nome,
        tipo: location.tipo,
        endereco: location.endereco,
        coordinates: location.coordinates,
        distanciaKm: distance,
        distanciaFormatada: this.formatDistance(distance),
        telefone: location.telefone,
        especialidades: location.especialidades,
        funcionamento: location.funcionamento,
      };
    });

    // Ordenar por distância (mais próximo primeiro)
    locationsWithDistance.sort((a, b) => a.distanciaKm - b.distanciaKm);

    // Retornar apenas os N mais próximos
    const nearest = locationsWithDistance.slice(0, maxResults);
    
    this.logger.log(`✅ Retornando ${nearest.length} locais mais próximos`);
    return nearest;
  }

  /**
   * Valida se as coordenadas são válidas
   */
  validateCoordinates(coordinates: Coordinates): boolean {
    const { latitude, longitude } = coordinates;
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return false;
    }
    
    if (latitude < -90 || latitude > 90) {
      return false;
    }
    
    if (longitude < -180 || longitude > 180) {
      return false;
    }
    
    return true;
  }

  /**
   * Filtra locais dentro de um raio específico (em km)
   */
  filterByRadius(
    userLocation: Coordinates,
    locations: LocationWithDistance[],
    radiusKm: number
  ): LocationWithDistance[] {
    return locations.filter(location => location.distanciaKm <= radiusKm);
  }
}

