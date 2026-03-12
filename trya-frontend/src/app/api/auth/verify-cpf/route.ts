import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json(
        { message: 'Body da requisição está vazio' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { message: 'JSON inválido no body da requisição' },
        { status: 400 }
      );
    }

    if (!body.cpf) {
      return NextResponse.json(
        { message: 'CPF é obrigatório' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/verify-cpf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API Route] Verify CPF error:', error);
    return NextResponse.json(
      { message: 'Erro ao conectar com o servidor' },
      { status: 502 }
    );
  }
}
