"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function NewTopicButton() {
  const handleNewTopic = () => {
    // Placeholder for initiating a new topic process
    alert("Iniciando novo tópico...")
    // In a real application, this would involve state updates,
    // routing to a new page, or opening a modal for topic creation.
  }

  return (
    <div className="p-4 border-b border-gray-100">
      <Button
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        onClick={handleNewTopic}
      >
        <Plus className="mr-2 h-4 w-4" />
        {"+ Novo Tópico"}
      </Button>
    </div>
  )
}
