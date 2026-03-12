import { Clock, MapPin, CheckCircle2 } from "lucide-react";

const historyItems = [
  {
    id: "h1",
    venueName: "Banco do Brasil - Ag 15",
    date: "11 Mar 2026",
    waitTime: "22 min",
    number: 34,
  },
  {
    id: "h2",
    venueName: "UPA Central",
    date: "9 Mar 2026",
    waitTime: "1h 05min",
    number: 156,
  },
  {
    id: "h3",
    venueName: "Cartório 2ª Zona",
    date: "5 Mar 2026",
    waitTime: "38 min",
    number: 89,
  },
];

const History = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-md px-5 py-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Histórico</h1>
          <p className="text-sm text-muted-foreground">{historyItems.length} filas concluídas</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-3 px-5">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="animate-slide-up flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
              <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-card-foreground">
                {item.venueName}
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.date}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{item.waitTime}</span>
              </p>
            </div>
            <span className="font-display text-lg font-bold text-muted-foreground">
              #{String(item.number).padStart(3, "0")}
            </span>
          </div>
        ))}
      </main>
    </div>
  );
};

export default History;
