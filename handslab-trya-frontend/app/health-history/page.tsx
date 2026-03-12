"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DocumentCard } from "@/components/document-card"
import { DocumentUpload } from "@/components/document-upload"
import type { HealthDocument } from "@/types/health-history"
import { mockHealthDocuments, categoryLabels } from "@/lib/mock-health-data"
import { Search, Filter, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HealthHistoryPage() {
  const [documents, setDocuments] = useState<HealthDocument[]>(mockHealthDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [displayCount, setDisplayCount] = useState(10)

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory)
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [documents, searchTerm, selectedCategory])

  // Simulate infinite scroll
  const displayedDocuments = filteredDocuments.slice(0, displayCount)

  const loadMore = () => {
    setIsLoading(true)
    setTimeout(() => {
      setDisplayCount((prev) => prev + 10)
      setIsLoading(false)
    }, 1000)
  }

  const handleDocumentUpload = (newDocument: HealthDocument) => {
    setDocuments((prev) => [newDocument, ...prev])
  }

  const getCategoryStats = () => {
    const stats = documents.reduce(
      (acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/mainpage">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Histórico de Saúde</h1>
              </div>
            </div>
            <DocumentUpload onUpload={handleDocumentUpload} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{categoryStats[key] || 0}</p>
                </div>
                <Badge variant="outline">{categoryStats[key] || 0}</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descrição, autor ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Busca: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="ml-2 hover:text-red-600">
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  {categoryLabels[selectedCategory as keyof typeof categoryLabels]}
                  <button onClick={() => setSelectedCategory("all")} className="ml-2 hover:text-red-600">
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {displayedDocuments.length} de {filteredDocuments.length} documentos
            {filteredDocuments.length !== documents.length && ` (${documents.length} total)`}
          </p>
        </div>

        {/* Documents Grid */}
        {displayedDocuments.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>

            {/* Load More Button */}
            {displayCount < filteredDocuments.length && (
              <div className="text-center">
                <Button onClick={loadMore} disabled={isLoading} variant="outline" className="px-8">
                  {isLoading ? "Carregando..." : "Carregar Mais"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando seus primeiros documentos médicos"}
            </p>
            {!searchTerm && selectedCategory === "all" && <DocumentUpload onUpload={handleDocumentUpload} />}
          </div>
        )}
      </div>
    </div>
  )
}
