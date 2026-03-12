import { MapPin, Clock, Users, ChevronRight } from "lucide-react";

export interface QueueTicketData {
  id: string;
  venueName: string;
  venueType: string;
  yourNumber: number;
  currentNumber: number;
  estimatedWait: number; // minutes
  peopleAhead: number;
  status: "waiting" | "soon" | "ready";
}

const statusConfig = {
  waiting: {
    label: "Aguardando",
    containerClass: "border-border",
    badgeClass: "bg-muted text-muted-foreground",
  },
  soon: {
    label: "Em breve",
    containerClass: "border-secondary",
    badgeClass: "bg-secondary text-secondary-foreground",
  },
  ready: {
    label: "Sua vez!",
    containerClass: "border-primary",
    badgeClass: "bg-primary text-primary-foreground",
  },
};

const QueueTicket = ({ ticket }: { ticket: QueueTicketData }) => {
  const config = statusConfig[ticket.status];

  return (
    <div
      className={`animate-slide-up rounded-xl border-2 bg-card p-5 shadow-sm transition-all ${config.containerClass}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-card-foreground">
            {ticket.venueName}
          </h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {ticket.venueType}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>
          {ticket.status === "ready" && (
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-current" />
          )}
          {config.label}
        </span>
      </div>

      {/* Numbers */}
      <div className="mb-4 flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sua senha
          </p>
          <p className="font-display text-5xl font-bold text-card-foreground">
            {String(ticket.yourNumber).padStart(3, "0")}
          </p>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Senha atual
          </p>
          <p className="font-display text-5xl font-bold text-primary">
            {String(ticket.currentNumber).padStart(3, "0")}
          </p>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{ticket.peopleAhead} na frente</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className={ticket.status === "ready" ? "animate-pulse-soft font-semibold text-primary" : ""}>
            {ticket.status === "ready" ? "Agora!" : `~${ticket.estimatedWait} min`}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default QueueTicket;
