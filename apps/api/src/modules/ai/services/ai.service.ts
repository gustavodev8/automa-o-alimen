import OpenAI from 'openai';
import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/app-error.js';

export interface TranscribedAudioResult {
  text: string;
}

export interface OrderExtractionResult {
  intent: 'saudacao' | 'pedido' | 'duvida' | 'endereco' | 'pagamento' | 'cancelamento' | 'outro';
  observations: string[];
  productHints: Array<{
    name: string;
    quantity: number;
    observations?: string;
  }>;
  address?: string;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AICatalogItem {
  name: string;
  category: string;
  price: number;
  description?: string | null;
  stock?: number | null;
}

export interface CustomerAnswerInput {
  customerName: string;
  customerPhone: string;
  message: string;
  history: AIChatMessage[];
  catalog: AICatalogItem[];
}

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export class AIService {
  private readonly openAiAudioClient = this.getOpenAiAudioKey()
    ? new OpenAI({ apiKey: this.getOpenAiAudioKey() })
    : null;

  isAutoReplyReady() {
    return env.AI_AUTO_REPLY_ENABLED && env.AI_PROVIDER !== 'disabled' && Boolean(this.getApiKey());
  }

  async transcribeAudio(file: Buffer, fileName = 'audio.ogg'): Promise<TranscribedAudioResult> {
    if (!this.openAiAudioClient) {
      throw new AppError('OPENAI_API_KEY is not configured for audio transcription', 500, 'OPENAI_NOT_CONFIGURED');
    }

    const response = await this.openAiAudioClient.audio.transcriptions.create({
      file: new File([file], fileName),
      model: 'gpt-4o-mini-transcribe',
    });

    return { text: response.text };
  }

  async extractOrderData(message: string): Promise<OrderExtractionResult> {
    const text = await this.completeText([
      {
        role: 'system',
        content: 'Extraia apenas intencoes e produtos sem calcular precos. Responda em JSON valido.',
      },
      {
        role: 'user',
        content: message,
      },
    ]);

    try {
      return JSON.parse(text) as OrderExtractionResult;
    } catch {
      return {
        intent: 'outro',
        observations: [message],
        productHints: [],
      };
    }
  }

  async answerQuestion(question: string): Promise<string> {
    return this.completeText([
      {
        role: 'system',
        content: this.getDefaultSystemPrompt(),
      },
      {
        role: 'user',
        content: question,
      },
    ]);
  }

  async answerCustomerMessage(input: CustomerAnswerInput): Promise<string> {
    const catalog = this.formatCatalog(input.catalog);
    const systemPrompt = [
      env.AI_SYSTEM_PROMPT?.trim() || this.getDefaultSystemPrompt(),
      '',
      'Cardapio atual:',
      catalog || 'Nenhum produto cadastrado no painel ainda.',
      '',
      'Regras:',
      '- Responda em portugues do Brasil.',
      '- Seja curto, simpatico e objetivo, como um atendente de lanchonete no WhatsApp.',
      '- Use somente os produtos e precos do cardapio informado.',
      '- Nao invente pagamento aprovado, pedido criado ou prazo que nao esteja no contexto.',
      '- Quando o cliente quiser pedir, colete produto, quantidade, retirada/entrega, endereco e forma de pagamento.',
      '- Se faltar informacao, faca uma pergunta por vez.',
    ].join('\n');

    const messages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      ...input.history.slice(-10),
      {
        role: 'user',
        content: [
          `Cliente: ${input.customerName || input.customerPhone}`,
          `Telefone: ${input.customerPhone}`,
          `Mensagem recebida: ${input.message}`,
        ].join('\n'),
      },
    ];

    return this.completeText(messages);
  }

  private async completeText(messages: ChatCompletionMessage[]) {
    if (!this.getApiKey()) {
      throw new AppError('AI_API_KEY is not configured', 500, 'AI_NOT_CONFIGURED');
    }

    switch (env.AI_PROVIDER) {
      case 'github':
        return this.callOpenAICompatible(messages, {
          baseUrl: env.AI_BASE_URL ?? 'https://models.github.ai/inference',
          model: env.AI_MODEL ?? 'azure-openai/gpt-4-1-mini',
        });
      case 'openai':
        return this.callOpenAICompatible(messages, {
          baseUrl: env.AI_BASE_URL ?? 'https://api.openai.com/v1',
          model: env.AI_MODEL ?? 'gpt-4o-mini',
        });
      case 'gemini':
        return this.callGemini(messages, env.AI_MODEL ?? 'gemini-1.5-flash');
      case 'disabled':
      default:
        throw new AppError('AI provider is disabled', 500, 'AI_DISABLED');
    }
  }

  private async callOpenAICompatible(
    messages: ChatCompletionMessage[],
    options: { baseUrl: string; model: string },
  ) {
    const response = await fetch(`${options.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: env.AI_TEMPERATURE,
        max_tokens: env.AI_MAX_TOKENS,
      }),
    });

    const body = await response.text();

    if (!response.ok) {
      throw new AppError('AI provider request failed', 502, 'AI_REQUEST_FAILED', {
        provider: env.AI_PROVIDER,
        status: response.status,
        body,
      });
    }

    const payload = JSON.parse(body) as OpenAICompatibleResponse;
    const answer = payload.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new AppError('AI provider returned an empty answer', 502, 'AI_EMPTY_ANSWER');
    }

    return answer;
  }

  private async callGemini(messages: ChatCompletionMessage[], model: string) {
    const systemMessage = messages.find((message) => message.role === 'system')?.content;
    const conversation = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${this.getApiKey()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(systemMessage
            ? {
                systemInstruction: {
                  parts: [{ text: systemMessage }],
                },
              }
            : {}),
          contents: conversation,
          generationConfig: {
            temperature: env.AI_TEMPERATURE,
            maxOutputTokens: env.AI_MAX_TOKENS,
          },
        }),
      },
    );

    const body = await response.text();

    if (!response.ok) {
      throw new AppError('AI provider request failed', 502, 'AI_REQUEST_FAILED', {
        provider: env.AI_PROVIDER,
        status: response.status,
        body,
      });
    }

    const payload = JSON.parse(body) as GeminiResponse;
    const answer = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!answer) {
      throw new AppError('AI provider returned an empty answer', 502, 'AI_EMPTY_ANSWER');
    }

    return answer;
  }

  private getApiKey() {
    switch (env.AI_PROVIDER) {
      case 'github':
        return env.AI_API_KEY || env.GITHUB_MODELS_TOKEN;
      case 'openai':
        return env.AI_API_KEY || env.OPENAI_API_KEY;
      case 'gemini':
        return env.AI_API_KEY || env.GEMINI_API_KEY;
      case 'disabled':
      default:
        return '';
    }
  }

  private getOpenAiAudioKey() {
    return env.OPENAI_API_KEY || (env.AI_PROVIDER === 'openai' ? env.AI_API_KEY : undefined);
  }

  private getDefaultSystemPrompt() {
    return 'Voce e o atendente virtual da Lanchonete Central. Ajude clientes a tirar duvidas, escolher itens do cardapio e organizar pedidos pelo WhatsApp.';
  }

  private formatCatalog(catalog: AICatalogItem[]) {
    return catalog
      .map((item) => {
        const price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(item.price);
        const stock = item.stock !== null && item.stock !== undefined ? `, estoque ${item.stock}` : '';
        const description = item.description ? ` - ${item.description}` : '';

        return `- ${item.name} (${item.category}): ${price}${stock}${description}`;
      })
      .join('\n');
  }
}
