export interface FamilyMember {
  id: string
  name: string
  relationship: string
  dateOfBirth: Date
  avatar?: string
  bloodType?: string
  allergies?: string[]
  chronicConditions?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export interface HealthDocument {
  id: string
  memberId: string
  title: string
  category: "lab-results" | "medical-images" | "vaccination" | "clinical-files" | "routine-checkup"
  subCategory?: string
  date: Date
  expiryDate?: Date
  author: string
  clinic: string
  fileType: string
  fileSize: number
  secureLink: string
  accessLevel: "public" | "private" | "restricted"
  thumbnailUrl?: string
  description?: string
  tags?: string[]
  status: "valid" | "expired" | "pending" | "critical"
  priority: "low" | "medium" | "high" | "critical"
  notes?: string
  results?: {
    key: string
    value: string
    unit?: string
    normalRange?: string
    status: "normal" | "abnormal" | "critical"
  }[]
  reminders?: {
    type: "follow-up" | "retest" | "vaccination"
    date: Date
    message: string
  }[]
}

export interface HealthAlert {
  id: string
  memberId: string
  type: "exam-expired" | "vaccination-due" | "follow-up-needed" | "critical-result"
  title: string
  message: string
  date: Date
  priority: "low" | "medium" | "high" | "critical"
  isRead: boolean
  actionRequired?: boolean
}

export interface HealthInsight {
  id: string
  memberId?: string
  type: "trend" | "recommendation" | "alert" | "milestone"
  title: string
  description: string
  data?: any
  date: Date
}
