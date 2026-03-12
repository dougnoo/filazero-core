"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Search, CalendarIcon, X, SlidersHorizontal } from "lucide-react"
import type { HealthDocument, FamilyMember } from "@/types/family-health"

interface SearchFilters {
  searchTerm: string
  category: string
  status: string
  clinic: string
  dateRange: {
    from: Date | null
    to: Date | null
  }
  tags: string[]
  member: string
}

interface AdvancedSearchProps {
  documents: HealthDocument[]
  members: FamilyMember[]
  onFiltersChange: (filters: SearchFilters) => void
}

export function AdvancedSearch({ documents, members, onFiltersChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    category: "all",
    status: "all",
    clinic: "all",
    dateRange: { from: null, to: null },
    tags: [],
    member: "all",
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [tagInput, setTagInput] = useState("")

  // Extract unique values for filters
  const uniqueValues = useMemo(() => {
    const clinics = [...new Set(documents.map((doc) => doc.clinic))].sort()
    const tags = [...new Set(documents.flatMap((doc) => doc.tags || []))].sort()
    const categories = [
      { value: "lab-results", label: "Exames Laboratoriais" },
      { value: "medical-images", label: "Imagens Médicas" },
      { value: "vaccination", label: "Vacinação" },
      { value: "clinical-files", label: "Arquivos Clínicos" },
      { value: "routine-checkup", label: "Check-ups" },
    ]
    const statuses = [
      { value: "valid", label: "Válido" },
      { value: "expired", label: "Vencido" },
      { value: "pending", label: "Pendente" },
      { value: "critical", label: "Crítico" },
    ]

    return { clinics, tags, categories, statuses }
  }, [documents])

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!filters.searchTerm) return []

    const searchLower = filters.searchTerm.toLowerCase()
    const titleSuggestions = documents
      .filter((doc) => doc.title.toLowerCase().includes(searchLower))
      .map((doc) => ({ type: "title", value: doc.title }))
      .slice(0, 5)

    const clinicSuggestions = uniqueValues.clinics
      .filter((clinic) => clinic.toLowerCase().includes(searchLower))
      .map((clinic) => ({ type: "clinic", value: clinic }))
      .slice(0, 3)

    const tagSuggestions = uniqueValues.tags
      .filter((tag) => tag.toLowerCase().includes(searchLower))
      .map((tag) => ({ type: "tag", value: tag }))
      .slice(0, 3)

    return [...titleSuggestions, ...clinicSuggestions, ...tagSuggestions]
  }, [filters.searchTerm, documents, uniqueValues])

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] })
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter((tag) => tag !== tagToRemove) })
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: "",
      category: "all",
      status: "all",
      clinic: "all",
      dateRange: { from: null, to: null },
      tags: [],
      member: "all",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.searchTerm ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.clinic !== "all" ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.tags.length > 0 ||
    filters.member !== "all"

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por título, descrição, clínica..."
          value={filters.searchTerm}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          className="pl-10 pr-12"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>

        {/* Autocomplete Suggestions */}
        {suggestions.length > 0 && filters.searchTerm && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
            <Command>
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem key={index} onSelect={() => updateFilters({ searchTerm: suggestion.value })}>
                    <span className="text-xs text-gray-500 mr-2">
                      {suggestion.type === "title" ? "Título" : suggestion.type === "clinic" ? "Clínica" : "Tag"}:
                    </span>
                    {suggestion.value}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueValues.categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueValues.statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clinic Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Clínica</label>
              <Select value={filters.clinic} onValueChange={(value) => updateFilters({ clinic: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueValues.clinics.map((clinic) => (
                    <SelectItem key={clinic} value={clinic}>
                      {clinic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Member Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Membro</label>
              <Select value={filters.member} onValueChange={(value) => updateFilters({ member: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? filters.dateRange.from.toLocaleDateString("pt-BR") : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from || undefined}
                    onSelect={(date) =>
                      updateFilters({
                        dateRange: { ...filters.dateRange, from: date || null },
                      })
                    }
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? filters.dateRange.to.toLocaleDateString("pt-BR") : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to || undefined}
                    onSelect={(date) =>
                      updateFilters({
                        dateRange: { ...filters.dateRange, to: date || null },
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag(tagInput)}
                className="flex-1"
              />
              <Button onClick={() => addTag(tagInput)} disabled={!tagInput}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Filtros ativos:</span>
          {filters.searchTerm && (
            <Badge variant="secondary">
              Busca: "{filters.searchTerm}"
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ searchTerm: "" })} />
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary">
              {uniqueValues.categories.find((c) => c.value === filters.category)?.label}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ category: "all" })} />
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary">
              {uniqueValues.statuses.find((s) => s.value === filters.status)?.label}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ status: "all" })} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  )
}
