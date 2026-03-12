import { useState } from "react";
import { Plus, QrCode } from "lucide-react";
import QueueTicket, { type QueueTicketData } from "@/components/QueueTicket";
import JoinQueueSheet from "@/components/JoinQueueSheet";

const mockTickets: QueueTicketData[] = [
  {
    id: "1",
    venueName: "Cartório 3ª Zona",
    venueType: "Cartório",
    yourNumber: 47,
    currentNumber: 42,
    estimatedWait: 15,
    peopleAhead: 5,
    status: "soon",
  },
  {
    id: "2",
    venueName: "Clínica São Lucas",
    venueType: "Saúde",
    yourNumber: 112,
    currentNumber: 98,
    estimatedWait: 35,
    peopleAhead: 14,
    status: "waiting",
  },
];

const ActiveQueues = () => {
  const [tickets, setTickets] = useState<QueueTicketData[]>(mockTickets);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleJoin = (venueName: string) => {
    const newTicket: QueueTicketData = {
      id: String(Date.now()),
      venueName,
      venueType: "Estabelecimento",
      yourNumber: Math.floor(Math.random() * 200) + 50,
      currentNumber: Math.floor(Math.random() * 50) + 1,
      estimatedWait: Math.floor(Math.random() * 40) + 5,
      peopleAhead: Math.floor(Math.random() * 20) + 1,
      status: "waiting",
    };
    setTickets((prev) => [newTicket, ...prev]);
    setSheetOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Fila<span className="text-primary">Zero</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {tickets.length} fila{tickets.length !== 1 ? "s" : ""} ativa{tickets.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-full bg-muted p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Escanear QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSheetOpen(true)}
              className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
              aria-label="Entrar na fila"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tickets */}
      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-5">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <QrCode className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Nenhuma fila ativa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escaneie um QR Code ou entre manualmente
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <QueueTicket key={ticket.id} ticket={ticket} />
          ))
        )}
      </main>

      <JoinQueueSheet open={sheetOpen} onOpenChange={setSheetOpen} onJoin={handleJoin} />
    </div>
  );
};

export default ActiveQueues;
