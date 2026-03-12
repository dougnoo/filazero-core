import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";

const venues = [
  "Cartório 1ª Zona",
  "Cartório 3ª Zona",
  "Clínica São Lucas",
  "Banco Central - Ag 42",
  "Detran - Unidade Centro",
  "Prefeitura - Protocolo",
  "Farmácia Popular",
  "UBS Vila Nova",
];

const JoinQueueSheet = ({
  open,
  onOpenChange,
  onJoin,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onJoin: (name: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const filtered = venues.filter((v) =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-xl">Entrar na fila</SheetTitle>
          <SheetDescription>Escolha o estabelecimento</SheetDescription>
        </SheetHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filtered.map((v) => (
            <button
              key={v}
              onClick={() => onJoin(v)}
              className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {v}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default JoinQueueSheet;
