import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, MessageSquare, Clock, User, LayoutDashboard, Users, ListChecks, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/domain/enums/user-role';

interface AppShellProps {
  children: ReactNode;
  role?: UserRole;
}

const citizenNav = [
  { label: 'Início', icon: Home, path: '/' },
  { label: 'Triagem', icon: MessageSquare, path: '/triagem' },
  { label: 'Minha Fila', icon: Clock, path: '/fila' },
  { label: 'Perfil', icon: User, path: '/perfil' },
];

const professionalNav = [
  { label: 'Fila', icon: ListChecks, path: '/profissional' },
  { label: 'Atendimentos', icon: Users, path: '/profissional/atendimentos' },
  { label: 'Perfil', icon: User, path: '/profissional/perfil' },
];

const managerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/gestor' },
  { label: 'Filas', icon: ListChecks, path: '/gestor/filas' },
  { label: 'Configurações', icon: Settings, path: '/gestor/config' },
];

export function AppShell({ children, role = UserRole.CITIZEN }: AppShellProps) {
  const location = useLocation();
  const isCitizen = role === UserRole.CITIZEN;
  const nav = role === UserRole.PROFESSIONAL ? professionalNav
    : role === UserRole.MANAGER ? managerNav
    : citizenNav;

  if (isCitizen) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 pb-20">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
          <div className="mx-auto flex max-w-lg items-center justify-around py-2">
            {nav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">FZ</span>
          </div>
          <span className="font-display text-lg font-bold text-foreground">FilaZero</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 md:px-8">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">FZ</span>
            </div>
            <span className="font-display text-lg font-bold">FilaZero</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
