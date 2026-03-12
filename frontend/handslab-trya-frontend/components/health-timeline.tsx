"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, ImageIcon, Syringe, Activity, AlertTriangle, CheckCircle, Clock, Eye } from "lucide-react"
import type { HealthDocument, FamilyMember } from "@/types/family-health"

interface HealthTimelineProps {
  documents: HealthDocument[]
  members: FamilyMember[]
  selectedMember: string | null
  onDocumentView: (document: HealthDocument) => void
}

export function HealthTimeline({ documents, members, selectedMember, onDocumentView }: HealthTimelineProps) {
  const timelineData = useMemo(() => {
    const filteredDocs = selectedMember ? documents.filter((doc) => doc.memberId === selectedMember) : documents

    // Group documents by date
    const grouped = filteredDocs.reduce(
      (acc, doc) => {
        const dateKey = doc.date.toDateString()
        if (!acc[dateKey]) {
          acc[dateKey] = []
        }
        acc[dateKey].push(doc)
        return acc
      },
      {} as Record<string, HealthDocument[]>,
    )

    // Sort by date (newest first) and flatten
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, docs]) => ({
        date: new Date(date),
        documents: docs.sort((a, b) => b.date.getTime() - a.date.getTime()),
      }))
  }, [documents, selectedMember])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "lab-results":
        return <Activity className="h-4 w-4" />
      case "medical-images":
        return <ImageIcon className="h-4 w-4" />
      case "vaccination":
        return <Syringe className="h-4 w-4" />
      case "routine-checkup":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    return member?.name || "Membro"
  }

  const getMemberInitials = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    return (
      member?.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "M"
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">Linha do Tempo de Saúde</h2>

      {timelineData.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <FileText className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum exame encontrado</h3>
          <p className="text-gray-500">
            {selectedMember
              ? "Este membro ainda não possui exames registrados."
              : "Nenhum exame foi registrado para a família."}
          </p>
          <p className="text-sm text-gray-400 mt-1">Adicione exames para visualizá-los aqui.</p>
        </div>
      )}

      {timelineData.length > 0 && (
        <div className="relative pl-4">
          {/* Timeline line */}
          <div className="absolute left-12 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>

          <div className="space-y-10">
            {timelineData.map(({ date, documents: dayDocs }, dayIndex) => (
              <div key={dayIndex} className="relative">
                {/* Date marker */}
                <div className="flex items-center mb-6">
                  <div className="absolute left-0 w-24 h-auto flex flex-col items-center z-10">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg">
                      <span className="text-sm font-bold -mb-0.5">{date.getDate()}</span>
                      <span className="text-xs uppercase">{date.toLocaleDateString("pt-BR", { month: "short" })}</span>
                    </div>
                  </div>
                  <div className="ml-28">
                    <h3 className="text-lg font-semibold text-gray-700">{formatDate(date)}</h3>
                    <p className="text-xs text-gray-500">{dayDocs.length} evento(s) neste dia</p>
                  </div>
                </div>

                {/* Documents for this date */}
                <div className="ml-28 space-y-4">
                  {dayDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      className="hover:shadow-xl transition-shadow duration-200 border-l-4 border-blue-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1 text-blue-600">{getCategoryIcon(doc.category)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                <h4 className="font-semibold text-md text-gray-800">{doc.title}</h4>
                                <Badge className={`${getStatusColor(doc.status)} text-xs px-1.5 py-0.5`}>
                                  {doc.status}
                                </Badge>
                                {doc.priority === "critical" && (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                    Crítico
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                                <span>{doc.clinic}</span>
                                <span>•</span>
                                <span>{doc.author}</span>
                                {!selectedMember && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Avatar className="w-4 h-4">
                                        <AvatarFallback className="text-xs bg-gray-200">
                                          {getMemberInitials(doc.memberId)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{getMemberName(doc.memberId)}</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {doc.description && (
                                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{doc.description}</p>
                              )}

                              {doc.tags && doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {doc.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-50">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {doc.results && doc.results.length > 0 && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-1.5">Resultados principais:</p>
                                  <div className="space-y-1">
                                    {doc.results.slice(0, 3).map((result, index) => (
                                      <div key={index} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">{result.key}:</span>
                                        <div className="flex items-center gap-1">
                                          <span
                                            className={`font-medium ${result.status === "normal" ? "text-green-700" : "text-red-700"}`}
                                          >
                                            {result.value} {result.unit}
                                          </span>
                                          {getStatusIcon(result.status === "normal" ? "valid" : "critical")}
                                        </div>
                                      </div>
                                    ))}
                                    {doc.results.length > 3 && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        +{doc.results.length - 3} mais resultados...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2 sm:mt-0 self-start sm:self-center">
                            {getStatusIcon(doc.status)}
                            <Button variant="outline" size="sm" onClick={() => onDocumentView(doc)} className="text-xs">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
