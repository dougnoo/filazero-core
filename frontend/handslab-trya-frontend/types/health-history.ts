export interface HealthDocument {
  id: string
  title: string
  category: "lab-results" | "medical-images" | "vaccination" | "clinical-files"
  date: Date
  author: string
  fileType: string
  fileSize: number
  secureLink: string
  accessLevel: "public" | "private" | "restricted"
  thumbnailUrl?: string
  description?: string
  tags?: string[]
}

export interface DocumentFilter {
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
  searchTerm?: string
}
