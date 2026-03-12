# Script para testar Lambda localmente (simulação de múltiplas invocações)
# Simula comportamento da Lambda sem precisar fazer deploy

import sys
import json
import uuid
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.lambda_handler import lambda_handler


def simulate_api_request(message: str, session_id: str) -> dict:
    """Simula uma request HTTP para a Lambda."""
    event = {
        "body": json.dumps({
            "message": message,
            "session_id": session_id
        })
    }
    
    context = None  # Context não é usado na nossa Lambda
    
    return lambda_handler(event, context)


def print_response(response: dict, turn: int):
    """Formata e imprime a resposta da Lambda."""
    print(f"\n{'='*60}")
    print(f"📨 TURNO {turn}")
    print('='*60)
    
    status = response.get("statusCode")
    body = json.loads(response.get("body", "{}"))
    
    print(f"Status: {status}")
    print(f"\n🤖 Agente: {body.get('message', 'N/A')}")
    
    patient_data = body.get("patient_data")
    if patient_data:
        print(f"\n📊 Dados coletados: {json.dumps(patient_data, indent=2, ensure_ascii=False)}")
    
    medical_summary = body.get("medical_summary")
    if medical_summary:
        print("\n" + "="*60)
        print("🩺 RESUMO PARA O MÉDICO")
        print("="*60)
        print(f"Queixa Principal: {medical_summary.get('chief_complaint', 'N/A')}")
        print(f"Sintomas Principais: {', '.join(medical_summary.get('main_symptoms', []))}")
        print(f"Sugestão de Exames: {', '.join(medical_summary.get('suggested_exams', []))}")
        print("\nResumo da Conversa:")
        print(medical_summary.get('conversation_summary', 'N/A'))
        print("="*60)
    
    is_complete = body.get("is_complete")
    if is_complete:
        print("\n✅ TRIAGEM CONCLUÍDA")


def main():
    """Testa uma conversa completa com múltiplas invocações."""
    print("🧪 TESTE DE SESSÕES LAMBDA - SIMULAÇÃO LOCAL")
    print("="*60)
    
    # Gera session_id único para este teste
    session_id = f"test-{uuid.uuid4().hex[:8]}"
    print(f"\n🔑 Session ID: {session_id}")
    
    # Simula conversa multi-turn
    turns = [
        "estou com febre alta",
        "2 dias, 38 graus, dor de cabeça intensa, dor nos olhos moderada",
        "tomei dipirona, teve alívio temporário",
        "não, não, não, teve redução temporária",
        "sim"  # Autorização
    ]
    
    print(f"\n📋 Simulando {len(turns)} turnos de conversa...\n")
    
    for i, message in enumerate(turns, 1):
        print(f"\n👤 Você: {message}")
        
        # Simula invocação da Lambda
        response = simulate_api_request(message, session_id)
        
        # Mostra resposta
        print_response(response, i)
        
        # Verifica se terminou
        body = json.loads(response.get("body", "{}"))
        if body.get("is_complete"):
            break
    
    print("\n" + "="*60)
    print("✅ TESTE CONCLUÍDO")
    print("="*60)
    print(f"\nℹ️  A sessão '{session_id}' foi salva no DynamoDB")
    print("ℹ️  Execute novamente para criar uma nova sessão")


if __name__ == "__main__":
    # Carrega variáveis de ambiente
    from dotenv import load_dotenv
    load_dotenv()
    
    main()
