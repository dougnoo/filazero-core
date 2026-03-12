import { Link } from 'react-router-dom';
import { MessageSquare, Clock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CitizenHome() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 pt-12 pb-8 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground font-display">FZ</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">FilaZero</h1>
          <p className="mt-2 text-muted-foreground">
            Triagem inteligente e fila digital para o SUS
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mx-auto w-full max-w-sm space-y-3 px-4 pt-6">
        <Link to="/triagem" className="block">
          <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">Iniciar Triagem</h3>
              <p className="text-sm text-muted-foreground">Descreva seus sintomas para a IA</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link to="/fila" className="block">
          <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">Minha Fila</h3>
              <p className="text-sm text-muted-foreground">Veja sua posição e tempo de espera</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
          </div>
        </Link>
      </div>

      {/* Footer info */}
      <div className="mt-auto px-4 py-8">
        <div className="mx-auto flex max-w-sm items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Shield className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Seus dados são protegidos pela LGPD. A triagem por IA não substitui avaliação médica presencial.
          </p>
        </div>
      </div>
    </div>
  );
}
