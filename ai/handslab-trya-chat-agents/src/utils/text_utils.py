"""
Utilitários de texto - Processamento de mensagens.
"""
import re


def remove_emojis(text: str) -> str:
    """
    Remove emojis de um texto.
    
    Args:
        text: Texto com possíveis emojis
        
    Returns:
        Texto sem emojis
    """
    # Pattern para remover emojis
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA00-\U0001FAFF"  # extended symbols
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub('', text).strip()
