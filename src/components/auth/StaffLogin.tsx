import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/domain/enums/user-role';

interface StaffLoginProps {
  title: string;
  subtitle: string;
  redirectTo: string;
  role: UserRole;
}

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
        </div>
      </div>
    </div>
  );
}
