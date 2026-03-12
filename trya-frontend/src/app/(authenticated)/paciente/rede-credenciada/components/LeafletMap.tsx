"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para os ícones padrão do Leaflet no Next.js
const providerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedProviderIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "selected-marker",
});

const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #2196F3;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #2196F3, 0 2px 8px rgba(33,150,243,0.5);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export interface MapMarker {
  id: string;
  providerName: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

interface LeafletMapProps {
  markers: MapMarker[];
  userLocation: UserLocation | null;
  selectedProviderName?: string;
  onSelectProviderName?: (providerName: string) => void;
}

function MapController({ markers, userLocation }: { markers: MapMarker[]; userLocation: UserLocation | null }) {
  const map = useMap();

  useEffect(() => {
    // Centraliza no usuário primeiro, depois ajusta para incluir markers
    if (userLocation) {
      if (markers.length > 0) {
        const allPoints: [number, number][] = markers.map((m) => [m.lat, m.lng]);
        allPoints.push([userLocation.lat, userLocation.lng]);
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else {
        map.setView([userLocation.lat, userLocation.lng], 13);
      }
    } else if (markers.length > 0) {
      const allPoints: [number, number][] = markers.map((m) => [m.lat, m.lng]);
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, markers, userLocation]);

  // Invalida o tamanho do mapa quando ele se torna visível (fix para display:none)
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    
    // Também invalida periodicamente para pegar mudanças de visibilidade
    const interval = setInterval(() => {
      map.invalidateSize();
    }, 500);

    // Limpa após 3 segundos (tempo suficiente para o usuário trocar de aba)
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [map]);

  return null;
}

export default function LeafletMap({ markers, userLocation, selectedProviderName, onSelectProviderName }: LeafletMapProps) {
  const defaultCenter: [number, number] = [-23.5505, -46.6333]; // São Paulo
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : markers.length > 0
      ? [markers[0].lat, markers[0].lng]
      : defaultCenter;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={center}
        zoom={userLocation ? 13 : 4}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapController markers={markers} userLocation={userLocation} />

        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={150}
              pathOptions={{ color: "#2196F3", fillColor: "#2196F3", fillOpacity: 0.12, weight: 2 }}
            />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup><strong>Sua localização</strong></Popup>
            </Marker>
          </>
        )}

        {markers.map((marker) => {
          const isSelected = selectedProviderName === marker.providerName;
          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={isSelected ? selectedProviderIcon : providerIcon}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => onSelectProviderName?.(marker.providerName) }}
            >
              <Popup>
                <div style={{ minWidth: 180, padding: 4 }}>
                  <strong style={{ fontSize: 13 }}>{marker.providerName}</strong>
                  {marker.address && (
                    <p style={{ fontSize: 11, margin: "6px 0 0", color: "#666" }}>{marker.address}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
