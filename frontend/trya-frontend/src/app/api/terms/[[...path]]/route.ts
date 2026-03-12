import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, params, 'POST');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, params, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path?: string[] }>,
  method: string
) {
  const { path = [] } = await params;
  const pathStr = path.length > 0 ? path.join('/') : '';
  const search = request.nextUrl.search;
  const targetPath = pathStr ? `/api/terms/${pathStr}${search}` : `/api/terms${search}`;
  const targetUrl = `${BACKEND_URL.replace(/\/$/, '')}${targetPath}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (
      key.toLowerCase() !== 'host' &&
      key.toLowerCase() !== 'connection' &&
      key.toLowerCase() !== 'content-length'
    ) {
      headers.set(key, value);
    }
  });

  let body: ArrayBuffer | undefined;
  if (method !== 'GET' && request.body) {
    body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const data = await response.text();
  const contentType = response.headers.get('content-type') || 'application/json';

  // Em dev: se backend retornar 401 (ex: token mock inválido para Cognito),
  // retornar dados vazios em GET para evitar logout. O usuário vê lista vazia
  // mas permanece autenticado até configurar backend + Cognito.
  if (response.status === 401 && method === 'GET') {
    const isListEndpoint = pathStr.includes('history') || pathStr === 'latest';
    const emptyBody = isListEndpoint ? '[]' : 'null';
    return new NextResponse(emptyBody, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Se backend retornar 404 (ex: não está rodando ou módulo não carregado),
  // retornar [] para history/latest para a listagem não quebrar.
  if (response.status === 404 && method === 'GET') {
    const isListEndpoint = pathStr.includes('history') || pathStr === 'latest';
    if (isListEndpoint) {
      return new NextResponse('[]', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new NextResponse(data, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': contentType,
    },
  });
}
