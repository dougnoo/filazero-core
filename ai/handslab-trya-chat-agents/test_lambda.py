"""
Script para testar o agente localmente antes do deploy.
"""
import json
from src.lambda_handler import lambda_handler


def test_local():
    """Testa o handler da Lambda localmente."""
    
    # Simula evento do API Gateway
    test_event = {
        "body": json.dumps({
            "message": "Olá, estou com dor de cabeça forte há 2 dias",
            "session_id": "test-123"
        }),
        "headers": {
            "Content-Type": "application/json"
        }
    }
    
    # Contexto mockado
    class MockContext:
        def __init__(self):
            self.function_name = "test-function"
            self.memory_limit_in_mb = 512
            self.invoked_function_arn = "arn:aws:lambda:us-east-1:123456789:function:test"
            self.aws_request_id = "test-request-id"
    
    context = MockContext()
    
    # Executa handler
    print("🧪 Testando Lambda Handler...")
    print("=" * 60)
    
    response = lambda_handler(test_event, context)
    
    print(f"\n📤 Response Status: {response['statusCode']}")
    print(f"📄 Response Body:")
    print(json.dumps(json.loads(response['body']), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    test_local()
