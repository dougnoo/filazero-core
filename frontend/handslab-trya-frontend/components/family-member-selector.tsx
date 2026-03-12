"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users } from "lucide-react"
import type { FamilyMember } from "@/types/family-health"

interface FamilyMemberSelectorProps {
  members: FamilyMember[]
  selectedMember: string | null
  onMemberSelect: (memberId: string | null) => void
  onAddMember: (member: Omit<FamilyMember, "id">) => void
}

export function FamilyMemberSelector({
  members,
  selectedMember,
  onMemberSelect,
  onAddMember,
}: FamilyMemberSelectorProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    dateOfBirth: "",
    bloodType: "",
  })

  const handleAddMember = () => {
    if (newMember.name && newMember.relationship && newMember.dateOfBirth) {
      onAddMember({
        ...newMember,
        dateOfBirth: new Date(newMember.dateOfBirth),
        allergies: [],
        chronicConditions: [],
      })
      setNewMember({ name: "", relationship: "", dateOfBirth: "", bloodType: "" })
      setIsAddingMember(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const translateRelationship = (relationship: string) => {
    const translations = {
      self: "Eu",
      spouse: "Cônjuge",
      child: "Filho(a)",
      parent: "Pai/Mãe",
      sibling: "Irmão/Irmã",
      other: "Outro",
    }
    return translations[relationship] || relationship
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Membros da Família</h3>
        <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs">
              <Plus className="h-3 w-3 mr-1.5" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Membro da Família</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Grau de Parentesco</Label>
                <Select
                  value={newMember.relationship}
                  onValueChange={(value) => setNewMember({ ...newMember, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o parentesco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Eu mesmo(a)</SelectItem>
                    <SelectItem value="spouse">Cônjuge/Companheiro(a)</SelectItem>
                    <SelectItem value="child">Filho(a)</SelectItem>
                    <SelectItem value="parent">Pai/Mãe</SelectItem>
                    <SelectItem value="sibling">Irmão/Irmã</SelectItem>
                    <SelectItem value="other">Outro familiar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newMember.dateOfBirth}
                  onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Tipo Sanguíneo (Opcional)</Label>
                <Select
                  value={newMember.bloodType}
                  onValueChange={(value) => setNewMember({ ...newMember, bloodType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o tipo sanguíneo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="unknown">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full">
                Salvar Membro
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {/* All Family View */}
        <Card
          className={`cursor-pointer transition-all duration-150 ease-in-out 
                    ${selectedMember === null ? "ring-2 ring-blue-600 bg-blue-50 shadow-md" : "hover:shadow-lg hover:bg-gray-50"}`}
          onClick={() => onMemberSelect(null)}
        >
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-800">Visão Geral da Família</h4>
                <p className="text-xs text-gray-500">{members.length} membros cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Members */}
        {members.map((member) => (
          <Card
            key={member.id}
            className={`cursor-pointer transition-all duration-150 ease-in-out 
                      ${selectedMember === member.id ? "ring-2 ring-blue-600 bg-blue-50 shadow-md" : "hover:shadow-lg hover:bg-gray-50"}`}
            onClick={() => onMemberSelect(member.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={
                      member.avatar ||
                      `/placeholder.svg?height=40&width=40&query=retrato profissional de ${member.name.split(" ")[0]}`
                    }
                  />
                  <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800 truncate">{member.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {translateRelationship(member.relationship)}
                    </Badge>
                    <span className="text-xs text-gray-500">{calculateAge(member.dateOfBirth)} anos de idade</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
