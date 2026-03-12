import { InteractiveMap } from "@/components/interactive-map"
import { AiAssistant } from "@/components/ai-assistant"
import { ProviderList } from "@/components/provider-list"
import { NetworkHeader } from "@/components/network-header"
import { allAmbevNetworkEntities } from "@/lib/mock-provider-data"
import type { UserInsurance } from "@/types/provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapIcon, ListChecks, MessageSquareHeart } from "lucide-react"
import { Suspense } from "react"
import AccreditedNetworkLoading from "./loading"

export default function AccreditedNetworkPage() {
  // Apenas provedores cobertos pelo plano do usuário (100+ provedores)
  const providers = allAmbevNetworkEntities

  // Dados do plano do usuário
  const userInsurance: UserInsurance = {
    planName: "Ambev Saúde Premium",
    provider: "Ambev Saúde",
    planType: "Premium",
    memberId: "AMB123456789",
    validUntil: "2024-12-31",
  }

  return (
    <Suspense fallback={<AccreditedNetworkLoading />}>
      <div className="min-h-screen bg-gray-50">
        <NetworkHeader userInsurance={userInsurance} providerCount={providers.length} />

        {/* Layout Desktop: Mapa à esquerda, IA menor no topo direito, Lista maior embaixo */}
        <div className="hidden lg:flex container mx-auto px-4 py-3 gap-3 h-[calc(100vh-90px)]">
          <div className="w-1/2 xl:w-3/5 h-full">
            <InteractiveMap providers={providers} />
          </div>
          <div className="w-1/2 xl:w-2/5 h-full flex flex-col gap-3">
            {/* Assistente IA - Menor (55% da coluna direita) */}
            <div className="h-[55%]">
              <AiAssistant />
            </div>
            {/* Lista de Provedores - Maior (45% da coluna direita) */}
            <div className="flex-1 rounded-lg border overflow-hidden">
              <ProviderList providers={providers} userInsurance={userInsurance} />
            </div>
          </div>
        </div>

        {/* Layout Mobile/Tablet: Tabs com assistente IA priorizado */}
        <div className="lg:hidden container mx-auto px-0 sm:px-4 py-3">
          <Tabs defaultValue="ai" className="w-full h-[calc(100vh-110px)] flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-3 sticky top-[90px] bg-white/95 backdrop-blur-sm z-30 shadow-sm">
              <TabsTrigger value="ai" className="text-xs">
                <MessageSquareHeart className="h-4 w-4 mr-1" />
                Encontrar Médico
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs">
                <ListChecks className="h-4 w-4 mr-1" />
                Rede Credenciada
              </TabsTrigger>
              <TabsTrigger value="map" className="text-xs">
                <MapIcon className="h-4 w-4 mr-1" />
                Mapa
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-hidden">
              <TabsContent value="ai" className="h-full px-2 sm:px-0 m-0">
                <div className="h-full">
                  <AiAssistant />
                </div>
              </TabsContent>
              <TabsContent value="list" className="h-full px-2 sm:px-0 m-0">
                <div className="h-full rounded-lg border overflow-hidden">
                  <ProviderList providers={providers} userInsurance={userInsurance} />
                </div>
              </TabsContent>
              <TabsContent value="map" className="h-full px-2 sm:px-0 m-0">
                <div className="h-full rounded-lg overflow-hidden border">
                  <InteractiveMap providers={providers} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Suspense>
  )
}
