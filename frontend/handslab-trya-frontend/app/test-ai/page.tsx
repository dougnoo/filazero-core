"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, Loader2, CheckCircle, Stethoscope, ArrowLeft, Paperclip, Camera, FileText, X, Clock, Activity, Mic, Menu } from 'lucide-react'
import Link from "next/link"
import { RedentorLogo } from "@/components/redentor-logo"

// Add CSS for waveform animation
const waveformAnimation = `
@keyframes waveform {
  0% {
    height: 10%;
  }
  100% {
    height: 80%;
  }
}
`

interface Message {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
  typing?: boolean
  suggestions?: string[]
  attachments?: {
    type: "image" | "file"
    name: string
    url: string
    size?: string
  }[]
  metadata?: {
    confidence?: number
    category?: string
    urgency?: "low" | "medium" | "high"
    recommendations?: string[]
    exams?: string[]
    questionType?: string
  }
}

interface IdentifiedExam {
  id: string
  name: string
  reason: string
  priority: "high" | "medium" | "low"
  category: string
  urgency: string
  estimatedCost?: string
  preparation?: string
}

interface PatientHistory {
  allergies: string[]
  medications: string[]
  conditions: string[]
  surgeries: string[]
  familyHistory: string[]
  lastVisit: string
  age: number
  gender: string
}

// Adicionar interface para dados básicos do paciente
interface BasicPatientData {
  name: string
  cpf: string
  planNumber: string
  birthDate: string
  phone: string
  address: string
  emergencyContact: string
}

interface RedFlag {
  condition: string
  severity: "critical" | "urgent" | "warning"
  message: string
  immediateAction: string
}

interface SpecialtyFlow {
  specialty: string
  triggers: string[]
  questions: ExploratoryQuestion[]
  redFlags: RedFlag[]
}

interface ExploratoryQuestion {
  question: string
  suggestions: string[]
  type: string
  followUp?: (response: string) => ExploratoryQuestion | null
  redFlagCheck?: (response: string) => RedFlag | null
}

interface VitalSigns {
  bloodPressure?: string
  heartRate?: string
  temperature?: string
  oxygenSaturation?: string
  respiratoryRate?: string
}

// Adicionar interface para o novo fluxo
interface TriageStep {
  step: number
  title: string
  type: "gravity" | "location" | "lab" | "exams" | "hospital" | "checkin"
}

interface GravityQuestion {
  id: string
  question: string
  options: string[]
  isGrave: (answer: string) => boolean
}

interface Location {
  city: string
  state: string
  neighborhood?: string
}

interface Lab {
  name: string
  address: string
  distance: string
  phone: string
}

interface Hospital {
  name: string
  address: string
  distance: string
  phone: string
  emergency: boolean
}

interface AudioRecording {
  blob: Blob
  url: string
  duration: number
}

// Modificar o mockPatientHistory para incluir dados básicos já preenchidos
const mockPatientHistory: PatientHistory = {
  allergies: [],
  medications: [],
  conditions: [],
  surgeries: [],
  familyHistory: [],
  lastVisit: "15/11/2024",
  age: 45,
  gender: "Feminino",
}

// Adicionar dados básicos mockados
const basicPatientData: BasicPatientData = {
  name: "Maria Silva Santos",
  cpf: "123.456.789-00",
  planNumber: "12345678901",
  birthDate: "15/03/1979",
  phone: "(11) 99999-9999",
  address: "Rua das Flores, 123 - São Paulo/SP",
  emergencyContact: "João Silva - (11) 88888-8888",
}

const redFlagDetection = {
  "dor no peito": [
    {
      condition: "Possível Infarto Agudo do Miocárdio",
      severity: "critical" as const,
      message: "⚠️ ATENÇÃO: Sintomas sugestivos de emergência cardíaca",
      immediateAction: "Procurar atendimento de emergência IMEDIATAMENTE",
    },
    {
      condition: "Síndrome Coronariana Aguda",
      severity: "urgent" as const,
      message: "⚠️ Sintomas requerem avaliação médica urgente",
      immediateAction: "Dirigir-se ao pronto-socorro nas próximas 2 horas",
    },
  ],
  "dor de cabeça": [
    {
      condition: "Possível Meningite ou AVC",
      severity: "critical" as const,
      message: "⚠️ ATENÇÃO: Cefaleia com sinais de alarme",
      immediateAction: "Procurar atendimento de emergência IMEDIATAMENTE",
    },
  ],
  febre: [
    {
      condition: "Sepse ou Infecção Grave",
      severity: "urgent" as const,
      message: "⚠️ Febre alta com sinais de gravidade",
      immediateAction: "Avaliação médica urgente necessária",
    },
  ],
}

const specialtyFlows: SpecialtyFlow[] = [
  {
    specialty: "Cardiologia",
    triggers: ["dor no peito", "palpitação", "falta de ar", "tontura"],
    questions: [
      {
        question: "A dor no peito irradia para braço, pescoço ou mandíbula?",
        suggestions: ["Sim, para o braço esquerdo", "Sim, para pescoço", "Sim, para mandíbula", "Não irradia"],
        type: "radiation",
        redFlagCheck: (response: string) => {
          if (response.includes("braço") || response.includes("pescoço") || response.includes("mandíbula")) {
            return redFlagDetection["dor no peito"][0]
          }
          return null
        },
      },
      {
        question: "Você está sentindo náusea, suor frio ou falta de ar junto com a dor?",
        suggestions: ["Sim, náusea e suor", "Sim, falta de ar", "Sim, todos os sintomas", "Não"],
        type: "associated_symptoms",
        redFlagCheck: (response: string) => {
          if (response.includes("todos") || (response.includes("náusea") && response.includes("suor"))) {
            return redFlagDetection["dor no peito"][0]
          }
          return null
        },
      },
    ],
    redFlags: redFlagDetection["dor no peito"],
  },
  {
    specialty: "Neurologia",
    triggers: ["dor de cabeça", "tontura", "confusão", "fraqueza"],
    questions: [
      {
        question: "Essa dor de cabeça é diferente de qualquer outra que você já teve?",
        suggestions: ["Sim, completamente diferente", "Sim, muito mais forte", "Não, é similar", "Não sei dizer"],
        type: "pattern_change",
        redFlagCheck: (response: string) => {
          if (response.includes("completamente diferente") || response.includes("muito mais forte")) {
            return redFlagDetection["dor de cabeça"][0]
          }
          return null
        },
      },
      {
        question: "Você tem rigidez no pescoço, febre ou confusão mental?",
        suggestions: ["Sim, pescoço rígido", "Sim, confusão", "Sim, febre alta", "Não"],
        type: "meningeal_signs",
        redFlagCheck: (response: string) => {
          if (response.includes("rígido") || response.includes("confusão")) {
            return redFlagDetection["dor de cabeça"][0]
          }
          return null
        },
      },
    ],
    redFlags: redFlagDetection["dor de cabeça"],
  },
]

const advancedExamRecommendations = {
  cardiologia_urgente: [
    {
      id: "card_1",
      name: "Eletrocardiograma (ECG) Seriado",
      reason: "Monitorar atividade elétrica cardíaca em tempo real",
      priority: "high" as const,
      category: "Cardiológico",
      urgency: "Imediato",
      estimatedCost: "R$ 25-45",
      preparation: "Nenhuma preparação especial",
      specialty: "Cardiologia",
    },
    {
      id: "card_2",
      name: "Troponina I Ultra-sensível",
      reason: "Detectar lesão mínima do músculo cardíaco",
      priority: "high" as const,
      category: "Laboratorial",
      urgency: "Imediato",
      estimatedCost: "R$ 120-180",
      preparation: "Jejum não necessário",
      specialty: "Cardiologia",
    },
    {
      id: "card_3",
      name: "Ecocardiograma com Doppler",
      reason: "Avaliar função e estrutura cardíaca detalhadamente",
      priority: "high" as const,
      category: "Imagem",
      urgency: "2-4h",
      estimatedCost: "R$ 200-350",
      preparation: "Jejum de 4 horas",
      specialty: "Cardiologia",
    },
  ],
  neurologia_urgente: [
    {
      id: "neuro_1",
      name: "Tomografia de Crânio sem Contraste",
      reason: "Descartar hemorragia intracraniana ou lesões agudas",
      priority: "high" as const,
      category: "Imagem",
      urgency: "Imediato",
      estimatedCost: "R$ 200-350",
      preparation: "Remover objetos metálicos",
      specialty: "Neurologia",
    },
    {
      id: "neuro_2",
      name: "Punção Lombar",
      reason: "Investigar meningite ou hemorragia subaracnóidea",
      priority: "high" as const,
      category: "Procedimento",
      urgency: "Imediato",
      estimatedCost: "R$ 300-500",
      preparation: "Jejum de 6 horas",
      specialty: "Neurologia",
    },
  ],
}

// Adicionar perguntas mais profundas baseadas na triagem clássica
const deepTriageQuestions = {
  "dor de cabeça": [
    {
      question:
        "Olá Maria! Vejo que você está com dor de cabeça. Em uma escala de 0 a 10, sendo 10 a pior dor que já sentiu, como classificaria essa dor agora?",
      suggestions: ["1-3 (leve)", "4-6 (moderada)", "7-8 (forte)", "9-10 (insuportável)"],
      type: "pain_intensity",
    },
    {
      question: "Há quanto tempo exatamente você está com essa dor de cabeça?",
      suggestions: ["Menos de 1 hora", "1-6 horas", "6-24 horas", "Mais de 1 dia"],
      type: "symptom_duration",
    },
    {
      question: "Onde exatamente é a dor? Consegue apontar ou descrever a localização?",
      suggestions: ["Testa", "Têmporas (laterais)", "Nuca/pescoço", "Toda a cabeça"],
      type: "pain_location",
    },
    {
      question: "Como você descreveria essa dor? Qual a sensação predominante?",
      suggestions: ["Pontada/agulhada", "Pressão/aperto", "Latejante/pulsátil", "Queimação"],
      type: "pain_quality",
    },
    {
      question: "Você já tomou algum remédio para essa dor? Se sim, qual e quando?",
      suggestions: ["Não tomei nada", "Dipirona há 2h", "Paracetamol há 1h", "Outro medicamento"],
      type: "medication_taken",
    },
    {
      question: "Existe algo que piora ou melhora essa dor? Como luz, movimento, posição?",
      suggestions: ["Piora com luz", "Piora com movimento", "Melhora deitada", "Nada altera"],
      type: "pain_modifiers",
    },
    {
      question: "Você tem outros sintomas junto com a dor de cabeça? Como náusea, vômito, visão embaçada?",
      suggestions: ["Só a dor", "Náusea", "Vômito", "Visão embaçada"],
      type: "associated_symptoms",
    },
    {
      question: "Quando foi sua última refeição e o que comeu?",
      suggestions: ["Café da manhã normal", "Não comi hoje", "Almoço há 2h", "Só líquidos"],
      type: "last_meal",
    },
  ],
  febre: [
    {
      question: "Maria, você mencionou febre. Conseguiu medir a temperatura? Qual foi o valor mais alto?",
      suggestions: ["Não medi", "37,5-38°C", "38-39°C", "Acima de 39°C"],
      type: "temperature_measurement",
    },
    {
      question: "Há quanto tempo você está com febre?",
      suggestions: ["Algumas horas", "Desde ontem", "2-3 dias", "Mais de 3 dias"],
      type: "fever_duration",
    },
    {
      question: "Além da febre, você tem outros sintomas? Calafrios, dor no corpo, suor excessivo?",
      suggestions: ["Só febre", "Calafrios intensos", "Dor no corpo toda", "Suor excessivo"],
      type: "fever_symptoms",
    },
    {
      question: "Você tomou algum antitérmico? Qual e quando?",
      suggestions: ["Não tomei", "Paracetamol há 2h", "Dipirona há 1h", "Ibuprofeno"],
      type: "antipyretic_taken",
    },
    {
      question: "Tem alguma dor específica? Garganta, ouvido, ao urinar, barriga?",
      suggestions: ["Nenhuma dor específica", "Dor de garganta", "Dor ao urinar", "Dor abdominal"],
      type: "specific_pain",
    },
    {
      question: "Considerando seu diabetes, você tem medido a glicemia? Como estão os valores?",
      suggestions: ["Não medi", "Normal (80-120)", "Alta (acima 180)", "Não tenho glicosímetro"],
      type: "glucose_monitoring",
    },
  ],
  "dor no peito": [
    {
      question: "Maria, dor no peito é sempre preocupante. Quando exatamente começou essa dor?",
      suggestions: ["Agora mesmo", "Há 30 minutos", "Há algumas horas", "Desde ontem"],
      type: "chest_pain_onset",
    },
    {
      question: "Em uma escala de 0 a 10, quão intensa é essa dor no peito?",
      suggestions: ["1-3 (leve)", "4-6 (moderada)", "7-8 (forte)", "9-10 (insuportável)"],
      type: "chest_pain_intensity",
    },
    {
      question: "Como você descreveria essa dor? É mais como aperto, queimação, pontada?",
      suggestions: ["Aperto/pressão", "Queimação", "Pontada aguda", "Peso no peito"],
      type: "chest_pain_quality",
    },
    {
      question: "A dor irradia para algum lugar? Braço, pescoço, mandíbula, costas?",
      suggestions: ["Não irradia", "Braço esquerdo", "Pescoço/mandíbula", "Costas"],
      type: "pain_radiation",
    },
    {
      question: "Você está sentindo falta de ar, suor frio ou náusea junto com a dor?",
      suggestions: ["Só a dor", "Falta de ar", "Suor frio", "Náusea"],
      type: "associated_cardiac_symptoms",
    },
    {
      question: "A dor piora quando você respira fundo, tosse ou se move?",
      suggestions: ["Não muda", "Piora ao respirar", "Piora ao mover", "Melhora em repouso"],
      type: "respiratory_relation",
    },
    {
      question: "Você tomou algum medicamento para a dor? Sua pressão está controlada?",
      suggestions: ["Não tomei nada", "Tomei AAS", "Pressão normal", "Pressão alta hoje"],
      type: "medication_bp_status",
    },
  ],
}

const examRecommendations = {
  "dor de cabeça": [
    {
      id: "1",
      name: "Hemograma Completo",
      reason: "Investigar possíveis causas infecciosas ou inflamatórias da cefaleia",
      priority: "medium" as const,
      category: "Laboratorial",
      urgency: "24-48h",
      estimatedCost: "R$ 25-40",
      preparation: "Jejum não necessário",
    },
    {
      id: "2",
      name: "Tomografia de Crânio sem Contraste",
      reason: "Avaliar estruturas cerebrais e descartar lesões ocupando espaço",
      priority: "high" as const,
      category: "Imagem",
      urgency: "24h",
      estimatedCost: "R$ 200-350",
      preparation: "Remover objetos metálicos",
    },
    {
      id: "3",
      name: "Dosagem de Eletrólitos",
      reason: "Verificar desequilíbrios que podem causar cefaleia",
      priority: "medium" as const,
      category: "Laboratorial",
      urgency: "48h",
      estimatedCost: "R$ 30-50",
      preparation: "Jejum de 8 horas",
    },
  ],
  febre: [
    {
      id: "4",
      name: "Hemograma Completo com Plaquetas",
      reason: "Avaliar contagem de células sanguíneas e detectar infecções",
      priority: "high" as const,
      category: "Laboratorial",
      urgency: "24h",
      estimatedCost: "R$ 25-40",
      preparation: "Jejum não necessário",
    },
    {
      id: "5",
      name: "PCR (Proteína C Reativa)",
      reason: "Detectar e monitorar processo inflamatório",
      priority: "high" as const,
      category: "Laboratorial",
      urgency: "24h",
      estimatedCost: "R$ 20-35",
      preparation: "Jejum não necessário",
    },
    {
      id: "6",
      name: "Hemoglobina Glicada (HbA1c)",
      reason: "Monitorar controle glicêmico durante processo infeccioso",
      priority: "medium" as const,
      category: "Laboratorial",
      urgency: "48h",
      estimatedCost: "R$ 35-55",
      preparation: "Jejum não necessário",
    },
    {
      id: "7",
      name: "Urocultura",
      reason: "Investigar possível infecção urinária",
      priority: "medium" as const,
      category: "Laboratorial",
      urgency: "24-48h",
      estimatedCost: "R$ 40-60",
      preparation: "Coleta de urina em frasco estéril",
    },
  ],
  "dor no peito": [
    {
      id: "8",
      name: "Eletrocardiograma (ECG)",
      reason: "Avaliar atividade elétrica cardíaca e detectar alterações agudas",
      priority: "high" as const,
      category: "Cardiológico",
      urgency: "Imediato",
      estimatedCost: "R$ 25-45",
      preparation: "Nenhuma preparação especial",
    },
    {
      id: "9",
      name: "Troponina I",
      reason: "Detectar lesão do músculo cardíaco",
      priority: "high" as const,
      category: "Laboratorial",
      urgency: "Imediato",
      estimatedCost: "R$ 80-120",
      preparation: "Jejum não necessário",
    },
    {
      id: "10",
      name: "Raio-X de Tórax",
      reason: "Avaliar estruturas torácicas e descartar alterações pulmonares",
      priority: "high" as const,
      category: "Imagem",
      urgency: "2-4h",
      estimatedCost: "R$ 40-70",
      preparation: "Remover objetos metálicos do tórax",
    },
  ],
}

// Modificar o exploratoryQuestions para usar as perguntas mais profundas:
const exploratoryQuestions = {
  initial: [
    {
      question:
        "Olá Maria! Sou a assistente de triagem da Redentor Seguros. Vou te ajudar com uma avaliação médica personalizada. Para começar, qual é o principal problema que te trouxe aqui hoje?",
      suggestions: ["Dor de cabeça", "Febre", "Dor no peito", "Outro sintoma"],
      type: "chief_complaint",
    },
  ],
  ...deepTriageQuestions,
}

// Implementar as 3 perguntas de gravidade baseadas em protocolos médicos
const gravityQuestions: GravityQuestion[] = [
  {
    id: "breathing",
    question: "Você está com dificuldade para respirar ou falta de ar intensa?",
    options: ["Sim, muita dificuldade", "Sim, um pouco", "Não"],
    isGrave: (answer) => answer.includes("muita dificuldade"),
  },
  {
    id: "consciousness",
    question: "Você está sentindo confusão mental, tontura severa ou desmaios?",
    options: ["Sim, confusão/desmaios", "Sim, tontura leve", "Não"],
    isGrave: (answer) => answer.includes("confusão") || answer.includes("desmaios"),
  },
  {
    id: "pain",
    question: "Sua dor está em nível 8-10 (sendo 10 insuportável) ou você tem dor no peito?",
    options: ["Sim, dor 8-10 ou no peito", "Dor moderada (5-7)", "Dor leve (1-4)"],
    isGrave: (answer) => answer.includes("8-10") || answer.includes("peito"),
  },
]

// Adicionar sistema de localização e laboratórios
const mockLabs: Record<string, Lab[]> = {
  "São Paulo": [
    {
      name: "Laboratório Delboni Auriemo",
      address: "Av. Paulista, 1159 - Bela Vista",
      distance: "2.3 km",
      phone: "(11) 3049-6999",
    },
    {
      name: "Laboratório Fleury",
      address: "Av. Faria Lima, 1571 - Jardim Paulistano",
      distance: "3.1 km",
      phone: "(11) 5014-7700",
    },
  ],
}

// Implementar sistema de hospitais e check-in
const mockHospitals: Record<string, Hospital[]> = {
  "São Paulo": [
    {
      name: "Hospital Sírio-Libanês",
      address: "R. Dona Adma Jafet, 91 - Bela Vista",
      distance: "1.8 km",
      phone: "(11) 3394-5000",
      emergency: true,
    },
  ],
}

export default function TestAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Olá! Vou te ajudar com uma triagem médica personalizada. Para começar, o que te trouxe aqui hoje?",
      timestamp: new Date(),
      suggestions: ["Dor de cabeça", "Febre", "Dor no peito", "Cansaço"],
      metadata: { questionType: "chief_complaint" },
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentFlow, setCurrentFlow] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [identifiedExams, setIdentifiedExams] = useState<IdentifiedExam[]>([])
  const [showExamPresentation, setShowExamPresentation] = useState(false)
  const [collectedInfo, setCollectedInfo] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [detectedRedFlags, setDetectedRedFlags] = useState<RedFlag[]>([])
  const [currentSpecialty, setCurrentSpecialty] = useState<string | null>(null)
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({})
  const [riskFactors, setRiskFactors] = useState<string[]>([])
  const [progressIndicator, setProgressIndicator] = useState(0)
  const [dynamicPatientHistory, setDynamicPatientHistory] = useState<PatientHistory>(mockPatientHistory)

  // Implementar lógica de fluxo
  const [currentStep, setCurrentStep] = useState<TriageStep>({
    step: 1,
    title: "Avaliação de Gravidade",
    type: "gravity",
  })

  const [gravityAnswers, setGravityAnswers] = useState<string[]>([])
  const [isGraveCase, setIsGraveCase] = useState(false)
  const [patientLocation, setPatientLocation] = useState<Location | null>(null)
  const [recommendedLab, setRecommendedLab] = useState<Lab | null>(null)
  const [recommendedHospital, setRecommendedHospital] = useState<Hospital | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Add mobile-specific state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateTyping = (duration = 1500) => {
    setIsTyping(true)
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsTyping(false)
        resolve(true)
      }, duration)
    })
  }

  const getNextQuestion = (flow: string, index: number, userResponse: string) => {
    const questions = exploratoryQuestions[flow as keyof typeof exploratoryQuestions]
    if (!questions || index >= questions.length) {
      return null
    }
    return questions[index]
  }

  const generateContextualQuestion = (flow: string, collectedData: Record<string, string>) => {
    // Generate questions based on patient history and collected information
    if (flow === "dor de cabeça" && collectedData.intensity === "9-10 (insuportável)") {
      return {
        question:
          "Considerando a intensidade da dor, você já teve episódios similares antes? Vejo que você tem histórico familiar de hipertensão.",
        suggestions: ["Primeira vez", "Já tive similar", "Pior que outras vezes", "Diferente do usual"],
        type: "history_comparison",
      }
    }

    if (flow === "febre" && collectedData.duration === "Mais de 3 dias") {
      return {
        question:
          "Febre persistente por mais de 3 dias é preocupante, especialmente com seu diabetes. Você notou alguma ferida que não cicatriza ou infecção?",
        suggestions: ["Não notei nada", "Tenho uma ferida", "Infecção urinária", "Dor de garganta"],
        type: "infection_source",
      }
    }

    return null
  }

  const shouldCompleteTriagem = (flow: string, questionIndex: number, collectedData: Record<string, string>) => {
    const questions = exploratoryQuestions[flow as keyof typeof exploratoryQuestions]
    return questionIndex >= (questions?.length || 0) || Object.keys(collectedData).length >= 5
  }

  const generateFinalRecommendation = (flow: string, collectedData: Record<string, string>) => {
    const exams = examRecommendations[flow as keyof typeof examRecommendations] || []

    let recommendation = `Com base nas informações coletadas e considerando seu histórico médico, recomendo os seguintes exames:\n\n`

    // Add contextual information
    if (flow === "dor de cabeça") {
      recommendation += `Considerando sua hipertensão e o padrão da cefaleia descrito, é importante investigar causas secundárias.\n\n`
    } else if (flow === "febre") {
      recommendation += `Dado seu diabetes tipo 2, infecções podem ter evolução mais complicada e requerem investigação cuidadosa.\n\n`
    } else if (flow === "dor no peito") {
      recommendation += `⚠️ Dor torácica requer avaliação urgente, especialmente considerando seus fatores de risco cardiovascular.\n\n`
    }

    recommendation += `**Próximo passo essencial:** Agendar consulta médica para avaliação presencial e interpretação dos resultados dos exames.`

    return {
      content: recommendation,
      exams: exams,
    }
  }

  const handleFileUpload = async (files: FileList | null, type: "file" | "camera") => {
    if (!files || files.length === 0) return

    const file = files[0]
    const url = URL.createObjectURL(file)

    const attachment = {
      type: file.type.startsWith("image/") ? ("image" as const) : ("file" as const),
      name: file.name,
      url: url,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: type === "camera" ? "Foto capturada" : `Arquivo enviado: ${file.name}`,
      timestamp: new Date(),
      attachments: [attachment],
    }

    setMessages((prev) => [...prev, userMessage])

    await simulateTyping(2000)

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content:
        "Obrigada por enviar essa informação. Vou analisar e continuar com algumas perguntas para entender melhor seu caso. Baseado no que vejo, você tem algum sintoma específico que gostaria de investigar?",
      timestamp: new Date(),
      suggestions: ["Dor de cabeça", "Febre", "Dor no peito", "Outro sintoma"],
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioRecording({
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
        })

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Clear the recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioRecording && audioPlayerRef.current) {
      audioPlayerRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    if (audioRecording) {
      URL.revokeObjectURL(audioRecording.url)
      setAudioRecording(null)
      setIsPlaying(false)
    }
  }

  const sendAudioMessage = async () => {
    if (!audioRecording) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: "Áudio enviado",
      timestamp: new Date(),
      attachments: [
        {
          type: "file",
          name: `audio_${Date.now()}.wav`,
          url: audioRecording.url,
          size: `${(audioRecording.blob.size / 1024).toFixed(2)} KB`,
        },
      ],
    }

    setMessages((prev) => [...prev, userMessage])
    deleteRecording()

    await simulateTyping(2000)

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content:
        "Recebi seu áudio. Estou analisando o conteúdo para entender melhor seus sintomas. Pode me fornecer mais detalhes sobre o que está sentindo?",
      timestamp: new Date(),
      suggestions: ["Dor de cabeça", "Febre", "Dor no peito", "Outro sintoma"],
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  // Add audio player event handlers
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
  }, [audioRecording])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue.toLowerCase()
    setInputValue("")

    // Store collected information
    const newCollectedInfo = { ...collectedInfo, [questionIndex]: inputValue }
    setCollectedInfo(newCollectedInfo)

    // Atualizar histórico dinâmico baseado nas respostas
    if (currentInput.includes("hipertensão") || currentInput.includes("pressão alta")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        conditions: [...prev.conditions, "Hipertensão"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }
    if (currentInput.includes("diabetes")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        conditions: [...prev.conditions, "Diabetes tipo 2"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }
    if (currentInput.includes("losartana")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        medications: [...prev.medications, "Losartana 50mg"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }
    if (currentInput.includes("dipirona")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        medications: [...prev.medications, "Dipirona 500mg"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }
    if (currentInput.includes("paracetamol")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        medications: [...prev.medications, "Paracetamol 750mg"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }
    if (currentInput.includes("alergia") || currentInput.includes("penicilina")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        allergies: [...prev.allergies, "Penicilina"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }
    if (currentInput.includes("cirurgia") || currentInput.includes("operação")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        surgeries: [...prev.surgeries, "Cirurgia mencionada"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }
    if (currentInput.includes("família") || currentInput.includes("pai") || currentInput.includes("mãe")) {
      setDynamicPatientHistory((prev) => ({
        ...prev,
        familyHistory: [...prev.familyHistory, "Histórico familiar mencionado"].filter((v, i, a) => a.indexOf(v) === i),
      }))
    }

    await simulateTyping(1500)

    // Check for red flags first
    let detectedRedFlag: RedFlag | null = null

    if (currentFlow) {
      const specialty = specialtyFlows.find((s) => s.triggers.some((trigger) => currentFlow.includes(trigger)))

      if (specialty) {
        for (const question of specialty.questions) {
          if (question.redFlagCheck) {
            const flag = question.redFlagCheck(inputValue)
            if (flag) {
              detectedRedFlag = flag
              break
            }
          }
        }
      }
    }

    // Handle red flag detection
    if (detectedRedFlag) {
      const urgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `${detectedRedFlag.message}

${detectedRedFlag.immediateAction}

Com base nos sintomas descritos e seu histórico médico, esta situação requer atenção médica imediata. Não aguarde - procure o pronto-socorro agora.

Enquanto isso, recomendo os seguintes exames de emergência:`,
        timestamp: new Date(),
        metadata: {
          confidence: 95,
          urgency: detectedRedFlag.severity,
          category: "emergency",
        },
      }

      setMessages((prev) => [...prev, urgentMessage])

      // Set emergency exams
      const emergencyExams = currentFlow?.includes("peito")
        ? advancedExamRecommendations.cardiologia_urgente
        : currentFlow?.includes("cabeça")
          ? advancedExamRecommendations.neurologia_urgente
          : []

      setIdentifiedExams(emergencyExams)
      setShowExamPresentation(true)
      return
    }

    // Handle gravity assessment
    if (currentStep.type === "gravity") {
      const currentQuestion = gravityQuestions[gravityAnswers.length]

      if (currentQuestion) {
        const answer = inputValue
        const isGrave = currentQuestion.isGrave(answer)

        setGravityAnswers((prev) => [...prev, answer])
        setIsGraveCase(isGraveCase || isGrave)

        if (gravityAnswers.length < gravityQuestions.length - 1) {
          // Ask next gravity question
          const nextQuestionIndex = gravityAnswers.length + 1
          const nextQuestion = gravityQuestions[nextQuestionIndex]

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: nextQuestion.question,
            timestamp: new Date(),
            suggestions: nextQuestion.options,
            metadata: { questionType: "gravity" },
          }

          setMessages((prev) => [...prev, aiMessage])
        } else {
          // Gravity assessment complete
          if (isGraveCase) {
            // Recommend immediate hospital visit
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: "ai",
              content:
                "Com base nas suas respostas, parece que você precisa de atendimento médico imediato. Recomendo que vá ao hospital mais próximo o mais rápido possível.",
              timestamp: new Date(),
              metadata: { urgency: "high", category: "emergency" },
            }

            setMessages((prev) => [...prev, aiMessage])
            setCurrentStep({ step: 5, title: "Check-in Hospitalar", type: "hospital" })
          } else {
            // Continue with location input
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: "ai",
              content: "Por favor, informe sua cidade e estado para que eu possa recomendar um laboratório próximo.",
              timestamp: new Date(),
              metadata: { questionType: "location" },
            }

            setMessages((prev) => [...prev, aiMessage])
            setCurrentStep({ step: 2, title: "Informar Localização", type: "location" })
          }
        }
        return
      }
    }

    // Handle location input
    if (currentStep.type === "location") {
      try {
        const [city, state] = inputValue.split(",").map((s) => s.trim())
        if (!city || !state) {
          throw new Error("Formato inválido. Use 'Cidade, Estado'.")
        }

        setPatientLocation({ city, state })

        // Recommend lab based on location
        if (mockLabs[city]) {
          const lab = mockLabs[city][0] // Get first lab for simplicity

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: `Recomendamos o laboratório ${lab.name}, localizado em ${lab.address}.`,
            timestamp: new Date(),
            metadata: { lab: lab.name, address: lab.address },
          }

          setMessages((prev) => [...prev, aiMessage])
          setRecommendedLab(lab)
          setCurrentStep({ step: 4, title: "Exames Recomendados", type: "exams" })
        } else {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: "Desculpe, não encontramos laboratórios na sua região. Por favor, tente novamente.",
            timestamp: new Date(),
            metadata: { error: "No labs found" },
          }

          setMessages((prev) => [...prev, aiMessage])
        }
      } catch (error: any) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Erro: ${error.message}`,
          timestamp: new Date(),
          metadata: { error: error.message },
        }

        setMessages((prev) => [...prev, aiMessage])
      }
      return
    }

    // Continue with normal flow...
    // Determine flow if not set
    if (!currentFlow) {
      if (currentInput.includes("dor de cabeça") || currentInput.includes("cefaleia")) {
        setCurrentFlow("dor de cabeça")
        setQuestionIndex(0)
      } else if (currentInput.includes("febre") || currentInput.includes("temperatura")) {
        setCurrentFlow("febre")
        setQuestionIndex(0)
      } else if (currentInput.includes("dor no peito") || currentInput.includes("peito")) {
        setCurrentFlow("dor no peito")
        setQuestionIndex(0)
      }
    }

    // Get next question or complete triagem
    if (currentFlow && shouldCompleteTriagem(currentFlow, questionIndex, newCollectedInfo)) {
      const finalRec = generateFinalRecommendation(currentFlow, newCollectedInfo)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: finalRec.content,
        timestamp: new Date(),
        metadata: {
          confidence: 92,
          urgency: currentFlow === "dor no peito" ? "high" : "medium",
          exams: finalRec.exams.map((exam) => exam.name),
        },
      }

      setMessages((prev) => [...prev, aiMessage])
      setIdentifiedExams(finalRec.exams)
      setShowExamPresentation(true)
    } else if (currentFlow) {
      // Continue with next question
      const nextIndex = questionIndex + 1
      let nextQuestion = getNextQuestion(currentFlow, nextIndex, inputValue)

      // Try contextual question if no standard question
      if (!nextQuestion) {
        nextQuestion = generateContextualQuestion(currentFlow, newCollectedInfo)
      }

      if (nextQuestion) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: nextQuestion.question,
          timestamp: new Date(),
          suggestions: nextQuestion.suggestions,
          metadata: { questionType: nextQuestion.type },
        }

        setMessages((prev) => [...prev, aiMessage])
        setQuestionIndex(nextIndex)
      }
    } else {
      // Default exploratory response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Entendi. Para te ajudar melhor, você poderia me contar mais detalhes sobre o que está sentindo? Isso me ajudará a fazer as perguntas certas.",
        timestamp: new Date(),
        suggestions: ["Dor de cabeça", "Febre", "Dor no peito", "Cansaço"],
      }

      setMessages((prev) => [...prev, aiMessage])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const resetConversation = () => {
    setMessages([
      {
        id: "1",
        type: "ai",
        content:
          "Olá! Sou a assistente de triagem da EXAM.ai. Vou te ajudar com uma avaliação médica personalizada. Para começar, o que te trouxe aqui hoje?",
        timestamp: new Date(),
        suggestions: ["Dor de cabeça", "Febre", "Dor no peito", "Cansaço"],
        metadata: { questionType: "chief_complaint" },
      },
    ])
    setCurrentFlow(null)
    setQuestionIndex(0)
    setInputValue("")
    setIdentifiedExams([])
    setShowExamPresentation(false)
    setCollectedInfo({})
    setCurrentStep({ step: 1, title: "Avaliação de Gravidade", type: "gravity" })
    setGravityAnswers([])
    setIsGraveCase(false)
    setPatientLocation(null)
    setRecommendedLab(null)
    setRecommendedHospital(null)
  }

  const removeAttachment = (messageId: string, attachmentIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.attachments) {
          const newAttachments = [...msg.attachments]
          URL.revokeObjectURL(newAttachments[attachmentIndex].url)
          newAttachments.splice(attachmentIndex, 1)
          return { ...msg, attachments: newAttachments.length > 0 ? newAttachments : undefined }
        }
        return msg
      }),
    )
  }

  const generateMockPDF = () => {
    return {
      filename: `triagem_${basicPatientData.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
      doctor: "Dr. Carlos Silva",
      crm: "CRM 12345-SP",
      date: new Date().toLocaleDateString("pt-BR"),
      exams: identifiedExams,
    }
  }

  const EmergencyAlert = ({ redFlag }: { redFlag: RedFlag }) => (
    <Card
      className={`border-2 ${
        redFlag.severity === "critical"
          ? "border-red-500 bg-red-50"
          : redFlag.severity === "urgent"
            ? "border-orange-500 bg-orange-50"
            : "border-yellow-500 bg-yellow-50"
      } animate-pulse`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              redFlag.severity === "critical"
                ? "bg-red-500"
                : redFlag.severity === "urgent"
                  ? "bg-orange-500"
                  : "bg-yellow-500"
            }`}
          >
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <div className="flex-1">
            <h3
              className={`font-bold text-lg ${
                redFlag.severity === "critical"
                  ? "text-red-800"
                  : redFlag.severity === "urgent"
                    ? "text-orange-800"
                    : "text-yellow-800"
              }`}
            >
              {redFlag.condition}
            </h3>
            <p
              className={`text-sm mt-1 ${
                redFlag.severity === "critical"
                  ? "text-red-700"
                  : redFlag.severity === "urgent"
                    ? "text-orange-700"
                    : "text-yellow-700"
              }`}
            >
              {redFlag.immediateAction}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ExamPresentationCard = ({ exam }: { exam: IdentifiedExam }) => (
    <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{exam.name}</CardTitle>
          <div className="flex flex-col items-end space-y-1">
            <Badge
              className={`text-xs ${
                exam.priority === "high"
                  ? "bg-red-100 text-red-700"
                  : exam.priority === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {exam.priority === "high"
                ? "Alta Prioridade"
                : exam.priority === "medium"
                  ? "Média Prioridade"
                  : "Baixa Prioridade"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {exam.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-700 text-sm">{exam.reason}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Urgência: {exam.urgency}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{exam.estimatedCost}</span>
          </div>
        </div>
        {exam.preparation && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>Preparação:</strong> {exam.preparation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const GravityAssessment = ({ question }: { question: GravityQuestion }) => (
    <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((option) => (
          <Button key={option} onClick={() => handleSuggestionClick(option)} className="w-full">
            {option}
          </Button>
        ))}
      </CardContent>
    </Card>
  )

  const LocationInput = () => (
    <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Informe sua localização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-700 text-sm">
          Por favor, informe sua cidade e estado para que possamos recomendar um laboratório próximo.
        </p>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Cidade, Estado"
          className="pr-12 text-sm"
          disabled={isTyping}
        />
      </CardContent>
    </Card>
  )

  const LabRecommendation = ({ lab }: { lab: Lab }) => (
    <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Laboratório Recomendado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-700 text-sm">Recomendamos o laboratório {lab.name}.</p>
        <div className="space-y-2">
          <p className="text-gray-700 text-sm">Endereço: {lab.address}</p>
          <p className="text-gray-700 text-sm">Telefone: {lab.phone}</p>
          <p className="text-gray-700 text-sm">Distância: {lab.distance}</p>
        </div>
      </CardContent>
    </Card>
  )

  const ExamRecommendation = () => {
    const pdfData = generateMockPDF()

    return (
      <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">Exames Recomendados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700 text-sm">Com base na sua triagem, recomendamos os seguintes exames:</p>
          <div className="space-y-2">
            {identifiedExams.map((exam) => (
              <p key={exam.id} className="text-gray-700 text-sm">
                - {exam.name}
              </p>
            ))}
          </div>
          <Button
            onClick={() => {
              // Implementar download do PDF
              alert(`Gerando PDF: ${pdfData.filename}`)
            }}
            className="w-full"
          >
            Baixar PDF com Recomendações
          </Button>
        </CardContent>
      </Card>
    )
  }

  const HospitalCheckin = () => (
    <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Check-in Hospitalar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-700 text-sm">
          Recomendamos que você vá ao hospital mais próximo para atendimento imediato.
        </p>
        <div className="space-y-2">
          {mockHospitals["São Paulo"].map((hospital) => (
            <div key={hospital.name} className="space-y-1">
              <p className="text-gray-700 text-sm">Hospital: {hospital.name}</p>
              <p className="text-gray-700 text-sm">Endereço: {hospital.address}</p>
              <p className="text-gray-700 text-sm">Telefone: {hospital.phone}</p>
              <p className="text-gray-700 text-sm">Distância: {hospital.distance}</p>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => alert("Check-in realizado")} className="w-1/2">
            Sim, já estou no hospital
          </Button>
          <Button onClick={() => alert("Redirecionando para o mapa")} className="w-1/2">
            Não, preciso de ajuda para chegar
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Sidebar content component for reusability
  const SidebarContent = () => (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Demo Disclaimer */}
      <div className="p-3 md:p-4 bg-yellow-50 border-b border-yellow-200 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <span className="font-medium text-yellow-800 text-xs md:text-sm">Demonstração</span>
        </div>
        <p className="text-xs text-yellow-700">
          Esta é uma demonstração da plataforma Redentor Seguros. Os dados são simulados para fins educativos.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Exames Recomendados */}
        <div className="p-3 md:p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <Stethoscope className="h-3 w-3 md:h-4 md:w-4 text-cyan-600" />
            <span className="font-medium text-gray-900 text-xs md:text-sm">Exames Recomendados</span>
          </div>

          <div className="space-y-2 md:space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Exames Identificados:</div>

              {[
                { name: "Hemograma Completo", status: "validating", priority: "medium" },
                { name: "Glicemia de Jejum", status: "validating", priority: "high" },
                { name: "Eletrocardiograma", status: "pending", priority: "medium" },
              ].map((exam, index) => (
                <div key={index} className="bg-white rounded-lg p-2 md:p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800 truncate pr-2">{exam.name}</span>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {exam.status === "validating" ? (
                        <>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-amber-600 hidden sm:inline">Validando</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-500 hidden sm:inline">Pendente</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`text-xs ${
                        exam.priority === "high" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {exam.priority === "high" ? "Alta" : "Média"}
                    </Badge>
                    <span className="text-xs text-gray-500 hidden md:inline">Sistema: 94%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Medical Professional Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 md:p-3">
              <div className="flex items-center space-x-2 mb-1 md:mb-2">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="text-xs md:text-sm font-medium text-green-800">Validação Médica</span>
              </div>
              <p className="text-xs text-green-700">Dr. Carlos Silva (CRM 12345-SP) está revisando as recomendações</p>
            </div>
          </div>
        </div>

        {/* Patient History - Condensed for mobile */}
        <div className="p-3 md:p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
            <span className="font-medium text-gray-900 text-xs md:text-sm">Dados do Paciente</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-blue-50 rounded-lg p-2 md:p-3">
              <div className="font-medium text-blue-800 mb-2 text-xs md:text-sm">Informações Básicas</div>
              <div className="space-y-1">
                <div className="truncate">
                  <span className="font-medium text-gray-700">Nome:</span> {basicPatientData.name}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Idade:</span> {mockPatientHistory.age} anos
                </div>
                <div className="truncate">
                  <span className="font-medium text-gray-700">Plano:</span> {basicPatientData.planNumber}
                </div>
              </div>
            </div>

            {/* Condensed clinical history for mobile */}
            <div className="bg-gray-50 rounded-lg p-2 md:p-3">
              <div className="font-medium text-gray-600 mb-1">Histórico Clínico:</div>
              {dynamicPatientHistory.conditions.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {dynamicPatientHistory.conditions.slice(0, 3).map((condition, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                  {dynamicPatientHistory.conditions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{dynamicPatientHistory.conditions.length - 3}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 italic text-xs">Será preenchido durante a triagem...</div>
              )}
            </div>
          </div>
        </div>

        {/* Progress - Simplified for mobile */}
        <div className="p-3 md:p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
            <span className="font-medium text-gray-900 text-xs md:text-sm">Progresso</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Informações coletadas</span>
              <span>{Math.min(Object.keys(collectedInfo).length * 20, 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Object.keys(collectedInfo).length * 20, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Telemedicine Button - Fixed at bottom */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
        <Button
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs md:text-sm py-2 md:py-3"
          onClick={() => {
            alert("Conectando com médico disponível...")
            closeSidebar()
          }}
        >
          <Activity className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          Conectar com Médico
        </Button>
        <p className="text-xs text-gray-500 mt-2 text-center">Telemedicina 24/7</p>
      </div>
    </div>
  )

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, "file")}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, "camera")}
      />

      {/* Mobile-First Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 flex-shrink-0 z-50">
        <div className="px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Mobile Menu Button */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden p-1 h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 sm:w-96">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <Link
                href="/mainpage"
                className="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-cyan-500 transition-colors text-xs md:text-sm"
              >
                <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
              <div className="h-3 w-px bg-gray-300 hidden sm:block"></div>
              <RedentorLogo size={isMobile ? "sm" : "md"} />
            </div>
            <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 text-xs">
              <Bot className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Redentor Seguros</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-80 lg:w-96 border-r border-gray-200 flex-shrink-0">
          <SidebarContent />
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 md:p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <div>
                  <h2 className="text-sm md:text-lg font-semibold">EXAM.ai</h2>
                  <p className="text-cyan-100 text-xs md:text-sm">Triagem Médica</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs md:text-sm text-cyan-100 hidden sm:inline">Analisando</span>
              </div>
            </div>
          </div>

          {/* Messages Area - Mobile Optimized */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
            {/* Keep existing message rendering logic but with mobile-optimized styling */}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] md:max-w-[75%] ${message.type === "system" ? "w-full text-center" : ""}`}>
                  {message.type === "ai" && (
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm p-3 md:p-4 shadow-sm border border-gray-100 min-w-0 flex-1">
                          <div className="whitespace-pre-wrap text-gray-800 text-sm break-words">{message.content}</div>
                          {/* Keep existing metadata rendering */}
                          {message.metadata && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {message.metadata.confidence && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Análise: {message.metadata.confidence}% de confiança</span>
                                </div>
                              )}
                              {message.metadata.exams && message.metadata.exams.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Exames Recomendados:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.metadata.exams.map((exam, index) => (
                                      <Badge key={index} className="bg-blue-100 text-blue-700 text-xs">
                                        {exam}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {message.suggestions && (
                        <div className="ml-8 md:ml-11 space-y-2">
                          <p className="text-xs md:text-sm text-gray-500">Respostas sugeridas:</p>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  handleSuggestionClick(suggestion)
                                  closeSidebar()
                                }}
                                className="px-2 md:px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs md:text-sm hover:bg-cyan-100 transition-colors border border-cyan-200"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {message.type === "user" && (
                    <div className="flex items-end space-x-2 md:space-x-3 justify-end">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-sm p-3 md:p-4 shadow-sm min-w-0 flex-1 max-w-xs md:max-w-md">
                        <div className="text-sm break-words">{message.content}</div>
                        {/* Keep existing attachment rendering */}
                        {message.attachments && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="bg-white/20 rounded-lg p-2 flex items-center space-x-2">
                                {attachment.type === "image" ? (
                                  <>
                                    <img
                                      src={attachment.url || "/placeholder.svg"}
                                      alt={attachment.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                                      <p className="text-xs opacity-75">{attachment.size}</p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-8 w-8 text-white/80" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                                      <p className="text-xs opacity-75">{attachment.size}</p>
                                    </div>
                                  </>
                                )}
                                <button
                                  onClick={() => removeAttachment(message.id, index)}
                                  className="text-white/60 hover:text-white"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Keep existing typing indicator and other UI elements */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 md:p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Mobile-Optimized Input Area */}
          <div className="border-t border-gray-200 p-2 md:p-4 bg-white flex-shrink-0">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="flex space-x-1 md:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-600 hover:text-cyan-600 border-gray-300 h-8 w-8 md:h-10 md:w-10 p-0"
                >
                  <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cameraInputRef.current?.click()}
                  className="text-gray-600 hover:text-cyan-600 border-gray-300 h-8 w-8 md:h-10 md:w-10 p-0"
                >
                  <Camera className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`text-gray-600 hover:text-cyan-600 border-gray-300 h-8 w-8 md:h-10 md:w-10 p-0 ${
                    isRecording ? "bg-red-50 text-red-500 border-red-200" : ""
                  }`}
                >
                  <Mic className={`h-3 w-3 md:h-4 md:w-4 ${isRecording ? "animate-pulse" : ""}`} />
                </Button>
              </div>
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="pr-10 md:pr-12 text-sm h-8 md:h-10"
                  disabled={isTyping || isRecording}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || isRecording}
                  className="absolute right-1 top-1 h-6 w-6 md:h-8 md:w-8 p-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  {isTyping ? (
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 md:h-4 md:w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={resetConversation}
                variant="outline"
                className="text-gray-600 hover:text-gray-800 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-8 md:h-10"
              >
                <span className="hidden sm:inline">Reiniciar</span>
                <span className="sm:hidden">↻</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1 md:mt-2 px-1">
              Triagem exploratória baseada no seu histórico médico.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
