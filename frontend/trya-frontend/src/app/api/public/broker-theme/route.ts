import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantName = searchParams.get('tenantName') || 'default';

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/public/broker-theme?tenantName=${encodeURIComponent(tenantName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('[API Route] GET /api/public/broker-theme error:', error);
    return NextResponse.json(
      { message: 'Erro ao conectar com o servidor' },
      { status: 502 }
    );
  }
}
