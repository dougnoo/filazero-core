"use client"

import { useState } from "react"
import type { Provider, Clinic } from "@/types/provider"
import { X, Navigation } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface InteractiveMapProps {
  providers: (Provider | Clinic)[]
  onMarkerClick?: (providerId: string) => void
}

// Para simulação, definir limites do mapa (área de São Paulo)
const MAP_BOUNDS = {
  minLat: -23.7,
  maxLat: -23.4,
  minLng: -46.8,
  maxLng: -46.3,
}

export function InteractiveMap({ providers, onMarkerClick }: InteractiveMapProps) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | Clinic | null>(null)

  const getPositionOnMap = (lat: number, lng: number) => {
    const percentLat = ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100
    const percentLng = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100
    return { top: `${100 - percentLat}%`, left: `${percentLng}%` }
  }

  const handleMarkerClick = (provider: Provider | Clinic) => {
    setSelectedProvider(provider)
    if (onMarkerClick) {
      onMarkerClick(provider.id)
    }
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-full rounded-lg overflow-hidden border bg-gray-100 shadow-sm">
      {/* Imagem estilo Google Maps de São Paulo */}
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5BEBCE886527-1-nxsLptQKsDdGtjs89I0SL11ZF3yaqG.jpeg"
        alt="Mapa da região - Rede credenciada"
        fill
        className="object-cover"
        priority
      />

      {providers.map((provider) => {
        // Garantir que as coordenadas estejam dentro dos limites simulados para visibilidade
        if (
          provider.coordinates.lat < MAP_BOUNDS.minLat ||
          provider.coordinates.lat > MAP_BOUNDS.maxLat ||
          provider.coordinates.lng < MAP_BOUNDS.minLng ||
          provider.coordinates.lng > MAP_BOUNDS.maxLng
        ) {
          return null
        }
        const position = getPositionOnMap(provider.coordinates.lat, provider.coordinates.lng)
        return (
          <button
            key={provider.id}
            className="absolute transform -translate-x-1/2 -translate-y-full p-1 focus:outline-none transition-all duration-200 hover:scale-110"
            style={{
              top: position.top,
              left: position.left,
              zIndex: selectedProvider?.id === provider.id ? 20 : 10,
            }}
            onClick={() => handleMarkerClick(provider)}
            title={provider.name}
          >
            {/* Marcador estilo Google Maps */}
            <div
              className={`relative transition-all duration-200 ${
                selectedProvider?.id === provider.id ? "scale-125" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  selectedProvider?.id === provider.id ? "bg-blue-500" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              {/* Ponteiro do marcador */}
              <div
                className={`absolute top-6 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent ${
                  selectedProvider?.id === provider.id ? "border-t-blue-500" : "border-t-red-500"
                }`}
              />
            </div>
          </button>
        )
      })}

      {selectedProvider && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:max-w-sm shadow-xl z-30 animate-fade-in-up bg-white border-0">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-semibold">{selectedProvider.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedProvider(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm">
            <p className="font-medium text-blue-600 mb-1">{selectedProvider.specialty}</p>
            <p className="text-gray-600 text-xs mb-3">{selectedProvider.address}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => alert(`Ver detalhes de ${selectedProvider.name}`)}
              >
                Ver Detalhes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-8"
                onClick={() => alert(`Navegar até ${selectedProvider.name}`)}
              >
                <Navigation className="h-3 w-3 mr-1" />
                Navegar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles estilo Google Maps */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 bg-white hover:bg-gray-50 shadow-md"
          onClick={() => alert("Zoom In")}
        >
          +
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 bg-white hover:bg-gray-50 shadow-md"
          onClick={() => alert("Zoom Out")}
        >
          −
        </Button>
      </div>

      {/* Legenda estilo Google Maps */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-red-500 rounded-full border border-white shadow-sm" />
          <span className="font-medium">Médicos Disponíveis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border border-white shadow-sm" />
          <span className="font-medium">Selecionado</span>
        </div>
      </div>

      {/* Contador de provedores */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs font-medium">
        📍 {providers.length} médicos na região
      </div>
    </div>
  )
}
