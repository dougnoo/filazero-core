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
import { Send, Bot, User, Loader2, ArrowLeft, Paperclip, Camera, Clock, Mic, Plus, MessageCircle, Shield, UserCheck, Archive, AlertTriangle, Heart, Briefcase, Users, Brain, Zap, Menu } from 'lucide-react'
import Link from "next/link"
import { RedentorLogo } from "@/components/redentor-logo"

interface Message {
  id: string
  type: "user" | "ai" | "psychologist" | "system"
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
    questionType?: string
  }
}

interface Topic {
  id: string
  title: string
  category: string
  icon: any
  status: "active" | "forwarded" | "in_treatment" | "archived"
  messages: Message[]
  createdAt: Date
  lastActivity: Date
  psychologistId?: string
  psychologistName?: string
}

interface AudioRecording {
  blob: Blob
  url: string
  duration: number
}

const topicCategories = [
  { id: "relationship", name: "Relacionamentos", icon: Heart, color: "bg-pink-100 text-pink-700" },
  { id: "work", name: "Trabalho", icon: Briefcase, color: "bg-blue-100 text-blue-700" },
  { id: "family", name: "Família", icon: Users, color: "bg-green-100 text-green-700" },
  { id: "personal", name: "Desenvolvimento Pessoal", icon: Brain, color: "bg-purple-100 text-purple-700" },
  { id: "anxiety", name: "Ansiedade", icon: Zap, color: "bg-yellow-100 text-yellow-700" },
  { id: "general", name: "Geral", icon: MessageCircle, color: "bg-gray-100 text-gray-700" },
]

const psychologyQuestions = {
  relationship: [
    {
      question:
        "Olá! Vou te ajudar a refletir sobre seus relacionamentos. Como você se sente em relação aos seus relacionamentos atualmente?",
      suggestions: ["Satisfeito(a)", "Confuso(a)", "Frustrado(a)", "Ansioso(a)"],
      type: "initial_assessment",
    },
    {
      question: "Que tipo de relacionamento você gostaria de explorar hoje?",
      suggestions: ["Relacionamento amoroso", "Amizades", "Família", "Colegas de trabalho"],
      type: "relationship_type",
    },
  ],
  work: [
    {
      question: "Vamos conversar sobre sua vida profissional. Como você tem se sentido no trabalho ultimamente?",
      suggestions: ["Motivado(a)", "Estressado(a)", "Entediado(a)", "Sobrecarregado(a)"],
      type: "work_satisfaction",
    },
    {
      question: "Qual aspecto do trabalho mais te preocupa no momento?",
      suggestions: [
        "Pressão e deadlines",
        "Relacionamento com colegas",
        "Falta de reconhecimento",
        "Incerteza sobre carreira",
      ],
      type: "work_concerns",
    },
  ],
  anxiety: [
    {
      question: "Entendo que você está lidando com ansiedade. Em que momentos você mais sente isso?",
      suggestions: ["Situações sociais", "Antes de dormir", "No trabalho", "Em decisões importantes"],
      type: "anxiety_triggers",
    },
    {
      question: "Como a ansiedade tem afetado seu dia a dia?",
      suggestions: [
        "Dificuldade para dormir",
        "Problemas de concentração",
        "Evito certas situações",
        "Sintomas físicos",
      ],
      type: "anxiety_impact",
    },
  ],
  general: [
    {
      question: "Olá! Estou aqui para te ouvir e ajudar. O que você gostaria de compartilhar hoje?",
      suggestions: [
        "Como me sinto",
        "Uma situação específica",
        "Pensamentos que me incomodam",
        "Preciso de orientação",
      ],
      type: "general_opening",
    },
  ],
}

const mockTopics: Topic[] = [
  {
    id: "1",
    title: "Ansiedade no trabalho",
    category: "work",
    icon: Briefcase,
    status: "in_treatment",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    psychologistId: "psy1",
    psychologistName: "Dra. Ana Silva",
    messages: [
      {
        id: "1",
        type: "ai",
        content: "Vamos conversar sobre sua vida profissional. Como você tem se sentido no trabalho ultimamente?",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        suggestions: ["Motivado(a)", "Estressado(a)", "Entediado(a)", "Sobrecarregado(a)"],
      },
      {
        id: "2",
        type: "user",
        content: "Estressado(a)",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000),
      },
      {
        id: "3",
        type: "psychologist",
        content:
          "Olá! Sou a Dra. Ana Silva, psicóloga responsável pelo seu atendimento. Li nossa conversa anterior e gostaria de entender melhor: o que especificamente tem causado esse estresse no trabalho?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "2",
    title: "Relacionamento familiar",
    category: "family",
    icon: Users,
    status: "active",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    messages: [
      {
        id: "1",
        type: "ai",
        content: "Vamos conversar sobre família. Como você se sente em relação aos seus relacionamentos familiares?",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        suggestions: ["Próximo(a)", "Distante", "Conflituoso", "Confuso(a)"],
      },
      {
        id: "2",
        type: "user",
        content: "Conflituoso",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  },
]

export default function MentalHealthPage() {
  const [topics, setTopics] = useState<Topic[]>(mockTopics)
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(topics[0]?.id || null)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showNewTopicModal, setShowNewTopicModal] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState("")
  const [newTopicCategory, setNewTopicCategory] = useState("")
  const [userRole, setUserRole] = useState<"user" | "psychologist">("user")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const currentTopic = topics.find((t) => t.id === currentTopicId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentTopic?.messages])

  const simulateTyping = (duration = 1500) => {
    setIsTyping(true)
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsTyping(false)
        resolve(true)
      }, duration)
    })
  }

  const createNewTopic = () => {
    if (!newTopicTitle.trim() || !newTopicCategory) return

    const category = topicCategories.find((c) => c.id === newTopicCategory)
    if (!category) return

    const newTopic: Topic = {
      id: Date.now().toString(),
      title: newTopicTitle,
      category: newTopicCategory,
      icon: category.icon,
      status: "active",
      createdAt: new Date(),
      lastActivity: new Date(),
      messages: [
        {
          id: "1",
          type: "ai",
          content: getInitialQuestion(newTopicCategory),
          timestamp: new Date(),
          suggestions: getInitialSuggestions(newTopicCategory),
        },
      ],
    }

    setTopics((prev) => [newTopic, ...prev])
    setCurrentTopicId(newTopic.id)
    setShowNewTopicModal(false)
    setNewTopicTitle("")
    setNewTopicCategory("")
    setIsSidebarOpen(false) // Close sidebar on mobile after creating topic
  }

  const getInitialQuestion = (category: string) => {
    const questions = psychologyQuestions[category as keyof typeof psychologyQuestions]
    return questions?.[0]?.question || psychologyQuestions.general[0].question
  }

  const getInitialSuggestions = (category: string) => {
    const questions = psychologyQuestions[category as keyof typeof psychologyQuestions]
    return questions?.[0]?.suggestions || psychologyQuestions.general[0].suggestions
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentTopicId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === currentTopicId
          ? {
              ...topic,
              messages: [...topic.messages, userMessage],
              lastActivity: new Date(),
            }
          : topic,
      ),
    )

    setInputValue("")
    await simulateTyping(2000)

    // Simulate AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: generateAIResponse(inputValue, currentTopic?.category || "general"),
      timestamp: new Date(),
      suggestions: generateSuggestions(currentTopic?.category || "general"),
    }

    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === currentTopicId
          ? {
              ...topic,
              messages: [...topic.messages, aiMessage],
              lastActivity: new Date(),
            }
          : topic,
      ),
    )
  }

  const generateAIResponse = (userInput: string, category: string) => {
    const responses = {
      relationship: [
        "Entendo como os relacionamentos podem ser complexos. Pode me contar mais sobre essa situação?",
        "É natural sentir-se assim em relacionamentos. O que você acha que poderia ajudar nessa situação?",
        "Relacionamentos requerem trabalho de ambas as partes. Como você tem se comunicado sobre isso?",
      ],
      work: [
        "O ambiente de trabalho pode ser muito desafiador. Que estratégias você já tentou para lidar com isso?",
        "É importante cuidar do bem-estar no trabalho. Como isso tem afetado outras áreas da sua vida?",
        "Vejo que o trabalho tem sido fonte de estresse. Você tem conseguido separar vida pessoal e profissional?",
      ],
      anxiety: [
        "A ansiedade pode ser muito desconfortável. Você tem notado algum padrão nesses momentos?",
        "Técnicas de respiração podem ajudar. Você já experimentou alguma estratégia de relaxamento?",
        "É corajoso buscar ajuda para ansiedade. Como você tem cuidado de si mesmo(a) ultimamente?",
      ],
      general: [
        "Obrigado por compartilhar isso comigo. Como você se sente ao falar sobre isso?",
        "É importante expressar nossos sentimentos. O que mais você gostaria de explorar sobre isso?",
        "Entendo sua perspectiva. Que tipo de apoio você sente que precisa neste momento?",
      ],
    }

    const categoryResponses = responses[category as keyof typeof responses] || responses.general
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)]
  }

  const generateSuggestions = (category: string) => {
    const suggestions = {
      relationship: [
        "Preciso de mais tempo",
        "Quero melhorar a comunicação",
        "Não sei como agir",
        "Sinto-me incompreendido(a)",
      ],
      work: ["Preciso de estratégias", "Quero mudar de área", "Não consigo me organizar", "Sinto-me sobrecarregado(a)"],
      anxiety: [
        "Quero técnicas de relaxamento",
        "Preciso entender melhor",
        "Quero controlar os sintomas",
        "Busco apoio",
      ],
      general: ["Quero explorar mais", "Preciso de orientação", "Não sei por onde começar", "Quero entender melhor"],
    }

    return suggestions[category as keyof typeof suggestions] || suggestions.general
  }

  const forwardToPsychologist = (topicId: string) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              status: "forwarded",
              lastActivity: new Date(),
            }
          : topic,
      ),
    )

    // Simulate psychologist assignment after a delay
    setTimeout(() => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                status: "in_treatment",
                psychologistId: "psy1",
                psychologistName: "Dra. Ana Silva",
                lastActivity: new Date(),
              }
            : topic,
        ),
      )
    }, 3000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleTopicSelect = (topicId: string) => {
    setCurrentTopicId(topicId)
    setIsSidebarOpen(false) // Close sidebar on mobile after selecting topic
  }

  const getStatusBadge = (status: Topic["status"]) => {
    const statusConfig = {
      active: { label: "Ativo", className: "bg-green-100 text-green-700" },
      forwarded: { label: "Encaminhado", className: "bg-yellow-100 text-yellow-700" },
      in_treatment: { label: "Em Atendimento", className: "bg-blue-100 text-blue-700" },
      archived: { label: "Arquivado", className: "bg-gray-100 text-gray-700" },
    }

    const config = statusConfig[status]
    return <Badge className={`${config.className} text-xs`}>{config.label}</Badge>
  }

  const getStatusIcon = (status: Topic["status"]) => {
    switch (status) {
      case "active":
        return <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
      case "forwarded":
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
      case "in_treatment":
        return <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
      case "archived":
        return <Archive className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
    }
  }

  // Audio recording functions (simplified for brevity)
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
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

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
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  const deleteRecording = () => {
    if (audioRecording) {
      URL.revokeObjectURL(audioRecording.url)
      setAudioRecording(null)
      setIsPlaying(false)
    }
  }

  // Sidebar Content Component
  const SidebarContent = () => (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Privacy Notice */}
      <div className="p-3 sm:p-4 bg-purple-50 border-b border-purple-200 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          <span className="font-medium text-purple-800 text-xs sm:text-sm">Privacidade Garantida</span>
        </div>
        <p className="text-xs text-purple-700">
          Suas conversas são confidenciais. Apenas psicólogos autorizados têm acesso ao conteúdo.
        </p>
      </div>

      {/* New Topic Button */}
      {userRole === "user" && (
        <div className="p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm"
            onClick={() => setShowNewTopicModal(true)}
          >
            <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Novo Tópico
          </Button>
        </div>
      )}

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4">
          <h3 className="font-medium text-gray-900 text-sm mb-3">
            {userRole === "user" ? "Seus Tópicos" : "Tópicos Atribuídos"}
          </h3>
          <div className="space-y-2">
            {topics
              .filter((topic) => userRole === "user" || topic.status === "in_treatment")
              .map((topic) => {
                const category = topicCategories.find((c) => c.id === topic.category)
                const IconComponent = topic.icon

                return (
                  <Card
                    key={topic.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      currentTopicId === topic.id ? "ring-2 ring-purple-500 bg-purple-50" : ""
                    }`}
                    onClick={() => handleTopicSelect(topic.id)}
                  >
                    <CardContent className="p-2 sm:p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div
                            className={`p-1 rounded ${category?.color || "bg-gray-100 text-gray-700"} flex-shrink-0`}
                          >
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{topic.title}</h4>
                        </div>
                        <div className="flex-shrink-0 ml-2">{getStatusIcon(topic.status)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(topic.status)}
                        <span className="text-xs text-gray-500">{topic.lastActivity.toLocaleDateString()}</span>
                      </div>
                      {topic.psychologistName && (
                        <p className="text-xs text-gray-600 mt-1 truncate">Psicólogo: {topic.psychologistName}</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </div>

      {/* Next Appointment & Emergency */}
      <div className="p-3 sm:p-4 border-t border-gray-200 space-y-3 flex-shrink-0">
        {/* Next Appointment */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center space-x-2 mb-1">
              <UserCheck className="h-3 w-3 text-blue-600" />
              <span className="font-medium text-blue-800 text-xs">Próxima Consulta</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-blue-700">
                <p className="font-medium">Dra. Ana Silva</p>
                <p>15 de Janeiro, 2025 - 14:30</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-blue-700 border-blue-300 hover:bg-blue-100 h-7 text-xs"
                onClick={() => window.open("https://meet.google.com/abc-defg-hij", "_blank")}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Entrar na Consulta
              </Button>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <span className="font-medium text-red-700 text-xs">Emergência</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-red-100 text-red-700 border-red-300 hover:bg-red-200 h-7 text-xs font-medium"
                  onClick={() => alert("Conectando com psicólogo de emergência...")}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Conversar agora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 flex-shrink-0 z-50">
        <div className="px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Menu Button */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden p-1 sm:p-2">
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <Link
                href="/mainpage"
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-cyan-500 transition-colors text-xs sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
              <div className="h-3 w-px bg-gray-300 hidden sm:block"></div>
              <RedentorLogo size="sm" className="sm:hidden" />
              <RedentorLogo size="md" className="hidden sm:block" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                <Brain className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Psicologia</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserRole(userRole === "user" ? "psychologist" : "user")}
                className="text-xs p-1 sm:p-2"
              >
                {userRole === "user" ? <User className="h-3 w-3 sm:mr-1" /> : <UserCheck className="h-3 w-3 sm:mr-1" />}
                <span className="hidden sm:inline">{userRole === "user" ? "Usuário" : "Psicólogo"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col overflow-hidden">
          <SidebarContent />
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentTopic ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 sm:p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <currentTopic.icon className="h-3 w-3 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm sm:text-lg font-semibold truncate">{currentTopic.title}</h2>
                      <p className="text-purple-100 text-xs sm:text-sm truncate">
                        {topicCategories.find((c) => c.id === currentTopic.category)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    {getStatusIcon(currentTopic.status)}
                    <span className="text-xs sm:text-sm text-purple-100 hidden sm:inline">
                      {currentTopic.status === "in_treatment"
                        ? "Em Atendimento"
                        : currentTopic.status === "forwarded"
                          ? "Encaminhado"
                          : "Ativo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
                {currentTopic.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] ${message.type === "system" ? "w-full text-center" : ""}`}
                    >
                      {(message.type === "ai" || message.type === "psychologist") && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.type === "ai"
                                  ? "bg-gradient-to-r from-purple-500 to-pink-600"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
                              }`}
                            >
                              {message.type === "ai" ? (
                                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              ) : (
                                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              )}
                            </div>
                            <div className="bg-white rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-sm border border-gray-100 min-w-0 flex-1">
                              {message.type === "psychologist" && (
                                <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100">
                                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                  <span className="text-xs sm:text-sm font-medium text-blue-800 truncate">
                                    {currentTopic.psychologistName}
                                  </span>
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">Psicólogo</Badge>
                                </div>
                              )}
                              <div className="whitespace-pre-wrap text-gray-800 text-xs sm:text-sm break-words">
                                {message.content}
                              </div>
                            </div>
                          </div>

                          {message.suggestions && userRole === "user" && (
                            <div className="ml-8 sm:ml-11 space-y-2">
                              <p className="text-xs sm:text-sm text-gray-500">Respostas sugeridas:</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {message.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm hover:bg-purple-100 transition-colors border border-purple-200"
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
                        <div className="flex items-end space-x-2 sm:space-x-3 justify-end">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl rounded-tr-sm p-3 sm:p-4 shadow-sm min-w-0 flex-1 max-w-xs sm:max-w-md">
                            <div className="text-xs sm:text-sm break-words">{message.content}</div>
                          </div>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-sm border border-gray-100">
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

              {/* Input Area */}
              <div className="border-t border-gray-200 p-3 sm:p-4 bg-white flex-shrink-0">
                {currentTopic.status === "active" && userRole === "user" && (
                  <div className="mb-3">
                    <Button
                      onClick={() => forwardToPsychologist(currentTopic.id)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs sm:text-sm"
                      size="sm"
                    >
                      <UserCheck className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Encaminhar ao Psicólogo
                    </Button>
                  </div>
                )}

                {(currentTopic.status === "active" ||
                  (currentTopic.status === "in_treatment" && userRole === "psychologist")) && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex space-x-1 sm:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-600 hover:text-purple-600 border-gray-300 p-1 sm:p-2"
                      >
                        <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                        className="text-gray-600 hover:text-purple-600 border-gray-300 p-1 sm:p-2"
                      >
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`${
                          isRecording
                            ? "text-red-600 hover:text-red-700 border-red-300"
                            : "text-gray-600 hover:text-purple-600 border-gray-300"
                        } p-1 sm:p-2`}
                      >
                        <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Audio Recording Display */}
                    {isRecording && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-700 text-sm">
                          Gravando... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {audioRecording && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (audioPlayerRef.current) {
                              if (isPlaying) {
                                audioPlayerRef.current.pause()
                                setIsPlaying(false)
                              } else {
                                audioPlayerRef.current.play()
                                setIsPlaying(true)
                              }
                            }
                          }}
                          className="text-purple-600 hover:text-purple-700 p-1"
                        >
                          {isPlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <span className="text-purple-700 text-sm">
                          Áudio gravado ({Math.floor(audioRecording.duration / 60)}:
                          {(audioRecording.duration % 60).toString().padStart(2, '0')})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={deleteRecording}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          ×
                        </Button>
                        <audio
                          ref={audioPlayerRef}
                          src={audioRecording.url}
                          onEnded={() => setIsPlaying(false)}
                          className="hidden"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                        disabled={isTyping}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-2 sm:p-3"
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Bem-vindo ao Suporte Psicológico</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Selecione um tópico existente ou crie um novo para começar
                </p>
                <Button
                  onClick={() => setShowNewTopicModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Tópico
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Novo Tópico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Tópico</label>
                <Input
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Ex: Ansiedade no trabalho"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {topicCategories.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setNewTopicCategory(category.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newTopicCategory === category.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${category.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewTopicModal(false)
                    setNewTopicTitle("")
                    setNewTopicCategory("")
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createNewTopic}
                  disabled={!newTopicTitle.trim() || !newTopicCategory}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  Criar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
