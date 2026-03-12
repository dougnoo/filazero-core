import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRole, type RoleSlug, RoleEnum } from '@/shared/role';

const DEFAULT_ROLE: RoleSlug = RoleEnum.Paciente;

const PUBLIC_PATHS = [
  'login',
  'first-access',
  'password-reset',
  'password-reset/verify',
  'password-reset/new-password',
];

// Rotas públicas que não precisam do role na URL
const PUBLIC_ROUTES_WITHOUT_ROLE = [
  '/login',
  '/first-access',
  '/password-reset',
  '/password-reset/verify',
  '/password-reset/new-password',
];

const resolveRoleFromRequest = (pathname: string, searchParams: URLSearchParams): RoleSlug => {
  const segments = pathname.split('/').filter(Boolean);

  for (const segment of segments) {
    const normalized = segment.toLowerCase();
    if (isRole(normalized)) {
      return normalized;
    }
  }

  const roleParam = searchParams.get('role');
  if (roleParam) {
    const normalizedParam = roleParam.toLowerCase();
    if (isRole(normalizedParam)) {
      return normalizedParam;
    }
  }

  return DEFAULT_ROLE;
};

const isPublicRoute = (pathname: string): boolean => {
  // Verifica primeiro se é uma rota pública sem role (ex: /login)
  for (const publicRoute of PUBLIC_ROUTES_WITHOUT_ROLE) {
    if (pathname === publicRoute || pathname.startsWith(publicRoute + '/')) {
      return true;
    }
  }

  // Remove a barra inicial
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  
  // Verifica se é uma rota com [role] seguida de uma rota pública
  // Exemplo: /paciente/login -> ['paciente', 'login']
  const parts = cleanPath.split('/');
  
  // Se tem menos de 2 partes, não é rota pública (com role)
  if (parts.length < 2) {
    return false;
  }
  
  // Pega a parte depois do role (parts[1] em diante)
  const pathAfterRole = parts.slice(1).join('/');
  
  // Verifica se o path após o role corresponde exatamente a um caminho público
  // ou começa com um caminho público seguido de /
  for (const publicPath of PUBLIC_PATHS) {
    // Match exato
    if (pathAfterRole === publicPath) {
      return true;
    }
    // Match de subpath (ex: 'password-reset/verify/123' começa com 'password-reset/verify/')
    if (pathAfterRole.startsWith(publicPath + '/')) {
      return true;
    }
  }
  
  return false;
};

const redirectToLogin = (req: NextRequest, role: RoleSlug, tenant?: string | null) => {
  const loginUrl = new URL('/login', req.url);
  if (tenant && tenant.trim() !== '') {
    loginUrl.searchParams.set('tenant', tenant);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
};

// Verifica se uma rota requer autenticação
const requiresAuthentication = (pathname: string): boolean => {
  // Se for rota pública, não requer autenticação
  if (isPublicRoute(pathname)) {
    return false;
  }

  // Rotas de API não requerem autenticação no proxy (elas fazem sua própria validação)
  if (pathname.startsWith('/api/')) {
    return false;
  }

  // Todas as outras rotas requerem autenticação
  // Isso inclui rotas protegidas explícitas e qualquer rota dentro de (authenticated)
  return true;
};

// Valida o token de autenticação
const isValidToken = (token: string | undefined): boolean => {
  if (!token || token.trim() === '') {
    return false;
  }
  
  // Validação básica do token (formato mínimo)
  // Tokens JWT têm 3 partes separadas por ponto (header.payload.signature)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3 || tokenParts.some(part => part.trim() === '')) {
    return false;
  }
  
  return true;
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const tenant = url.searchParams.get('tenant');
  const role = resolveRoleFromRequest(pathname, url.searchParams);

  // PRIORIDADE 1: Verificar autenticação ANTES de qualquer outra coisa
  // Se a rota requer autenticação, verifica o token imediatamente
  if (requiresAuthentication(pathname)) {
    const token = req.cookies.get('accessToken')?.value;
    
    // Se não tiver token válido, redireciona imediatamente para login
    // Isso evita que qualquer conteúdo seja renderizado antes do redirecionamento
    if (!isValidToken(token)) {
      return redirectToLogin(req, role, tenant);
    }
  }

  // PRIORIDADE 2: Multi-tenant por subdomínio (somente fora do localhost)
  // Isso só acontece se passou na verificação de autenticação acima
  const host = req.headers.get('host') ?? '';       // ex: acme.trya.com:3001
  const hostNoPort = host.split(':')[0];            // acme.trya.com
  const isDevHost = hostNoPort === 'localhost' || hostNoPort.startsWith('127.');
  
  // Ignora hosts de infraestrutura (ALB, CloudFront, ELB)
  const isInfraHost = hostNoPort.includes('.elb.amazonaws.com') || 
                      hostNoPort.includes('.cloudfront.net') ||
                      hostNoPort.includes('trya-frontend-') ||
                      hostNoPort.includes('trya-backend-');

  if (!isDevHost && !isInfraHost) {
    const sub = hostNoPort.split('.')[0];          // acme
    if (sub && sub !== 'www') {
      const cloned = url.clone();
      cloned.searchParams.set('tenant', sub);
      return NextResponse.rewrite(cloned);
    }
  }

  // Se passou todas as verificações, permite a requisição
  return NextResponse.next();
}

// Configuração do matcher - executa em todas as rotas exceto arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (favicon)
     * - arquivos estáticos da pasta public (png, jpg, jpeg, gif, svg, ico)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)',
  ],
};

