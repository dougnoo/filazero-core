"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Upload, X } from "lucide-react"
import { categoryLabels } from "@/lib/mock-health-data"

interface DocumentUploadProps {
  onUpload: (document: any) => void
}

export function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFile = event.target.files?.[0]
    if (capturedFile) {
      setFile(capturedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !title || !category) return

    setIsUploading(true)

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newDocument = {
      id: Date.now().toString(),
      title,
      category,
      date: new Date(),
      author: "Usuário",
      fileType: file.type.split("/")[1].toUpperCase(),
      fileSize: file.size,
      secureLink: `/api/documents/secure/${Date.now()}`,
      accessLevel: "private",
      description,
      tags: [],
    }

    onUpload(newDocument)

    // Reset form
    setTitle("")
    setCategory("")
    setDescription("")
    setFile(null)
    setIsUploading(false)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Documento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Hemograma Completo"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Tirar Foto
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.dicom"
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              onChange={handleCameraCapture}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {file && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Button onClick={handleUpload} disabled={!file || !title || !category || isUploading} className="w-full">
            {isUploading ? "Enviando..." : "Enviar Documento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
