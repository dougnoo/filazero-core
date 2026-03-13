import { Link } from 'react-router-dom';
import { MessageSquare, Route as RouteIcon, Shield, ArrowRight, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';

export default function CitizenHome() {
  const { isAuthenticated, user } = useAuth();

  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto max-w-lg px-4">
        {/* Hero */}
        <div className="pt-8 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground font-display">FZ</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">FilaZero</h1>
          <p className="mt-2 text-muted-foreground">
            Inteligência clínica para o atendimento público de saúde
          </p>
        </div>

        {/* Auth-aware greeting */}
        {isAuthenticated && user && (
          <div className="pb-4">
            <p className="text-sm text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{user.name}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {!isAuthenticated ? (
            <Link to="/login" className="block">
              <Button className="w-full h-12 font-display font-semibold">
                Entrar com CPF
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/intake" className="block">
                <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground">Iniciar Atendimento</h3>
                    <p className="text-sm text-muted-foreground">Coleta clínica inteligente com IA</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link to="/minha-jornada" className="block">
                <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                    <RouteIcon className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground">Minha Jornada</h3>
                    <p className="text-sm text-muted-foreground">Acompanhe cada etapa do seu cuidado</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 pb-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Shield className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Seus dados são protegidos pela LGPD. A triagem por IA não substitui avaliação médica presencial.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
