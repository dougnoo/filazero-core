import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoMode } from '@/lib/env';

const DEMO_CITIZENS = [
  { name: 'Maria da Silva Santos', cpf: '123.456.789-00', desc: 'Dor torácica — Emergência (Cardiologia)' },
  { name: 'João Pedro Oliveira', cpf: '234.567.890-11', desc: 'Cefaleia com alteração visual — Urgente (Neurologia)' },
  { name: 'Francisca Souza', cpf: '345.678.901-22', desc: 'Tosse persistente — Muito Urgente (Pneumologia)' },
];

export default function CitizenLogin() {
  const [cpf, setCpf] = useState('');
  const [step, setStep] = useState<'cpf' | 'otp'>('cpf');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithCPF, isLoading } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCPFSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.replace(/\D/g, '').length === 11) {
      setStep('otp');
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      await loginWithCPF(cpf, otp);
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async (demoCpf: string) => {
    await loginWithCPF(demoCpf, '1234');
    navigate(from, { replace: true });
  };

  if (step === 'otp') {
    return (
      <div className="flex min-h-screen flex-col bg-background px-4">
        <div className="pt-6">
          <button onClick={() => setStep('cpf')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center pb-20">
          <div className="w-full max-w-sm space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold">Código de Verificação</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enviamos um SMS para o celular cadastrado no CPF {cpf}
              </p>
            </div>
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-[0.5em] h-14"
                autoFocus
              />
              <Button type="submit" className="w-full h-12 font-display font-semibold" disabled={otp.length < 4 || isLoading}>
                {isLoading ? 'Verificando...' : 'Verificar'}
              </Button>
              <button type="button" className="w-full text-center text-sm text-primary hover:underline">
                Reenviar código
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-4">
      <div className="flex flex-1 flex-col items-center justify-center pb-20">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <span className="text-xl font-bold text-primary-foreground font-display">FZ</span>
            </div>
            <h1 className="font-display text-2xl font-bold">Entrar no FilaZero</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe seu CPF para acessar o atendimento clínico inteligente
            </p>
          </div>
          <form onSubmit={handleCPFSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">CPF</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                className="h-12 text-base"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12 font-display font-semibold" disabled={cpf.replace(/\D/g, '').length !== 11}>
              Continuar
            </Button>
          </form>

          {isDemoMode() && (
            <div className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Acesso Demo — Pacientes</p>
              {DEMO_CITIZENS.map((c) => (
                <button
                  key={c.cpf}
                  onClick={() => handleDemoLogin(c.cpf)}
                  disabled={isLoading}
                  className="flex w-full flex-col items-start gap-0.5 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent hover:border-primary/40"
                >
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.desc}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">CPF: {c.cpf}</span>
                </button>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Ao continuar, você concorda com a{' '}
              <span className="text-primary underline">Política de Privacidade</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}