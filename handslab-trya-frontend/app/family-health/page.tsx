"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, User, Users } from 'lucide-react'
import { RedentorLogo } from "@/components/redentor-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { Menu } from 'lucide-react'
import { FamilyMemberSelector } from "@/components/family-member-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HealthDashboard } from "@/components/health-dashboard"
import { HealthTimeline } from "@/components/health-timeline"
import { AdvancedSearch } from "@/components/advanced-search"
import { DocumentCard } from "@/components/document-card"
import { DocumentUpload } from "@/components/document-upload"
import type { FamilyMember, HealthDocument, HealthAlert } from "@/types/family-health"
import { LayoutDashboard, ListOrdered, FileText, BarChart3, Download, UploadCloud } from 'lucide-react'

// Mock data
const mockMembers: FamilyMember[] = [
  {
    id: "0",
    name: "Eu",
    relationship: "self",
    dateOfBirth: new Date("1990-01-15"),
    bloodType: "O+",
    allergies: ["Nenhuma conhecida"],
    chronicConditions: [],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "1",
    name: "Maria Silva",
    relationship: "spouse",
    dateOfBirth: new Date("1985-03-15"),
    bloodType: "A+",
    allergies: ["Penicilina"],
    chronicConditions: ["Hipertensão"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "João Silva",
    relationship: "child",
    dateOfBirth: new Date("2015-07-22"),
    bloodType: "O+",
    allergies: [],
    chronicConditions: [],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Ana Silva",
    relationship: "child",
    dateOfBirth: new Date("2010-11-08"),
    bloodType: "A+",
    allergies: ["Amendoim"],
    chronicConditions: [],
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const mockDocuments: HealthDocument[] = [
  {
    id: "0",
    memberId: "0",
    title: "Check-up Anual",
    category: "routine-checkup",
    date: new Date("2024-06-15"),
    expiryDate: new Date("2025-06-15"),
    author: "Dr. Roberto Lima",
    clinic: "Clínica Saúde Total",
    fileType: "PDF",
    fileSize: 320000,
    secureLink: "/api/documents/secure/0",
    accessLevel: "private",
    description: "Exame médico de rotina anual completo.",
    tags: ["check-up", "rotina", "anual"],
    status: "valid",
    priority: "medium",
    results: [
      { key: "Pressão Arterial", value: "120/80", unit: "mmHg", normalRange: "<140/90", status: "normal" },
      { key: "IMC", value: "23.5", unit: "kg/m²", normalRange: "18.5-24.9", status: "normal" },
      { key: "Glicemia", value: "85", unit: "mg/dL", normalRange: "70-99", status: "normal" },
    ],
  },
  {
    id: "1",
    memberId: "1",
    title: "Hemograma Completo Anual",
    category: "lab-results",
    date: new Date("2024-05-15"),
    expiryDate: new Date("2025-05-15"),
    author: "Dr. Carlos Santos",
    clinic: "Laboratório Vida Saudável",
    fileType: "PDF",
    fileSize: 245760,
    secureLink: "/api/documents/secure/1",
    accessLevel: "private",
    description: "Exame de sangue de rotina para check-up anual.",
    tags: ["rotina", "sangue", "anual"],
    status: "valid",
    priority: "medium",
    results: [
      { key: "Hemoglobina", value: "13.5", unit: "g/dL", normalRange: "12.0-15.5", status: "normal" },
      { key: "Glicose", value: "95", unit: "mg/dL", normalRange: "70-99", status: "normal" },
      { key: "Colesterol Total", value: "180", unit: "mg/dL", normalRange: "<200", status: "normal" },
    ],
  },
  {
    id: "2",
    memberId: "2",
    title: "Consulta Pediátrica",
    category: "routine-checkup",
    date: new Date("2024-04-10"),
    author: "Dr. Ana Costa",
    clinic: "Clínica Pediátrica",
    fileType: "PDF",
    fileSize: 180000,
    secureLink: "/api/documents/secure/2",
    accessLevel: "private",
    description: "Consulta de rotina pediátrica - desenvolvimento normal.",
    tags: ["pediatria", "rotina", "desenvolvimento"],
    status: "valid",
    priority: "medium",
  },
  {
    id: "3",
    memberId: "3",
    title: "Vacina Tríplice Viral",
    category: "vaccination",
    date: new Date("2023-11-20"),
    author: "Enf. Paula Lima",
    clinic: "Posto de Saúde Central",
    fileType: "PDF",
    fileSize: 102400,
    secureLink: "/api/documents/secure/3",
    accessLevel: "public",
    description: "Vacinação de rotina infantil.",
    tags: ["vacina", "infantil", "prevenção"],
    status: "valid",
    priority: "high",
    reminders: [
      {
        type: "vaccination",
        date: new Date("2024-11-20"),
        message: "Reforço da vacina Tríplice Viral",
      },
    ],
  },
  {
    id: "4",
    memberId: "1",
    title: "Consulta Cardiológica",
    category: "clinical-files",
    date: new Date("2024-03-01"),
    author: "Dr. Ricardo Alves",
    clinic: "Instituto do Coração",
    fileType: "PDF",
    fileSize: 307200,
    secureLink: "/api/documents/secure/4",
    accessLevel: "private",
    description: "Acompanhamento de hipertensão.",
    tags: ["cardiologia", "hipertensão", "consulta"],
    status: "expired",
    priority: "medium",
    results: [{ key: "Pressão Arterial", value: "130/85", unit: "mmHg", status: "attention" }],
  },
]

const mockAlerts: HealthAlert[] = [
  {
    id: "0",
    memberId: "0",
    type: "follow-up-needed",
    title: "Lembrete: Próximo Check-up",
    message: "Seu próximo check-up anual está agendado para junho de 2025.",
    date: new Date("2025-06-15"),
    priority: "low",
    isRead: false,
    actionRequired: false,
  },
  {
    id: "1",
    memberId: "1",
    type: "exam-expired",
    title: "Exame Vencido: Consulta Cardiológica",
    message: "Sua consulta cardiológica de acompanhamento está vencida. Agende uma nova.",
    date: new Date("2024-03-01"),
    priority: "medium",
    isRead: false,
    actionRequired: true,
  },
  {
    id: "2",
    memberId: "3",
    type: "vaccination-due",
    title: "Lembrete: Reforço Vacina",
    message: "Lembrete para o reforço da vacina Tríplice Viral de Ana Silva em Nov/2024.",
    date: new Date("2024-11-20"),
    priority: "high",
    isRead: true,
    actionRequired: true,
  },
]

export default function FamilyHealthPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [members, setMembers] = useState<FamilyMember[]>(mockMembers)
  const [documents, setDocuments] = useState<HealthDocument[]>(mockDocuments)
  const [alerts] = useState<HealthAlert[]>(mockAlerts)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchFilters, setSearchFilters] = useState<any>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleAddMember = (newMemberData: Omit<FamilyMember, "id">) => {
    const member: FamilyMember = {
      ...newMemberData,
      id: String(Date.now()),
      avatar: `/placeholder.svg?height=40&width=40&query=foto profissional de ${newMemberData.name.split(" ")[0]} sorrindo`,
    }
    setMembers((prev) => [...prev, member])
  }

  const handleDocumentUpload = (newDocument: HealthDocument) => {
    setDocuments([...documents, newDocument])
  }

  const filteredDocuments = useMemo(() => {
    let filtered = documents
    if (selectedMember) {
      filtered = filtered.filter((doc) => doc.memberId === selectedMember)
    }
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(term) ||
          doc.description?.toLowerCase().includes(term) ||
          doc.clinic.toLowerCase().includes(term) ||
          doc.author.toLowerCase().includes(term) ||
          doc.tags?.some((tag) => tag.toLowerCase().includes(term)),
      )
    }
    if (searchFilters.category && searchFilters.category !== "all") {
      filtered = filtered.filter((doc) => doc.category === searchFilters.category)
    }
    if (searchFilters.status && searchFilters.status !== "all") {
      filtered = filtered.filter((doc) => doc.status === searchFilters.status)
    }
    if (searchFilters.clinic && searchFilters.clinic !== "all") {
      filtered = filtered.filter((doc) => doc.clinic === searchFilters.clinic)
    }
    if (searchFilters.member && searchFilters.member !== "all" && !selectedMember) {
      filtered = filtered.filter((doc) => doc.memberId === searchFilters.member)
    }
    if (searchFilters.dateRange?.from) {
      filtered = filtered.filter((doc) => new Date(doc.date) >= new Date(searchFilters.dateRange.from))
    }
    if (searchFilters.dateRange?.to) {
      filtered = filtered.filter((doc) => new Date(doc.date) <= new Date(searchFilters.dateRange.to))
    }
    if (searchFilters.tags?.length > 0) {
      filtered = filtered.filter((doc) => searchFilters.tags.some((tag: string) => doc.tags?.includes(tag)))
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [documents, selectedMember, searchFilters])

  const handleExportPDF = () => {
    alert("Funcionalidade de exportar PDF será implementada aqui.")
  }

  return (
    <>
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
                <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-white">
                  <div className="p-3 sm:p-4 pt-6">
                    <FamilyMemberSelector
                      members={members}
                      selectedMember={selectedMember}
                      onMemberSelect={(memberId) => {
                        setSelectedMember(memberId)
                        setIsSidebarOpen(false)
                      }}
                      onAddMember={handleAddMember}
                    />
                  </div>
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
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                <Users className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Família</span>
              </Badge>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="hidden md:flex items-center gap-1 text-xs px-2 py-1"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden lg:inline">Exportar PDF</span>
                </Button>
                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  triggerButton={
                    <Button size="sm" className="flex items-center gap-1 text-xs px-2 py-1 sm:px-3 sm:py-2">
                      <UploadCloud className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="hidden sm:inline">Adicionar</span>
                      <span className="sm:hidden">+</span>
                    </Button>
                  }
                />
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Maria Silva</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="flex flex-1 container mx-auto px-0 max-w-none sm:max-w-7xl sm:px-2 lg:px-4">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 bg-white border-r sticky top-[73px] min-h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] overflow-y-auto p-4 lg:p-6">
          <FamilyMemberSelector
            members={members}
            selectedMember={selectedMember}
            onMemberSelect={setSelectedMember}
            onAddMember={handleAddMember}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 py-3 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6 xl:px-8 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 bg-slate-100 p-1 rounded-lg mb-4 sm:mb-6 h-auto">
              {[
                { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortLabel: "Dash" },
                { value: "timeline", label: "Timeline", icon: ListOrdered, shortLabel: "Linha" },
                { value: "documents", label: "Documentos", icon: FileText, shortLabel: "Docs" },
                { value: "insights", label: "Insights", icon: BarChart3, shortLabel: "Stats" },
              ].map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs py-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md transition-all min-h-[2.5rem] sm:min-h-[2.75rem]"
                >
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-sm leading-tight">
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard">
              <HealthDashboard
                documents={filteredDocuments}
                members={members}
                selectedMember={selectedMember}
                alerts={alerts}
              />
            </TabsContent>
            <TabsContent value="timeline">
              <HealthTimeline
                documents={filteredDocuments}
                members={members}
                selectedMember={selectedMember}
                onDocumentView={(doc) => {
                  alert(`Visualizando: ${doc.title}`)
                }}
              />
            </TabsContent>
            <TabsContent value="documents" className="space-y-4 sm:space-y-6">
              <AdvancedSearch documents={documents} members={members} onFiltersChange={setSearchFilters} />
              {filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {filteredDocuments.map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow mx-2 sm:mx-0">
                  <FileText className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-gray-300 mb-4 sm:mb-6" />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">Nenhum documento encontrado</h3>
                  <p className="text-sm sm:text-base text-gray-500 px-4">
                    Tente ajustar os filtros de busca ou adicione novos documentos.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-700">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                    Insights de Saúde Familiar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-700 mb-3">Tendências e Comparações</h3>
                    <p className="text-sm text-blue-600">
                      Em breve, você poderá visualizar gráficos comparativos dos indicadores de saúde entre os membros
                      da família, identificar tendências e obter uma visão mais clara da saúde familiar ao longo do
                      tempo.
                    </p>
                  </div>
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-700 mb-3">Recomendações Personalizadas</h3>
                    <p className="text-sm text-green-600">
                      Com base nos dados de saúde registrados, esta seção fornecerá sugestões e recomendações
                      personalizadas para ajudar a sua família a manter hábitos saudáveis e prevenir problemas de saúde.
                    </p>
                  </div>
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-700 mb-3">Lembretes Inteligentes</h3>
                    <p className="text-sm text-yellow-600">
                      O sistema irá gerar lembretes inteligentes para exames de rotina, vacinações e acompanhamentos
                      médicos, ajudando a manter a saúde de todos em dia.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}
