import type { Provider, Clinic, UserInsurance } from "@/types/provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, MapPin, Star, Shield, CheckCircle, Clock } from "lucide-react"

interface ProviderCardProps {
  provider: Provider | Clinic
  userInsurance: UserInsurance
}

export function ProviderCard({ provider, userInsurance }: ProviderCardProps) {
  const initial = provider.name.substring(0, 2).toUpperCase()

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md border-l-2 border-l-blue-500 hover:border-l-blue-600">
      <CardContent className="p-2.5">
        {/* Linha Principal - Nome, Rating e Status */}
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-7 w-7 border shrink-0">
            <AvatarImage src={provider.imageUrl || "/placeholder.svg"} alt={provider.name} />
            <AvatarFallback className="text-xs font-medium">{initial}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs truncate leading-tight">{provider.name}</h3>
              <div className="flex items-center gap-0.5 text-xs text-amber-500">
                <Star className="h-2.5 w-2.5 fill-current" />
                <span>{provider.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 truncate">{provider.specialty}</p>
          </div>

          <Badge
            variant={provider.acceptsNewPatients ? "default" : "secondary"}
            className={`text-xs px-1.5 py-0.5 shrink-0 ${
              provider.acceptsNewPatients
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-orange-100 text-orange-700 border-orange-200"
            }`}
          >
            {provider.acceptsNewPatients ? "Aceita" : "Lotado"}
          </Badge>
        </div>

        {/* Linha do Plano de Saúde */}
        <div className="flex items-center justify-between mb-1 p-1.5 bg-blue-50 rounded border border-blue-100">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">{userInsurance.planName}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Coberto</span>
          </div>
        </div>

        {/* Linha de Localização e Contato */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-2.5 w-2.5 text-gray-500" />
            <span className="text-gray-600 truncate">{provider.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Phone className="h-2.5 w-2.5 text-gray-500" />
            <a href={`tel:${provider.phone}`} className="hover:underline text-gray-600">
              {provider.phone.slice(-8)}
            </a>
          </div>
        </div>

        {/* Linha de Ação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-2.5 w-2.5" />
            <span>Disponível hoje</span>
          </div>
          <Button variant="outline" size="sm" className="h-5 text-xs px-2 py-0">
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
