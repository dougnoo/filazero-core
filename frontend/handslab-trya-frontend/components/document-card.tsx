"use client"

import { useState } from "react"
import type { HealthDocument } from "@/types/health-history"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Eye, FileText, ImageIcon, Shield, Calendar, User } from "lucide-react"
import { categoryLabels } from "@/lib/mock-health-data"

interface DocumentCardProps {
  document: HealthDocument
}

export function DocumentCard({ document }: DocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "public":
        return "bg-green-100 text-green-800"
      case "private":
        return "bg-yellow-100 text-yellow-800"
      case "restricted":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medical-images":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleSecureDownload = () => {
    // Simulate secure download
    const link = document.createElement("a")
    link.href = document.secureLink
    link.download = `${document.title}.${document.fileType.toLowerCase()}`
    link.click()
  }

  const handlePreview = () => {
    if (document.category === "medical-images") {
      // Open in external viewer for medical images
      window.open(document.secureLink, "_blank")
    } else {
      // Show in-page preview for other documents
      setIsPreviewOpen(true)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getCategoryIcon(document.category)}
              <h3 className="font-semibold text-lg">{document.title}</h3>
            </div>
            <Badge className={getAccessLevelColor(document.accessLevel)}>
              <Shield className="h-3 w-3 mr-1" />
              {document.accessLevel}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(document.date)}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {document.author}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline">{categoryLabels[document.category]}</Badge>
            <span className="text-sm text-gray-500">
              {document.fileType} • {formatFileSize(document.fileSize)}
            </span>
          </div>

          {document.description && <p className="text-sm text-gray-600 mb-3">{document.description}</p>}

          {document.thumbnailUrl && (
            <div className="mb-3">
              <img
                src={document.thumbnailUrl || "/placeholder.svg"}
                alt={document.title}
                className="w-20 h-20 object-cover rounded border"
              />
            </div>
          )}

          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {document.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Visualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleSecureDownload} className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{document.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {document.category === "vaccination" ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">Comprovante de Vacinação</h3>
                  <p className="text-green-700 mt-2">{document.description}</p>
                  <div className="mt-3 text-sm text-green-600">
                    <p>
                      <strong>Data:</strong> {formatDate(document.date)}
                    </p>
                    <p>
                      <strong>Profissional:</strong> {document.author}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Visualização do documento</p>
                <p className="text-sm text-gray-500 mt-2">{document.title}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
