"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  Brain,
  UserCheck,
  FileText,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  Clock,
  TrendingDown,
} from "lucide-react"

export function PatientJourneyFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  const journeySteps = [
    {
      id: "traditional",
      title: "Jornada Tradicional",
      subtitle: "Como funciona hoje",
      color: "from-red-500 to-red-600",
      steps: [
        {
          icon: Clock,
          title: "Agendamento",
          description: "Paciente agenda consulta",
          time: "7-15 dias",
          cost: "R$ 0",
          issues: ["Longa espera", "Agenda lotada"],
        },
        {
          icon: Stethoscope,
          title: "Consulta Inicial",
          description: "Médico faz triagem básica",
          time: "15-20 min",
          cost: "R$ 150",
          issues: ["Sem contexto prévio", "Triagem manual"],
        },
        {
          icon: FileText,
          title: "Pedido de Exames",
          description: "Solicitação de exames",
          time: "5 min",
          cost: "R$ 0",
          issues: ["Exames genéricos", "Sem priorização"],
        },
        {
          icon: Clock,
          title: "Aguardar Resultados",
          description: "Paciente faz exames e aguarda",
          time: "3-7 dias",
          cost: "R$ 200-500",
          issues: ["Nova espera", "Ansiedade"],
        },
        {
          icon: Stethoscope,
          title: "Retorno",
          description: "Consulta para ver resultados",
          time: "15-20 min",
          cost: "R$ 150",
          issues: ["Consulta redundante", "Custo adicional"],
        },
      ],
    },
    {
      id: "optimized",
      title: "Jornada Otimizada",
      subtitle: "Com EXAM.ai",
      color: "from-green-500 to-green-600",
      steps: [
        {
          icon: Smartphone,
          title: "Triagem Digital",
          description: "IA processa sintomas via WhatsApp",
          time: "3-5 min",
          cost: "R$ 12",
          benefits: ["Imediato", "Disponível 24/7"],
        },
        {
          icon: Brain,
          title: "Análise IA",
          description: "Processamento inteligente",
          time: "2 min",
          cost: "R$ 0",
          benefits: ["99.9% precisão", "Protocolos médicos"],
        },
        {
          icon: UserCheck,
          title: "Validação Médica",
          description: "Profissional valida remotamente",
          time: "5 min",
          cost: "R$ 0",
          benefits: ["Especialista dedicado", "Rastreabilidade"],
        },
        {
          icon: FileText,
          title: "Exames Direcionados",
          description: "Recomendações precisas",
          time: "Imediato",
          cost: "R$ 150-300",
          benefits: ["Exames específicos", "Redução 40%"],
        },
        {
          icon: Stethoscope,
          title: "Consulta Focada",
          description: "Médico recebe sumário completo",
          time: "10-15 min",
          cost: "R$ 150",
          benefits: ["Foco na conduta", "Maior resolutividade"],
        },
      ],
    },
  ]

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % journeySteps.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isAnimating, journeySteps.length])

  const currentJourney = journeySteps[activeStep]

  return (
    <div className="space-y-8">
      {/* Journey Selector */}
      <div className="flex justify-center space-x-4">
        {journeySteps.map((journey, index) => (
          <button
            key={journey.id}
            onClick={() => {
              setActiveStep(index)
              setIsAnimating(false)
            }}
            className={`px-6 py-3 rounded-xl transition-all duration-500 ${
              activeStep === index
                ? `bg-gradient-to-r ${journey.color} text-white shadow-lg`
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <div className="font-semibold">{journey.title}</div>
            <div className="text-sm opacity-80">{journey.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Journey Visualization */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">{currentJourney.title}</h3>
            <p className="text-white/70">{currentJourney.subtitle}</p>
          </div>

          {/* Steps Flow */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {currentJourney.steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div
                    className={`
                    bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20
                    transition-all duration-700 delay-${index * 100}
                    hover:bg-white/20 hover:scale-105
                  `}
                  >
                    {/* Icon */}
                    <div
                      className={`
                      w-12 h-12 rounded-xl bg-gradient-to-r ${currentJourney.color} 
                      flex items-center justify-center mb-4 mx-auto
                    `}
                    >
                      <step.icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-2">
                      <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                      <p className="text-xs text-white/70">{step.description}</p>

                      {/* Metrics */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/50">Tempo:</span>
                          <Badge className="bg-white/20 text-white border-0 text-xs">{step.time}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/50">Custo:</span>
                          <Badge className="bg-white/20 text-white border-0 text-xs">{step.cost}</Badge>
                        </div>
                      </div>

                      {/* Issues or Benefits */}
                      <div className="space-y-1">
                        {(step as any).issues && (
                          <div className="space-y-1">
                            {(step as any).issues.map((issue: string, i: number) => (
                              <div key={i} className="text-xs text-red-300 flex items-center space-x-1">
                                <div className="w-1 h-1 bg-red-400 rounded-full" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(step as any).benefits && (
                          <div className="space-y-1">
                            {(step as any).benefits.map((benefit: string, i: number) => (
                              <div key={i} className="text-xs text-green-300 flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < currentJourney.steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-white/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Comparison */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <TrendingDown className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{activeStep === 0 ? "5-10 dias" : "1 dia"}</div>
              <div className="text-xs text-white/70">Tempo Total</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <TrendingDown className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{activeStep === 0 ? "R$ 500-800" : "R$ 312"}</div>
              <div className="text-xs text-white/70">Custo Total</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{activeStep === 0 ? "60%" : "95%"}</div>
              <div className="text-xs text-white/70">Resolutividade</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
