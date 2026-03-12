import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/domain/enums/user-role';
import { userRoleConfig } from '@/domain/enums/user-role';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles allowed to access this route */
  allowedRoles: UserRole[];
}

/**
 * Centralized route guard.
 * - Not authenticated → redirect to role-appropriate login
 * - Wrong role → redirect to user's home
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Determine which login page to redirect to based on the route
    const loginPath = getLoginPathForRoute(location.pathname);
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // User is authenticated but wrong role → send to their home
    const homePath = userRoleConfig[user.role].homePath;
    return <Navigate to={homePath} replace />;
  }

  return <>{children}</>;
}

function getLoginPathForRoute(pathname: string): string {
  if (pathname.startsWith('/profissional') || pathname.startsWith('/revisao-clinica')) {
    return '/profissional/login';
  }
  if (pathname.startsWith('/gestor') || pathname.startsWith('/dashboard-clinico') || pathname.startsWith('/fluxo')) {
    return '/gestor/login';
  }
  if (pathname.startsWith('/admin')) {
    return '/admin/login';
  }
  return '/login';
}
