'use client';

export default function ClientePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#041616] mb-6">
          Área do Cliente
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg text-gray-700">
            Bem-vindo à área do cliente! Esta página está em desenvolvimento.
          </p>
          <div className="mt-6">
            <a 
              href="/triagem" 
              className="text-[#0A3A3A] underline hover:text-[#082a2a]"
            >
              Ir para Triagem →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

