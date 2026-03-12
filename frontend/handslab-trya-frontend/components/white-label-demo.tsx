"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, Eye, Download, Smartphone, Monitor, Tablet } from "lucide-react"

export function WhiteLabelDemo() {
  const [selectedTheme, setSelectedTheme] = useState("default")
  const [selectedDevice, setSelectedDevice] = useState("desktop")

  const themes = [
    {
      id: "default",
      name: "Sua Operadora",
      primary: "from-purple-500 to-pink-500",
      secondary: "from-purple-100 to-pink-100",
      logo: "SO",
    },
    {
      id: "medical",
      name: "MedCare Plus",
      primary: "from-green-500 to-emerald-500",
      secondary: "from-green-100 to-emerald-100",
      logo: "MC",
    },
    {
      id: "corporate",
      name: "HealthCorp",
      primary: "from-blue-500 to-indigo-500",
      secondary: "from-blue-100 to-indigo-100",
      logo: "HC",
    },
  ]

  const devices = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ]

  const currentTheme = themes.find((t) => t.id === selectedTheme) || themes[0]

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="flex flex-wrap gap-3">
        {themes.map((theme) => (
          <Button
            key={theme.id}
            variant={selectedTheme === theme.id ? "default" : "outline"}
            onClick={() => setSelectedTheme(theme.id)}
            className={`${
              selectedTheme === theme.id
                ? `bg-gradient-to-r ${theme.primary} text-white`
                : "border-white/20 text-white hover:bg-white/10"
            }`}
          >
            <div className={`w-4 h-4 rounded bg-gradient-to-r ${theme.primary} mr-2`} />
            {theme.name}
          </Button>
        ))}
      </div>

      {/* Device Selector */}
      <div className="flex space-x-2">
        {devices.map((device) => (
          <Button
            key={device.id}
            variant={selectedDevice === device.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedDevice(device.id)}
            className="text-white hover:bg-white/10"
          >
            <device.icon className="h-4 w-4 mr-1" />
            {device.label}
          </Button>
        ))}
      </div>

      {/* Preview Container */}
      <div className="relative">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Preview em Tempo Real</h4>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Mock Interface */}
            <div
              className={`
              bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-500
              ${selectedDevice === "mobile" ? "max-w-sm mx-auto" : ""}
              ${selectedDevice === "tablet" ? "max-w-2xl mx-auto" : ""}
            `}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${currentTheme.primary} p-4`}>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold`}
                  >
                    {currentTheme.logo}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{currentTheme.name}</h3>
                    <p className="text-white/80 text-sm">Triagem Inteligente</p>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 space-y-4">
                <div className={`bg-gradient-to-r ${currentTheme.secondary} rounded-lg p-4`}>
                  <h4 className="font-semibold text-gray-800 mb-2">Bem-vindo à Triagem IA</h4>
                  <p className="text-gray-600 text-sm">Vamos começar sua avaliação médica personalizada</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`bg-gradient-to-r ${currentTheme.primary} rounded-lg p-4 text-white`}>
                    <div className="text-2xl font-bold">847</div>
                    <div className="text-sm opacity-90">Triagens Hoje</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-800">92%</div>
                    <div className="text-sm text-gray-600">Precisão</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Sintomas relatados</span>
                    <Badge className={`bg-gradient-to-r ${currentTheme.primary} text-white border-0`}>
                      Processando
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Análise IA concluída</span>
                    <Badge className="bg-green-500 text-white border-0">Completo</Badge>
                  </div>
                </div>

                <Button className={`w-full bg-gradient-to-r ${currentTheme.primary} text-white`}>
                  Continuar Triagem
                </Button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Palette className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">Cores</span>
                </div>
                <p className="text-xs text-white/70">Paleta totalmente customizável</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-cyan-400 rounded" />
                  <span className="text-sm font-medium text-white">Logo</span>
                </div>
                <p className="text-xs text-white/70">Sua marca em destaque</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-cyan-400 rounded" />
                  <span className="text-sm font-medium text-white">Layout</span>
                </div>
                <p className="text-xs text-white/70">Interface adaptável</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Customization Panel */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-xs">
          <h5 className="font-semibold text-gray-900 mb-3">Opções de Customização</h5>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Cor Primária</label>
              <div className="flex space-x-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-6 h-6 rounded bg-gradient-to-r ${theme.primary} ${
                      selectedTheme === theme.id ? "ring-2 ring-gray-400" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Logo</label>
              <div className="w-full h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                Upload sua logo
              </div>
            </div>
            <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
              Aplicar Mudanças
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
