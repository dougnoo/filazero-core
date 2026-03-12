"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Clock, CheckCircle, TrendingUp, Users, Activity } from "lucide-react"

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const demoSteps = [
    {
      title: "Paciente inicia triagem",
      description: "Via WhatsApp ou app próprio",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      metrics: { time: "0s", accuracy: "100%", status: "Iniciando" },
    },
    {
      title: "IA processa sintomas",
      description: "OCR clínico + modelagem semântica",
      icon: Brain,
      color: "from-purple-500 to-indigo-500",
      metrics: { time: "45s", accuracy: "98.7%", status: "Processando" },
    },
    {
      title: "Recomendações geradas",
      description: "Exames e condutas sugeridas",
      icon: Activity,
      color: "from-emerald-500 to-teal-500",
      metrics: { time: "1m 30s", accuracy: "99.2%", status: "Analisando" },
    },
    {
      title: "Validação médica",
      description: "Profissional credenciado valida",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      metrics: { time: "2m 45s", accuracy: "99.9%", status: "Validado" },
    },
    {
      title: "Sumário entregue",
      description: "Médico recebe caso estruturado",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
      metrics: { time: "3m 00s", accuracy: "100%", status: "Concluído" },
    },
  ]

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, demoSteps.length])

  const currentStepData = demoSteps[currentStep]

  return (
    <div className="relative">
      {/* Main Demo Card */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Demo Interativo - EXAM.ai</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/10"
            >
              {isPlaying ? "Pausar" : "Reproduzir"}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/70">Progresso da Triagem</span>
              <span className="text-sm text-white/70">
                {currentStep + 1}/{demoSteps.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Display */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${currentStepData.color} flex items-center justify-center transition-all duration-500`}
                >
                  <currentStepData.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{currentStepData.title}</h4>
                  <p className="text-white/70">{currentStepData.description}</p>
                </div>
              </div>

              {/* Live Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Tempo</div>
                  <div className="text-lg font-bold text-white">{currentStepData.metrics.time}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Precisão</div>
                  <div className="text-lg font-bold text-white">{currentStepData.metrics.accuracy}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Status</div>
                  <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                    {currentStepData.metrics.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="space-y-3">
              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                    index === currentStep
                      ? "bg-white/10 scale-105"
                      : index < currentStep
                        ? "bg-green-500/10"
                        : "bg-white/5"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      index === currentStep
                        ? `bg-gradient-to-r ${step.color}`
                        : index < currentStep
                          ? "bg-green-500"
                          : "bg-white/20"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <step.icon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${index <= currentStep ? "text-white" : "text-white/50"}`}>
                      {step.title}
                    </div>
                    <div className={`text-xs ${index <= currentStep ? "text-white/70" : "text-white/30"}`}>
                      {step.description}
                    </div>
                  </div>
                  {index === currentStep && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Metrics */}
      <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 animate-float">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Economia Hoje</div>
            <div className="text-xs text-gray-500">R$ 47.280</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 animate-float animation-delay-2000">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Tempo Médio</div>
            <div className="text-xs text-gray-500">2min 47s</div>
          </div>
        </div>
      </div>
    </div>
  )
}
