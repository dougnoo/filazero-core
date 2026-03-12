import Link from "next/link"
import { ArrowLeft, Shield, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { UserInsurance } from "@/types/provider"

interface NetworkHeaderProps {
  userInsurance: UserInsurance
  providerCount: number
}

export function NetworkHeader({ userInsurance, providerCount }: NetworkHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/mainpage"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Rede Credenciada</h1>
              <p className="text-sm text-gray-600">{providerCount} provedores cobertos pelo seu plano</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              {userInsurance.planName}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Users className="h-3 w-3 mr-1" />
              {providerCount} Médicos
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}
