"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, ArrowRight } from "lucide-react"

export function ROICalculator() {
  const [beneficiaries, setBeneficiaries] = useState([100000])
  const [consultationsPerYear, setConsultationsPerYear] = useState([200000])
  const [avgCostPerConsultation, setAvgCostPerConsultation] = useState([150])
  const [results, setResults] = useState({
    currentCost: 0,
    consultationsReduced: 0,
    annualSavings: 0,
    roiPercentage: 0,
    paybackMonths: 0,
    platformCost: 0,
  })

  useEffect(() => {
    const currentCost = consultationsPerYear[0] * avgCostPerConsultation[0]
    const consultationsReduced = Math.round(consultationsPerYear[0] * 0.5) // 50% reduction
    const annualSavings = consultationsReduced * avgCostPerConsultation[0]
    const platformCost = beneficiaries[0] * 12 * 0.89 // R$ 0.89 per life per month
    const roiPercentage = ((annualSavings - platformCost) / platformCost) * 100
    const paybackMonths = platformCost / (annualSavings / 12)

    setResults({
      currentCost,
      consultationsReduced,
      annualSavings,
      roiPercentage,
      paybackMonths,
      platformCost,
    })
  }, [beneficiaries, consultationsPerYear, avgCostPerConsultation])

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <span>Calculadora de ROI Interativa</span>
        </CardTitle>
        <p className="text-cyan-100">Descubra o impacto financeiro da EXAM.ai na sua operadora</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Controls */}
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Número de Beneficiários</Label>
              <div className="space-y-2">
                <Slider
                  value={beneficiaries}
                  onValueChange={setBeneficiaries}
                  max={1000000}
                  min={10000}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10k</span>
                  <span className="font-medium text-gray-900">{beneficiaries[0].toLocaleString()}</span>
                  <span>1M</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Consultas por Ano</Label>
              <div className="space-y-2">
                <Slider
                  value={consultationsPerYear}
                  onValueChange={setConsultationsPerYear}
                  max={2000000}
                  min={50000}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>50k</span>
                  <span className="font-medium text-gray-900">{consultationsPerYear[0].toLocaleString()}</span>
                  <span>2M</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Custo Médio por Consulta (R$)</Label>
              <div className="space-y-2">
                <Slider
                  value={avgCostPerConsultation}
                  onValueChange={setAvgCostPerConsultation}
                  max={500}
                  min={50}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>R$ 50</span>
                  <span className="font-medium text-gray-900">R$ {avgCostPerConsultation[0]}</span>
                  <span>R$ 500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Custo Atual</span>
                </div>
                <div className="text-xl font-bold text-red-900">R$ {(results.currentCost / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-red-600">por ano</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Economia Anual</span>
                </div>
                <div className="text-xl font-bold text-green-900">
                  R$ {(results.annualSavings / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-green-600">50% redução</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Resumo do Investimento</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Consultas Reduzidas</span>
                  <span className="font-medium">{results.consultationsReduced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Custo da Plataforma</span>
                  <span className="font-medium">R$ {(results.platformCost / 1000).toFixed(0)}k/ano</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ROI</span>
                  <Badge className="bg-green-500 text-white">{results.roiPercentage.toFixed(0)}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payback</span>
                  <span className="font-medium">{results.paybackMonths.toFixed(1)} meses</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
              Solicitar Proposta Personalizada
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
