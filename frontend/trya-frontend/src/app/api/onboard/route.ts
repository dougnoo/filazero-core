import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  console.log('[API /onboard POST] authHeader:', authHeader);
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Token não fornecido' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const token = authHeader.substring(7);
    
    console.log('[API /onboard POST] Body received:', body);
    
    // Mock: simula salvamento do onboarding
    // Marca o usuário como onboarded chamando o endpoint /me
    const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('[API /onboard POST] /api/auth/me response status:', response.status);
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding completado com sucesso',
      onboardedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API /onboard POST] Error:', error);
    return NextResponse.json(
      { message: 'Erro ao processar onboarding' },
      { status: 500 }
    );
  }
}
