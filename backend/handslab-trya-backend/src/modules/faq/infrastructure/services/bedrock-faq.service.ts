import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { IFaqService } from '../../domain/interfaces/faq.service.interface';
import {
  FaqQuestion,
  FaqCategory,
} from '../../domain/entities/faq-question.entity';

@Injectable()
export class BedrockFaqService implements IFaqService {
  private readonly bedrockClient: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region', 'us-east-1');
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    // Usar modelId específico do FAQ (BEDROCK_FAQ_MODEL_ID) ou fallback para BEDROCK_MODEL_ID
    // Preferir Haiku para FAQ por ser mais rápido e ter rate limit maior
    this.modelId =
      this.configService.get<string>('aws.bedrock.faqModelId') ||
      this.configService.get<string>('aws.bedrock.modelId') ||
      'anthropic.claude-3-haiku-20240307-v1:0';

    // Configuração comum do cliente Bedrock com timeout e retry
    const clientConfig = {
      region,
      // Configurar timeout aumentado para 110s (menor que o ALB timeout de 120s)
      requestHandler: {
        requestTimeout: 110000, // 110 segundos
        httpsAgent: {
          maxSockets: 25,
          keepAlive: true,
        },
      },
      // Configurar retry para resiliência
      maxAttempts: 3,
    };

    // Construir configuração do cliente Bedrock
    if (accessKeyId && secretAccessKey) {
      this.bedrockClient = new BedrockRuntimeClient({
        ...clientConfig,
        ...(profile && { profile }),
        credentials: { accessKeyId, secretAccessKey },
      });
    } else if (profile) {
      this.bedrockClient = new BedrockRuntimeClient({
        ...clientConfig,
        profile,
      });
    } else {
      this.bedrockClient = new BedrockRuntimeClient(clientConfig);
    }

    console.log(
      `BedrockFaqService initialized with model: ${this.modelId}, region: ${region}`,
    );
  }

  async answerQuestion(question: FaqQuestion): Promise<string> {
    console.log(`[FAQ] Processing question in category: ${question.category}`);

    const context = this.getContextByCategory(question.category);
    const prompt = this.buildPrompt(question.message, context);

    // Tentar primeiro com o modelo configurado
    try {
      return await this.invokeModel(this.modelId, prompt);
    } catch (primaryError) {
      const error = primaryError as Error & { name?: string };

      // Se for timeout e o modelo não for Haiku, tentar fallback para Haiku
      const isTimeout =
        error.name === 'TimeoutError' || error.message?.includes('timeout');
      const isNotHaiku = !this.modelId.includes('haiku');

      if (isTimeout && isNotHaiku) {
        console.warn(
          `[FAQ] ⚠️ Timeout com ${this.modelId}, tentando fallback para Haiku...`,
        );

        try {
          return await this.invokeModel(
            'anthropic.claude-3-haiku-20240307-v1:0',
            prompt,
          );
        } catch (fallbackError) {
          console.error('[FAQ] ❌ Fallback também falhou:', fallbackError);
          // Se fallback também falhar, lançar o erro original
          throw primaryError;
        }
      }

      // Se não for timeout ou já era Haiku, lançar o erro original
      throw primaryError;
    }
  }

  private async invokeModel(
    modelId: string,
    prompt: string,
    retryCount = 0,
  ): Promise<string> {
    const maxRetries = 3;
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    try {
      console.log(
        `[FAQ] Invoking Bedrock model: ${modelId}${retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ''}`,
      );
      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body),
      ) as {
        content: Array<{ text: string }>;
      };
      console.log(`[FAQ] Bedrock response received successfully`);
      return responseBody.content[0].text;
    } catch (err) {
      const error = err as Error & {
        code?: string;
        name?: string;
        $metadata?: unknown;
      };

      console.error('❌ Bedrock error:', {
        message: error.message,
        code: error.code,
        name: error.name,
        modelId,
      });

      // Retry com backoff para ThrottlingException
      if (error.name === 'ThrottlingException' && retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.warn(
          `[FAQ] ⚠️ Rate limit atingido, aguardando ${waitTime}ms antes de tentar novamente...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.invokeModel(modelId, prompt, retryCount + 1);
      }

      // Mensagens de erro mais amigáveis
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(
          `Modelo de IA não disponível (${modelId}). Contate o suporte.`,
        );
      }
      if (error.name === 'AccessDeniedException') {
        throw new Error(
          'Sem permissão para acessar o serviço de IA. Contate o suporte.',
        );
      }
      if (error.name === 'ThrottlingException') {
        throw new Error(
          'Serviço de IA temporariamente sobrecarregado. Tente novamente em alguns segundos.',
        );
      }
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Tempo de resposta esgotado. Tente novamente.');
      }

      throw new Error(
        `Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.`,
      );
    }
  }

  private buildPrompt(userMessage: string, context: string): string {
    return `Você é um assistente da Plataforma Trya, especializado em responder dúvidas sobre saúde corporativa.

CONTEXTO:
${context}

INSTRUÇÕES:
- Responda de forma clara, objetiva e amigável
- Use apenas as informações do contexto fornecido
- Se a pergunta não estiver relacionada ao contexto, informe educadamente que só pode responder sobre a Plataforma Trya
- Mantenha respostas concisas (máximo 3 parágrafos)
- Use linguagem acessível e profissional

PERGUNTA DO USUÁRIO:
${userMessage}

RESPOSTA:`;
  }

  private getContextByCategory(category: FaqCategory): string {
    const contexts = {
      [FaqCategory.GENERAL]: `GERAL
1. O que é a Plataforma Trya?
A Trya é um portal onde você pode cuidar da sua saúde dentro da empresa.
Por lá, você consegue enviar atestados, fazer triagens de sintomas, receber orientação médica ou psicológica, acompanhar consultas e ter acesso rápido ao que precisa no seu dia a dia.

2. Como a plataforma funciona na prática?
De forma simples: você acessa a Trya pelo navegador e usa os serviços de saúde que a empresa disponibiliza. Pode fazer uma triagem, receber recomendações, enviar documentos e acompanhar seus atendimentos.
Os profissionais de saúde e o RH recebem suas informações para dar andamento no que for necessário.

3. Como faço para acessar?
Basta entrar no link enviado pela empresa e fazer login pelo navegador do celular ou computador.
Não precisa instalar aplicativo. Cada pessoa tem seu próprio acesso.

4. Minhas informações ficam seguras?
Sim. A Trya segue todas as regras de privacidade e proteção de dados.
Suas informações de saúde são tratadas com segurança e só podem ser visualizadas por profissionais autorizados.`,

      [FaqCategory.TRIAGE_AI]: `TRIAGEM E IA
1. Como funciona a triagem médica inteligente?
A triagem faz algumas perguntas sobre seus sintomas e, com base nas respostas, gera uma orientação inicial — como descansar, procurar atendimento, ou seguir para telemedicina.

2. O que é analisado durante a triagem?
A plataforma considera o que você relata: seus sintomas, intensidade, tempo de início e outras informações importantes para entender seu caso e indicar o melhor caminho.

3. O que acontece depois que eu termino a triagem?
Você recebe uma orientação automática na hora.
Dependendo da situação, pode ser recomendado procurar atendimento, fazer uma consulta online ou apenas seguir cuidados simples.

4. Quando um médico entra na análise?
Quando a triagem identifica algo que precisa de atenção especial. Nesse caso, um médico revisa seu caso e dá a orientação adequada.`,

      [FaqCategory.ACCREDITED_NETWORKS]: `REDES CREDENCIADAS
1. Como a plataforma escolhe para onde me encaminhar?
Depois de avaliar seus sintomas, a plataforma indica os lugares mais adequados para você ser atendido — como clínicas, laboratórios, psicólogos ou telemedicina — sempre considerando sua necessidade e o que está disponível na rede.

2. A recomendação já considera meu plano de saúde?
Sim. A Trya direciona você para locais que fazem parte da rede credenciada da empresa ou da operadora parceira.

3. O que acontece depois que recebo a recomendação?
Dependendo do caso, você pode ser encaminhado para teleconsulta, receber orientação para ir até uma unidade próxima ou seguir instruções simples de cuidado.

4. A experiência muda de empresa para empresa?
Sim. A plataforma se adapta à política de saúde da sua empresa e às redes credenciadas que ela disponibiliza.`,

      [FaqCategory.CERTIFICATES]: `ATESTADOS 
1. Como envio meu atestado?
É só acessar a plataforma, fazer o upload do documento e preencher as informações pedidas. Todo o processo é rápido e feito pelo navegador do celular ou computador.

2. O que acontece depois que eu envio?
A plataforma faz uma leitura automática para identificar as informações do documento, como datas e tipo de afastamento, e ajuda o RH a dar andamento no seu caso.

3. Quem valida meu atestado?
Depois da verificação automática, profissionais de saúde podem revisar o documento quando necessário. A empresa só finaliza o processo após essa avaliação.

4. Onde acompanho o status do meu atestado?
Dentro da própria plataforma você consegue ver se o atestado está em análise, aprovado, ou se precisa enviar alguma informação complementar.`,
    };

    return contexts[category];
  }
}
