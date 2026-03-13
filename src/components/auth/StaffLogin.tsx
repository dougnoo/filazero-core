import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/domain/enums/user-role';
import { isDemoMode } from '@/lib/env';

interface StaffLoginProps {
  title: string;
  subtitle: string;
  redirectTo: string;
  role: UserRole;
}

interface DemoAccount {
  name: string;
  email: string;
  desc: string;
}

const DEMO_ACCOUNTS: Record<string, DemoAccount[]> = {
  [UserRole.PROFESSIONAL]: [
    { name: 'Dr. Carlos Mendes', email: 'carlos@ubs.gov.br', desc: 'Clínico Geral — UBS Centro' },
    { name: 'Dra. Fernanda Lima', email: 'fernanda@ubs.gov.br', desc: 'Médica de Família — UBS Norte' },
  ],
  [UserRole.MANAGER]: [
    { name: 'Ana Coordenadora', email: 'ana@saude.gov.br', desc: 'Coordenadora de Atenção Básica' },
    { name: 'Ricardo Diretor', email: 'gestor@saude.gov.br', desc: 'Diretor de Regulação Municipal' },
  ],
  [UserRole.ADMIN]: [
    { name: 'Admin FilaZero', email: 'admin@filazero.com', desc: 'Administrador da Plataforma' },
  ],
};

export default function StaffLogin({ title, subtitle, redirectTo, role }: StaffLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithCredentials, isLoading } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || redirectTo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithCredentials(email, password, role);
    navigate(from, { replace: true });
  };

  const handleDemoLogin = async (demoEmail: string) => {
    await loginWithCredentials(demoEmail, 'demo123', role);
    navigate(from, { replace: true });
  };

  const demoAccounts = DEMO_ACCOUNTS[role] ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <span className="text-xl font-bold text-primary-foreground font-display">FZ</span>
            </div>
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12 font-display font-semibold" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <button type="button" className="w-full text-center text-sm text-primary hover:underline">
              Esqueci minha senha
            </button>
          </form>

          {isDemoMode() && demoAccounts.length > 0 && (
            <div className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Acesso Demo</p>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleDemoLogin(acc.email)}
                  disabled={isLoading}
                  className="flex w-full flex-col items-start gap-0.5 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent hover:border-primary/40"
                >
                  <span className="text-sm font-medium text-foreground">{acc.name}</span>
                  <span className="text-xs text-muted-foreground">{acc.desc}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">{acc.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}