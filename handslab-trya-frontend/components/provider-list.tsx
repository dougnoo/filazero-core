"use client"

import { useState, useMemo } from "react"
import type { Provider, Clinic, UserInsurance } from "@/types/provider"
import { ProviderCard } from "./provider-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users } from "lucide-react"

interface ProviderListProps {
  providers: (Provider | Clinic)[]
  userInsurance: UserInsurance
}

export function ProviderList({ providers, userInsurance }: ProviderListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")

  const specialties = useMemo(() => {
    const allSpecialties = new Set(providers.map((p) => p.specialty))
    return ["all", ...Array.from(allSpecialties).sort()]
  }, [providers])

  const cities = useMemo(() => {
    const allCities = new Set(providers.map((p) => p.city))
    return ["all", ...Array.from(allCities).sort()]
  }, [providers])

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const nameMatch =
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      const specialtyMatch = specialtyFilter === "all" || provider.specialty === specialtyFilter
      const cityMatch = cityFilter === "all" || provider.city === cityFilter

      return nameMatch && specialtyMatch && cityMatch
    })
  }, [providers, searchTerm, specialtyFilter, cityFilter])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Cabeçalho da Lista */}
      <div className="p-2 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-800">Rede Credenciada</h2>
          <span className="text-xs text-gray-600">{filteredProviders.length} médicos</span>
        </div>

        {/* Filtros Compactos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-6 text-xs"
            />
          </div>
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="h-6 text-xs">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec} className="text-xs">
                  {spec === "all" ? "Todas" : spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="h-6 text-xs">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-xs">
                  {city === "all" ? "Todas" : city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Provedores - Scrollável */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-1.5">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} userInsurance={userInsurance} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Nenhum médico encontrado</p>
            <p className="text-xs">Ajuste os filtros de busca.</p>
          </div>
        )}
      </div>
    </div>
  )
}
