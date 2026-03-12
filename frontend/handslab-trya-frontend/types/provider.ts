export interface OfficeHour {
  day: "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb" | "Dom"
  open: string
  close: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email?: string
  website?: string
  coordinates: {
    lat: number
    lng: number
  }
  officeHours: OfficeHour[]
  insuranceAccepted: string[]
  servicesOffered: string[]
  certifications: string[]
  rating: number
  reviewCount: number
  imageUrl?: string
  description?: string
  acceptsNewPatients: boolean
  languagesSpoken: string[]
}

export interface Clinic extends Provider {
  type: "clinic" | "hospital" | "lab"
  doctors?: Partial<Provider>[]
}

// User's insurance information
export interface UserInsurance {
  planName: string
  provider: string
  planType: "Basic" | "Premium" | "Executive"
  memberId: string
  validUntil: string
}
