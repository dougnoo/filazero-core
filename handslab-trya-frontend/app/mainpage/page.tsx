"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Stethoscope, Brain, FileText, ArrowLeft, Activity, User, Clock, Users, Menu, Phone, MapPin, Calendar } from 'lucide-react'
import { RedentorLogo } from "@/components/redentor-logo"
import { SkipLink } from "@/components/skip-link"

interface RecentAppointment {
  id: string
  type: string
  doctor: string
  date: string
  time: string
  status: "completed" | "scheduled" | "cancelled"
  location: string
  specialty: string
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

interface BasicPatientData {
  name: string
  cpf: string
  planNumber: string
  birthDate: string
  phone: string
  address: string
  emergencyContact: string
}

const mockPatientHistory: PatientHistory = {
  allergies: ["Penicilina"],
  medications: ["Losartana 50mg", "Metformina 850mg"],
  conditions: ["Hipertensão", "Diabetes tipo 2"],
  surgeries: [],
  familyHistory: [],
  lastVisit: "15/11/2024",
  age: 45,
  gender: "Feminino",
}

const basicPatientData: BasicPatientData = {
  name: "Maria Silva Santos",
  cpf: "123.456.789-00",
  planNumber: "12345678901",
  birthDate: "15/03/1979",
  phone: "(11) 99999-9999",
  address: "Rua das Flores, 123 - São Paulo/SP",
  emergencyContact: "João Silva - (11) 88888-8888",
}

export default function MainPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const recentAppointments: RecentAppointment[] = [
    {
      id: "1",
      type: "Triagem IA",
      doctor: "Dr. Carlos Silva",
      date: "15/01/2025",
      time: "14:30",
      status: "completed",
      location: "Online",
      specialty: "Clínica Geral",
    },
    {
      id: "2",
      type: "Consulta",
      doctor: "Dra. Ana Santos",
      date: "12/01/2025",
      time: "09:15",
      status: "completed",
      location: "Hospital Sírio-Libanês",
      specialty: "Cardiologia",
    },
    {
      id: "3",
      type: "Exames",
      doctor: "Lab. Fleury",
      date: "08/01/2025",
      time: "07:00",
      status: "completed",
      location: "Unidade Paulista",
      specialty: "Laboratório",
    },
  ]

  const services = [
    {
      id: "triagem",
      title: "Triagem",
      description: "Avaliação médica inteligente 24/7",
      icon: Stethoscope,
      // Cores atualizadas para transmitir tranquilidade (evitando azuis/indigos)
      color: "from-teal-500 to-emerald-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      stats: "Disponível agora",
      features: ["Triagem inteligente (IA)", "Resultados em 2min", "Validação profissional"],
      href: "/test-ai",
    },
    {
      id: "saude-mental",
      title: "Saúde Mental",
      description: "Suporte psicológico e bem-estar",
      icon: Brain,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-700",
      stats: "Especialistas online",
      features: ["Psicólogos", "Psiquiatras", "Terapia online"],
      href: "/test-mentalhealth",
    },
    {
      id: "documentos",
      title: "Minha Família",
      description: "Gestão de saúde familiar completa",
      icon: FileText,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      stats: "Sempre acessível",
      features: ["Histórico Familiar", "Exames", "Vacinas"],
      href: "/family-health",
    },
    {
      id: "rede-credenciada",
      title: "Rede Credenciada",
      description: "Especialistas e clínicas parceiras",
      icon: Users,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      stats: "500+ profissionais",
      features: ["Especialistas", "Clínicas", "Hospitais"],
      href: "/accredited-network",
    },
  ] as const

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "scheduled":
        return "bg-emerald-100 text-emerald-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído"
      case "scheduled":
        return "Agendado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Pendente"
    }
  }

  const navigateTo = (href: string) => {
    window.location.href = href
  }

  const handleServiceClick = (service: (typeof services)[number]) => {
    setSelectedService(service.id)
    navigateTo(service.href)
  }

  const handleServiceKeyDown = (e: React.KeyboardEvent, service: (typeof services)[number]) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleServiceClick(service)
    }
  }

  // Sidebar de informações do paciente (semântica e acessibilidade)
  const PatientInfoSidebar = () => (
    <aside aria-label="Informações do paciente" className="space-y-4 sm:space-y-6">
      {/* Plano Ativo */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-700" aria-hidden="true" />
            <span>Plano Ativo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">S</span>
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">SulAmérica</h4>
                <p className="text-xs sm:text-sm text-gray-600">Plano Premium Plus</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                <span className="text-xs sm:text-sm font-medium text-green-800">Ativo até 12/2025</span>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs sm:text-sm lg:text-base py-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none"
                onClick={() => window.open("https://www.sulamerica.com.br/portal-do-cliente", "_blank")}
                aria-label="Acessar aplicativo do plano de saúde SulAmérica"
              >
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2" aria-hidden="true" />
                Acessar App do Plano
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-200 hover:border-teal-600 hover:text-teal-700 text-xs sm:text-sm lg:text-base py-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none"
                onClick={() =>
                  window.open("mailto:rh@empresa.com.br?subject=Contato sobre Plano de Saúde", "_blank")
                }
                aria-label="Entrar em contato com o RH sobre o plano de saúde"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" aria-hidden="true" />
                Falar com RH
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Paciente */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" aria-hidden="true" />
            <span>Informações do Paciente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <dl className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-start gap-4">
              <dt className="text-xs sm:text-sm text-gray-600">Nome:</dt>
              <dd className="text-xs sm:text-sm lg:text-base font-medium text-right">{basicPatientData.name}</dd>
            </div>
            <div className="flex justify-between items-start gap-4">
              <dt className="text-xs sm:text-sm text-gray-600">CPF:</dt>
              <dd className="text-xs sm:text-sm lg:text-base font-medium">{basicPatientData.cpf}</dd>
            </div>
            <div className="flex justify-between items-start gap-4">
              <dt className="text-xs sm:text-sm text-gray-600">Carteirinha:</dt>
              <dd className="text-xs sm:text-sm lg:text-base font-medium">{basicPatientData.planNumber}</dd>
            </div>
            <div className="flex justify-between items-start gap-4">
              <dt className="text-xs sm:text-sm text-gray-600">Nascimento:</dt>
              <dd className="text-xs sm:text-sm lg:text-base font-medium">{basicPatientData.birthDate}</dd>
            </div>
            <div className="flex justify-between items-start gap-4">
              <dt className="text-xs sm:text-sm text-gray-600">Telefone:</dt>
              <dd className="text-xs sm:text-sm lg:text-base font-medium">{basicPatientData.phone}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Histórico Médico */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" aria-hidden="true" />
            <span>Histórico Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Condições:</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {mockPatientHistory.conditions.map((condition, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-teal-50 hover:bg-teal-100 transition-colors duration-200 text-xs motion-reduce:transition-none"
                >
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Medicamentos:</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {mockPatientHistory.medications.map((medication, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200 text-xs motion-reduce:transition-none"
                >
                  {medication}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Alergias:</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {mockPatientHistory.allergies.map((allergy, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-rose-50 hover:bg-rose-100 transition-colors duration-200 text-xs motion-reduce:transition-none"
                >
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Consultas */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" aria-hidden="true" />
            <span>Últimas Consultas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {recentAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border-l-4 border-l-emerald-500 pl-2 sm:pl-3 py-2 hover:bg-gray-50 transition-colors duration-200 rounded-r-lg motion-reduce:transition-none"
            >
              <p className="text-sm sm:text-base font-medium">{appointment.doctor}</p>
              <p className="text-xs text-gray-600 tabular-nums">
                {appointment.specialty} • {appointment.date}
              </p>
              <Badge className={`text-xs mt-1 ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SkipLink />

      {/* Header acessível */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-teal-600 transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md motion-reduce:transition-none"
                aria-label="Voltar para a página inicial"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="font-medium text-xs sm:text-sm">Voltar</span>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-gray-300" aria-hidden="true"></div>
              <RedentorLogo size="sm" className="sm:hidden" />
              <RedentorLogo size="md" className="hidden sm:block lg:hidden" />
              <RedentorLogo size="lg" className="hidden lg:block" />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Badge
                className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs"
                role="status"
                aria-live="polite"
                aria-label="Status do sistema: Online"
              >
                <Activity className="h-3 w-3 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Online</span>
                <span className="sm:hidden">•</span>
              </Badge>

              {/* Menu móvel acessível */}
              <div className="lg:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                      aria-label={isSheetOpen ? "Fechar menu do paciente" : "Abrir menu do paciente"}
                    >
                      <Menu className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-80 sm:w-96 p-0"
                    aria-label="Menu lateral com informações do paciente"
                  >
                    <div className="p-4 border-b bg-gradient-to-r from-teal-50 to-emerald-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Maria Silva</h3>
                          <p className="text-sm text-gray-600">SulAmérica Premium</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 h-[calc(100vh-100px)] overflow-y-auto">
                      <PatientInfoSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Info do usuário desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-gray-700">Maria Silva</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main
        id="conteudo-principal"
        className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8"
        role="main"
        aria-label="Conteúdo principal"
      >
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <PatientInfoSidebar />
            </div>
          </div>

          {/* Área principal */}
          <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Boas-vindas com foco em tranquilidade */}
            <section
              aria-labelledby="boas-vindas"
              className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h2 id="boas-vindas" className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">
                    Olá, Maria! 👋
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-base text-teal-100 mb-2 sm:mb-3">
                    Como podemos te ajudar hoje?
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true"></div>
                      <span className="tabular-nums">Última consulta: 15/01</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true"></div>
                      <span>SulAmérica Premium</span>
                    </div>
                  </div>
                </div>

                {/* Emergência lado a lado, com rótulos claros */}
                <div className="flex-shrink-0 w-full sm:w-auto sm:max-w-[280px]">
                  <Card
                    className="bg-gradient-to-r from-red-50 to-pink-50 border-0 shadow-lg border-l-4 border-l-red-500"
                    aria-label="Cartão de emergência médica"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-red-800 text-sm mb-1">Emergência Médica</h3>
                          <p id="emergencia-desc" className="text-xs text-red-600 leading-tight">
                            Ligue imediatamente em caso de emergência
                          </p>
                        </div>
                        <Button
                          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-4 py-2 rounded-full shadow-lg transition-all duration-200 active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
                          aria-describedby="emergencia-desc"
                          aria-label="Ligar para emergência 192"
                          onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(200)
                            window.open("tel:192")
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span className="text-sm font-bold">192</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Informações rápidas - Mobile */}
            <section aria-label="Informações rápidas" className="lg:hidden">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" aria-hidden="true" />
                      <div>
                        <span className="text-gray-600 block text-xs">Última consulta</span>
                        <p className="font-medium tabular-nums">15/01/2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <div>
                        <span className="text-gray-600 block text-xs">Plano</span>
                        <p className="font-medium">Premium Plus</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" aria-hidden="true" />
                      <div>
                        <span className="text-gray-600 block text-xs">Emergência</span>
                        <p className="font-medium">192</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-600" aria-hidden="true" />
                      <div>
                        <span className="text-gray-600 block text-xs">Localização</span>
                        <p className="font-medium">São Paulo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Serviços - navegação por teclado e foco visível */}
            <section aria-labelledby="servicos">
              <h2 id="servicos" className="sr-only">
                Serviços disponíveis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {services.map((service, index) => {
                  const isSelected = selectedService === service.id
                  return (
                    <div
                      key={service.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`Acessar ${service.title}. ${service.description}`}
                      className={[
                        "group border-0 overflow-hidden cursor-pointer rounded-md outline-none",
                        "hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95",
                        "focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2",
                        "motion-reduce:transition-none motion-reduce:transform-none",
                        isSelected ? "ring-4 ring-teal-500 shadow-2xl" : "shadow-sm",
                      ].join(" ")}
                      style={{ animationDelay: `${index * 120}ms` }}
                      onClick={() => handleServiceClick(service)}
                      onKeyDown={(e) => handleServiceKeyDown(e, service)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${service.color}`} aria-hidden="true"></div>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div
                            className={`p-2 sm:p-3 rounded-xl ${service.bgColor} group-hover:scale-110 transition-transform duration-300 motion-reduce:transition-none motion-reduce:transform-none`}
                            aria-hidden="true"
                          >
                            <service.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${service.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 group-hover:text-teal-700 transition-colors duration-300 motion-reduce:transition-none">
                              {service.title}
                            </CardTitle>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{service.description}</p>
                          </div>
                        </div>

                        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                          {service.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-2 opacity-0 animate-fade-in-up motion-reduce:animate-none"
                              style={{
                                animationDelay: `${index * 120 + featureIndex * 90}ms`,
                                animationFillMode: "forwards",
                              }}
                            >
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full flex-shrink-0" aria-hidden="true"></div>
                              <span className="text-xs sm:text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate">{service.stats}</span>
                          <Button
                            className={`bg-gradient-to-r ${service.color} hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 min-h-[36px] touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none motion-reduce:transform-none`}
                            size="sm"
                            aria-label={`Ir para ${service.title}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleServiceClick(service)
                            }}
                          >
                            Acessar
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Emergência - Mobile */}
            <section aria-label="Acesso rápido à emergência" className="lg:hidden">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-800 text-sm">Emergência Médica</h3>
                      <p className="text-xs text-red-600">Ligue imediatamente em caso de emergência</p>
                    </div>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full focus-visible:ring-2 focus-visible:ring-red-400"
                      aria-label="Ligar para emergência 192"
                      onClick={() => window.open("tel:192")}
                    >
                      <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                      192
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
