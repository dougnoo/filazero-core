"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User, Send, Stethoscope, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
}

export function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou seu assistente especializado para encontrar médicos na rede credenciada. Posso ajudar você a localizar especialistas, verificar disponibilidade e fornecer recomendações baseadas na sua cobertura. Como posso ajudar hoje?",
      sender: "ai",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue
    if (!messageText.trim()) return

    const newUserMessage: Message = { id: Date.now().toString(), text: messageText, sender: "user" }
    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)

    // Simular resposta da IA com respostas específicas da rede
    await new Promise((resolve) => setTimeout(resolve, 1500))

    let aiResponseText = "Buscando na rede credenciada..."

    if (messageText.toLowerCase().includes("cardiologista")) {
      aiResponseText =
        "Encontrei excelentes cardiologistas na sua rede! Dr. Ana Silva (4.8⭐) e Dr. Roberto Santos (4.7⭐) são especialistas altamente avaliados que aceitam seu plano. Ambos estão aceitando novos pacientes. Gostaria de ver horários disponíveis ou mais detalhes sobre seus serviços?"
    } else if (messageText.toLowerCase().includes("pediatra")) {
      aiResponseText =
        "Para cuidados pediátricos, recomendo Dr. Carlos Oliveira no Rio de Janeiro (4.9⭐) e Dra. Marina Costa (4.6⭐). Ambos são pediatras certificados cobertos pelo seu plano. Dr. Oliveira é especialista em pediatria geral e vacinação. Posso ajudar a agendar uma consulta?"
    } else if (messageText.toLowerCase().includes("dermatologista")) {
      aiResponseText =
        "Ótimas opções em dermatologia na sua rede! Dra. Beatriz Lima (4.8⭐) e Dr. Fernando Rocha (4.5⭐) são especialistas em dermatologia. Dra. Lima foca em procedimentos estéticos enquanto Dr. Fernando é especialista em dermatologia cirúrgica. Que tipo de tratamento você procura?"
    } else if (messageText.toLowerCase().includes("ortopedista")) {
      aiResponseText =
        "Encontrei especialistas ortopédicos para você! Dr. João Mendes é especialista em cirurgia da coluna (4.7⭐) e Dra. Patrícia Alves foca em ortopedia pediátrica e pé/tornozelo (4.6⭐). Ambos estão na sua rede credenciada. Que tipo de cuidado ortopédico você precisa?"
    } else if (messageText.toLowerCase().includes("ginecologista")) {
      aiResponseText =
        "Para cuidados ginecológicos, Dra. Luciana Ferreira (4.8⭐) e Dr. Ricardo Moura (4.5⭐) são excelentes opções na sua rede. Dra. Ferreira é especialista em pré-natal e ultrassom, enquanto Dr. Ricardo foca em procedimentos minimamente invasivos. Ambos aceitam seu plano."
    } else if (messageText.toLowerCase().includes("perto") || messageText.toLowerCase().includes("próximo")) {
      aiResponseText =
        "Posso ajudar você a encontrar médicos próximos! Nossa rede credenciada tem provedores em São Paulo, Rio de Janeiro, Belo Horizonte, Brasília e Salvador. Em qual cidade você está, ou gostaria de ver opções em uma área específica?"
    } else {
      aiResponseText = `Entendi que você está procurando por "${messageText}". Deixe-me buscar em nossa base de dados da rede credenciada os melhores especialistas que atendem suas necessidades e aceitam seu plano. Posso fornecer recomendações baseadas em avaliações, localização e disponibilidade.`
    }

    const newAiMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: "ai" }
    setMessages((prev) => [...prev, newAiMessage])
    setIsLoading(false)
  }

  // Reduzido para apenas 4 buscas rápidas
  const quickPrompts = [
    "Cardiologista próximo",
    "Pediatra disponível",
    "Dermatologista bem avaliado",
    "Ortopedista para coluna",
  ]

  return (
    <Card className="flex flex-col h-full shadow-lg border-t-4 border-t-blue-500">
      <CardHeader className="p-3 border-b bg-gradient-to-r from-blue-50 via-white to-green-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Stethoscope className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base text-gray-800 flex items-center gap-2">
              Encontrar Médico da Rede Credenciada
              <Sparkles className="h-4 w-4 text-blue-500" />
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              Assistente IA especializado na sua rede de saúde
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : ""}`}>
              {msg.sender === "ai" && (
                <Avatar className="h-6 w-6 bg-blue-100 shrink-0">
                  <AvatarFallback>
                    <Bot className="h-3 w-3 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[85%] p-2 rounded-lg text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none border"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <Avatar className="h-6 w-6 bg-gray-100 shrink-0">
                  <AvatarFallback>
                    <User className="h-3 w-3 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2">
              <Avatar className="h-6 w-6 bg-blue-100">
                <AvatarFallback>
                  <Bot className="h-3 w-3 text-blue-600" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[85%] p-2 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none border">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">Buscando na rede...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t bg-gray-50">
        <p className="text-xs text-gray-500 mb-1.5 font-medium">Buscas rápidas:</p>
        <div className="grid grid-cols-2 gap-1">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage(prompt)}
              className="text-xs h-6 px-2 hover:bg-blue-50 hover:border-blue-200 justify-start"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      <CardFooter className="p-2 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex w-full items-center gap-2"
        >
          <Input
            type="text"
            placeholder="Pergunte sobre médicos, especialidades ou localizações..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs h-7"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 h-7 w-7"
          >
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
