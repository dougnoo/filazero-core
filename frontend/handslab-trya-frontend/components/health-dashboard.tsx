"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, AlertTriangle, CheckCircle, Clock, Calendar, Syringe, Activity } from "lucide-react"
import type { HealthDocument, FamilyMember, HealthAlert } from "@/types/family-health"

interface HealthDashboardProps {
  documents: HealthDocument[]
  members: FamilyMember[]
  selectedMember: string | null
  alerts: HealthAlert[]
}

export function HealthDashboard({ documents, members, selectedMember, alerts }: HealthDashboardProps) {
  const stats = useMemo(() => {
    const filteredDocs = selectedMember ? documents.filter((doc) => doc.memberId === selectedMember) : documents

    const filteredAlerts = selectedMember ? alerts.filter((alert) => alert.memberId === selectedMember) : alerts

    const total = filteredDocs.length
    const valid = filteredDocs.filter((doc) => doc.status === "valid").length
    const expired = filteredDocs.filter((doc) => doc.status === "expired").length
    const pending = filteredDocs.filter((doc) => doc.status === "pending").length
    const critical = filteredDocs.filter((doc) => doc.status === "critical").length

    const byCategory = filteredDocs.reduce(
      (acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const recentDocs = filteredDocs.filter((doc) => {
      const daysDiff = (new Date().getTime() - doc.date.getTime()) / (1000 * 3600 * 24)
      return daysDiff <= 30
    }).length

    const upcomingReminders = filteredDocs
      .flatMap((doc) => doc.reminders || [])
      .filter((reminder) => {
        const daysDiff = (reminder.date.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        return daysDiff >= 0 && daysDiff <= 30
      }).length

    return {
      total,
      valid,
      expired,
      pending,
      critical,
      byCategory,
      recentDocs,
      upcomingReminders,
      criticalAlerts: filteredAlerts.filter((alert) => alert.priority === "critical").length,
      unreadAlerts: filteredAlerts.filter((alert) => !alert.isRead).length,
    }
  }, [documents, selectedMember, alerts])

  const getSelectedMemberName = () => {
    if (!selectedMember) return "Toda a Família"
    const member = members.find((m) => m.id === selectedMember)
    return member?.name || "Membro"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard: {getSelectedMemberName()}</h2>
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          Atualizado: {new Date().toLocaleDateString("pt-BR")}
        </Badge>
      </div>

      {stats.criticalAlerts > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription>
            <strong>{stats.criticalAlerts} alerta(s) crítico(s)</strong> requer(em) atenção imediata.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Exames</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            <p className="text-xs text-gray-500">{stats.recentDocs} adicionados este mês</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Exames Válidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
            <Progress value={stats.total > 0 ? (stats.valid / stats.total) * 100 : 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Exames Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
            <Progress value={stats.total > 0 ? (stats.expired / stats.total) * 100 : 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <Progress value={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <Activity className="h-5 w-5 text-blue-500" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.byCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.byCategory).map(([category, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                  const categoryLabels: Record<string, string> = {
                    "lab-results": "Exames Laboratoriais",
                    "medical-images": "Imagens Médicas",
                    vaccination: "Vacinação",
                    "clinical-files": "Arquivos Clínicos",
                    "routine-checkup": "Check-ups",
                  }
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{categoryLabels[category] || category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma categoria de exame encontrada.</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <Calendar className="h-5 w-5 text-blue-500" />
              Lembretes e Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Vacinas/Lembretes Próximos</span>
              </div>
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                {stats.upcomingReminders}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Alertas Não Lidos</span>
              </div>
              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                {stats.unreadAlerts}
              </Badge>
            </div>
            {stats.critical > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Resultados Críticos</span>
                </div>
                <Badge variant="destructive">{stats.critical}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
