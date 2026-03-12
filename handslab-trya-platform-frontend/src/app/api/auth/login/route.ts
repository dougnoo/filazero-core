import { NextRequest, NextResponse } from 'next/server';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Simulação de usuários válidos (em produção, isso viria de um banco de dados)
const validUsers = [
  {
    email: 'bamorim@skopiadigital.com.br',
    password: 'F67*jqqH=8',
    id: '9404c8-1004-701f-e07c-64fce7b57339',
    username: 'teste'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Busca o usuário
    const user = validUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Simula geração de token JWT (em produção, use uma biblioteca real)
    const accessToken = `eyJraWQiOiJtTmlk0F1qWkMwck4wak5Jck5hTEXMMEP4WU1SXC9pTWFCcmg4aDhRMVA@VT@iLCJhbGciOiJsUzI1NiJ9.eyJzdWIiOiI5NDA40TRjOC11MDQXLTcwMWYtZTA3Yy02NGZjZTdiNTczMzkiLCJjb2duaXRvOmd5b3VwcyI6WyJTVVBFU19BRE1JTiJdLCJpc3Mi0iJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWWhc3QtMV9Ccnc1dDRWWFciLCJjbGllbnRfaWQiOiI1Z2xwNXI2bzkxdmRtdXN2YWU0CXV1ZWQ10CIsIm9yaWdpbl9qdGki0iJhYjkzNTNiZi1hODkyLTRlYWUtOTQ50S1iMWQ2ZjBkMmUyOWYiLCJ1dmVudF9pZCI6ImQ2ZGJkMGFhLTI3YTQtNGF1MS1hNmI2LTRmM2JkNmZjOWQ2YyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXROX3RpbWUi0jE3NjEwNzUwMDESIMV4CCI6MTc2MTA3ODYwMSwiaWF0IjoxNzYxMDc1MDAxLCJqdGki0iJkYzQ3MmMxYi05YzI1LTQxOTAtYTk3Zi1lNTdlYTAZNGU5ZDAiLCJ1c2VybmFtZSI6InRlc3RlIn0.1DdpouUF9GZI3szkbTiqTddp5WqpoYESC8EUAT8907RpbdqtUY3qdwwSbYuvZ1fFdOf2MRW007mMHEMK1FOMEJ-mUtq-yGCo7msVYvrwDUxElsPgj7TQYuOrkMgD-jxovQnuFvS1PTf2eXxyi-4kdibiSLXifNPG0tH7UhWsjdbqwiVaErlJXXCK0YgEhTtSqZPm7s2mBrKaj-IAXH5A_bg1TJe6hRnQ_NDe9-8cn8a-qLa8H4BE1EAXWEVV7E9WCoryabpZsLopAKko087X_P2Wx8FckRxykNW2M8y5cwQ8JMKZGtnWp7R0QASY-5v9hVj9AIOILlh1pI_s_ihdQ`;
    
    const response: LoginResponse = {
      accessToken,
      refreshToken: '',
      expiresIn: 3600 // 1 hora
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
