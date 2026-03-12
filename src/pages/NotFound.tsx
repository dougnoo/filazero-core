import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
        <span className="text-2xl font-bold text-primary-foreground font-display">FZ</span>
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">Página não encontrada</p>
      <Link to="/" className="mt-6">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Button>
      </Link>
    </div>
  );
}
