import type { Clinic, Provider } from "@/types/provider"

// Expanded mock data with 100+ providers
export const mockProviders: Provider[] = [
  // Cardiologistas
  {
    id: "doc1",
    name: "Dr. Ana Silva",
    specialty: "Cardiologia",
    address: "Rua das Palmeiras, 123, Sala 101",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    phone: "(11) 98765-4321",
    email: "ana.silva@email.com",
    coordinates: { lat: -23.5505, lng: -46.6333 },
    officeHours: [
      { day: "Seg", open: "09:00", close: "18:00" },
      { day: "Qua", open: "09:00", close: "18:00" },
      { day: "Sex", open: "09:00", close: "13:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Bradesco Saúde", "SulAmérica"],
    servicesOffered: ["Consulta Cardiológica", "Ecocardiograma", "Teste Ergométrico"],
    certifications: ["Título de Especialista em Cardiologia pela SBC"],
    rating: 4.8,
    reviewCount: 152,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dr.Ana",
    description: "Cardiologista experiente com foco em prevenção.",
    acceptsNewPatients: true,
    languagesSpoken: ["Português", "Inglês"],
  },
  {
    id: "doc2",
    name: "Dr. Roberto Santos",
    specialty: "Cardiologia",
    address: "Av. Paulista, 1500, Conj. 45",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    phone: "(11) 97654-3210",
    coordinates: { lat: -23.5613, lng: -46.6563 },
    officeHours: [
      { day: "Ter", open: "08:00", close: "17:00" },
      { day: "Qui", open: "08:00", close: "17:00" },
      { day: "Sáb", open: "08:00", close: "12:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Unimed", "Porto Seguro"],
    servicesOffered: ["Cateterismo", "Holter 24h", "MAPA"],
    certifications: ["Especialista SBC", "Hemodinâmica"],
    rating: 4.9,
    reviewCount: 203,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dr.Rob",
    acceptsNewPatients: true,
    languagesSpoken: ["Português"],
  },

  // Pediatras
  {
    id: "doc3",
    name: "Dr. Carlos Oliveira",
    specialty: "Pediatria",
    address: "Av. Brasil, 456, Bloco B, Sala 02",
    city: "Rio de Janeiro",
    state: "RJ",
    zipCode: "20000-000",
    phone: "(21) 91234-5678",
    coordinates: { lat: -22.9068, lng: -43.1729 },
    officeHours: [
      { day: "Seg", open: "08:00", close: "17:00" },
      { day: "Ter", open: "08:00", close: "17:00" },
      { day: "Qui", open: "08:00", close: "17:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Unimed", "Golden Cross"],
    servicesOffered: ["Consulta Pediátrica", "Vacinação", "Puericultura"],
    certifications: ["Membro da SBP"],
    rating: 4.9,
    reviewCount: 210,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dr.Car",
    acceptsNewPatients: true,
    languagesSpoken: ["Português"],
  },
  {
    id: "doc4",
    name: "Dra. Marina Costa",
    specialty: "Pediatria",
    address: "Rua Copacabana, 789",
    city: "Rio de Janeiro",
    state: "RJ",
    zipCode: "22070-011",
    phone: "(21) 98765-4321",
    coordinates: { lat: -22.9711, lng: -43.1822 },
    officeHours: [
      { day: "Seg", open: "09:00", close: "18:00" },
      { day: "Qua", open: "09:00", close: "18:00" },
      { day: "Sex", open: "09:00", close: "18:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Bradesco Saúde"],
    servicesOffered: ["Neonatologia", "Emergência Pediátrica"],
    certifications: ["Especialista em Neonatologia"],
    rating: 4.7,
    reviewCount: 156,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dra.Mar",
    acceptsNewPatients: false,
    languagesSpoken: ["Português", "Inglês"],
  },

  // Dermatologistas
  {
    id: "doc5",
    name: "Dra. Beatriz Lima",
    specialty: "Dermatologia",
    address: "Praça da Sé, 789",
    city: "São Paulo",
    state: "SP",
    zipCode: "01001-000",
    phone: "(11) 99999-8888",
    coordinates: { lat: -23.55, lng: -46.634 },
    officeHours: [
      { day: "Ter", open: "10:00", close: "19:00" },
      { day: "Qui", open: "10:00", close: "19:00" },
      { day: "Sáb", open: "09:00", close: "14:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Porto Seguro Saúde", "Allianz"],
    servicesOffered: ["Tratamento de Acne", "Peelings", "Dermatoscopia"],
    certifications: ["Especialista SBD"],
    rating: 4.7,
    reviewCount: 98,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dra.Bea",
    acceptsNewPatients: false,
    languagesSpoken: ["Português", "Espanhol"],
  },
  {
    id: "doc6",
    name: "Dr. Fernando Rocha",
    specialty: "Dermatologia",
    address: "Rua Oscar Freire, 1200",
    city: "São Paulo",
    state: "SP",
    zipCode: "01426-001",
    phone: "(11) 94567-8901",
    coordinates: { lat: -23.5629, lng: -46.6711 },
    officeHours: [
      { day: "Seg", open: "08:00", close: "17:00" },
      { day: "Qua", open: "08:00", close: "17:00" },
      { day: "Sex", open: "08:00", close: "17:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "SulAmérica", "Amil"],
    servicesOffered: ["Cirurgia Dermatológica", "Laser", "Botox"],
    certifications: ["Cirurgia Dermatológica SBD"],
    rating: 4.8,
    reviewCount: 134,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dr.Fer",
    acceptsNewPatients: true,
    languagesSpoken: ["Português"],
  },

  // Ortopedistas
  {
    id: "doc7",
    name: "Dr. João Mendes",
    specialty: "Ortopedia",
    address: "Av. Faria Lima, 3000",
    city: "São Paulo",
    state: "SP",
    zipCode: "04538-132",
    phone: "(11) 93456-7890",
    coordinates: { lat: -23.5781, lng: -46.6836 },
    officeHours: [
      { day: "Seg", open: "07:00", close: "16:00" },
      { day: "Ter", open: "07:00", close: "16:00" },
      { day: "Qui", open: "07:00", close: "16:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Bradesco Saúde", "Unimed"],
    servicesOffered: ["Artroscopia", "Traumatologia", "Coluna"],
    certifications: ["SBOT", "Cirurgia da Coluna"],
    rating: 4.6,
    reviewCount: 187,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dr.João",
    acceptsNewPatients: true,
    languagesSpoken: ["Português"],
  },
  {
    id: "doc8",
    name: "Dra. Patrícia Alves",
    specialty: "Ortopedia",
    address: "Rua Vergueiro, 1500",
    city: "São Paulo",
    state: "SP",
    zipCode: "04101-000",
    phone: "(11) 92345-6789",
    coordinates: { lat: -23.5707, lng: -46.6395 },
    officeHours: [
      { day: "Ter", open: "08:00", close: "18:00" },
      { day: "Qui", open: "08:00", close: "18:00" },
      { day: "Sáb", open: "08:00", close: "12:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "SulAmérica"],
    servicesOffered: ["Ortopedia Pediátrica", "Pé e Tornozelo"],
    certifications: ["SBOT", "Ortopedia Pediátrica"],
    rating: 4.9,
    reviewCount: 145,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dra.Pat",
    acceptsNewPatients: true,
    languagesSpoken: ["Português", "Inglês"],
  },

  // Ginecologistas
  {
    id: "doc9",
    name: "Dra. Luciana Ferreira",
    specialty: "Ginecologia",
    address: "Av. Ipiranga, 1000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01046-010",
    phone: "(11) 91234-5678",
    coordinates: { lat: -23.5431, lng: -46.6291 },
    officeHours: [
      { day: "Seg", open: "09:00", close: "18:00" },
      { day: "Qua", open: "09:00", close: "18:00" },
      { day: "Sex", open: "09:00", close: "18:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Amil", "Bradesco Saúde"],
    servicesOffered: ["Pré-natal", "Ultrassom", "Colposcopia"],
    certifications: ["FEBRASGO"],
    rating: 4.8,
    reviewCount: 167,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dra.Luc",
    acceptsNewPatients: true,
    languagesSpoken: ["Português"],
  },
  {
    id: "doc10",
    name: "Dr. Ricardo Moura",
    specialty: "Ginecologia",
    address: "Rua Augusta, 2500",
    city: "São Paulo",
    state: "SP",
    zipCode: "01412-100",
    phone: "(11) 98765-4321",
    coordinates: { lat: -23.5558, lng: -46.6488 },
    officeHours: [
      { day: "Ter", open: "08:00", close: "17:00" },
      { day: "Qui", open: "08:00", close: "17:00" },
      { day: "Sáb", open: "08:00", close: "13:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Unimed", "Porto Seguro"],
    servicesOffered: ["Laparoscopia", "Histeroscopia", "Oncologia Ginecológica"],
    certifications: ["FEBRASGO", "Oncologia Ginecológica"],
    rating: 4.7,
    reviewCount: 123,
    imageUrl: "/placeholder.svg?width=80&height=80&text=Dr.Ric",
    acceptsNewPatients: false,
    languagesSpoken: ["Português", "Espanhol"],
  },
]

// Generate additional providers programmatically to reach 100+
const generateAdditionalProviders = (): Provider[] => {
  const specialties = [
    "Neurologia",
    "Psiquiatria",
    "Endocrinologia",
    "Gastroenterologia",
    "Pneumologia",
    "Urologia",
    "Oftalmologia",
    "Otorrinolaringologia",
    "Reumatologia",
    "Nefrologia",
  ]
  const cities = [
    { name: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 },
    { name: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729 },
    { name: "Belo Horizonte", state: "MG", lat: -19.9167, lng: -43.9345 },
    { name: "Brasília", state: "DF", lat: -15.7801, lng: -47.9292 },
    { name: "Salvador", state: "BA", lat: -12.9714, lng: -38.5014 },
  ]

  const firstNames = [
    "Dr. André",
    "Dra. Carla",
    "Dr. Eduardo",
    "Dra. Fernanda",
    "Dr. Gabriel",
    "Dra. Helena",
    "Dr. Igor",
    "Dra. Julia",
    "Dr. Leonardo",
    "Dra. Mariana",
    "Dr. Nicolas",
    "Dra. Olivia",
    "Dr. Paulo",
    "Dra. Renata",
    "Dr. Samuel",
    "Dra. Tatiana",
    "Dr. Victor",
    "Dra. Yasmin",
  ]
  const lastNames = [
    "Silva",
    "Santos",
    "Oliveira",
    "Souza",
    "Rodrigues",
    "Ferreira",
    "Alves",
    "Pereira",
    "Lima",
    "Gomes",
    "Costa",
    "Ribeiro",
    "Martins",
    "Carvalho",
    "Almeida",
    "Lopes",
    "Soares",
    "Fernandes",
  ]

  const additionalProviders: Provider[] = []

  for (let i = 11; i <= 120; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const specialty = specialties[Math.floor(Math.random() * specialties.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const acceptsAmbev = Math.random() > 0.3 // 70% chance of accepting Ambev Saúde

    const insuranceOptions = [
      "Ambev Saúde",
      "Bradesco Saúde",
      "Unimed",
      "SulAmérica",
      "Amil",
      "Porto Seguro",
      "Golden Cross",
    ]
    const acceptedInsurance = acceptsAmbev
      ? ["Ambev Saúde", ...insuranceOptions.filter((ins) => ins !== "Ambev Saúde" && Math.random() > 0.5).slice(0, 2)]
      : insuranceOptions.filter((ins) => ins !== "Ambev Saúde" && Math.random() > 0.4).slice(0, 3)

    additionalProviders.push({
      id: `doc${i}`,
      name: `${firstName} ${lastName}`,
      specialty,
      address: `Rua ${lastName}, ${100 + i}`,
      city: city.name,
      state: city.state,
      zipCode: `${String(i).padStart(5, "0")}-000`,
      phone: `(11) 9${String(i).padStart(4, "0")}-${String(i + 1000).slice(-4)}`,
      coordinates: {
        lat: city.lat + (Math.random() - 0.5) * 0.1,
        lng: city.lng + (Math.random() - 0.5) * 0.1,
      },
      officeHours: [
        { day: "Seg", open: "08:00", close: "17:00" },
        { day: "Qua", open: "08:00", close: "17:00" },
        { day: "Sex", open: "08:00", close: "17:00" },
      ],
      insuranceAccepted: acceptedInsurance,
      servicesOffered: [`Consulta ${specialty}`, "Exames Especializados"],
      certifications: [`Especialista em ${specialty}`],
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      imageUrl: `/placeholder.svg?width=80&height=80&text=${firstName.slice(0, 3)}`,
      acceptsNewPatients: Math.random() > 0.3,
      languagesSpoken: ["Português"],
    })
  }

  return additionalProviders
}

export const allProviders = [...mockProviders, ...generateAdditionalProviders()]

export const mockClinics: Clinic[] = [
  {
    id: "clinic1",
    name: "Clínica Bem Estar",
    type: "clinic",
    specialty: "Multiespecialidades",
    address: "Rua Augusta, 1000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01304-001",
    phone: "(11) 3333-4444",
    coordinates: { lat: -23.5558, lng: -46.6488 },
    officeHours: [
      { day: "Seg", open: "07:00", close: "20:00" },
      { day: "Sáb", open: "08:00", close: "12:00" },
    ],
    insuranceAccepted: ["Ambev Saúde", "Bradesco Saúde", "SulAmérica", "Unimed"],
    servicesOffered: ["Consultas", "Exames Laboratoriais", "Pequenos Procedimentos"],
    certifications: ["ISO 9001"],
    rating: 4.5,
    reviewCount: 350,
    imageUrl: "/placeholder.svg?width=100&height=80&text=BemEstar",
    acceptsNewPatients: true,
    languagesSpoken: ["Português", "Inglês"],
    doctors: [mockProviders[0], mockProviders[4]],
  },
  {
    id: "hospital1",
    name: "Hospital Central",
    type: "hospital",
    specialty: "Hospital Geral",
    address: "Av. Paulista, 2000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-200",
    phone: "(11) 5555-0000",
    coordinates: { lat: -23.5613, lng: -46.6563 },
    officeHours: [{ day: "Seg", open: "00:00", close: "23:59" }],
    insuranceAccepted: ["Ambev Saúde", "Todos os principais convênios"],
    servicesOffered: ["Emergência 24h", "Internação", "UTI", "Centro Cirúrgico"],
    certifications: ["ONA Nível 3"],
    rating: 4.6,
    reviewCount: 1200,
    imageUrl: "/placeholder.svg?width=100&height=80&text=H.Central",
    acceptsNewPatients: true,
    languagesSpoken: ["Português", "Inglês", "Espanhol"],
  },
]

// Filter only providers that accept Ambev Saúde
export const ambevCoveredProviders = allProviders.filter((provider) =>
  provider.insuranceAccepted.includes("Ambev Saúde"),
)

export const ambevCoveredClinics = mockClinics.filter((clinic) => clinic.insuranceAccepted.includes("Ambev Saúde"))

export const allAmbevNetworkEntities = [...ambevCoveredProviders, ...ambevCoveredClinics]
