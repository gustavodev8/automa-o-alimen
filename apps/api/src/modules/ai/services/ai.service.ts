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

export class AIService {
  private readonly client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

  private ensureClient() {
    if (!this.client) {
      throw new AppError('OPENAI_API_KEY is not configured', 500, 'OPENAI_NOT_CONFIGURED');
    }
  }

  async transcribeAudio(file: Buffer, fileName = 'audio.ogg'): Promise<TranscribedAudioResult> {
    this.ensureClient();

    const response = await this.client!.audio.transcriptions.create({
      file: new File([file], fileName),
      model: 'gpt-4o-mini-transcribe',
    });

    return { text: response.text };
  }

  async extractOrderData(message: string): Promise<OrderExtractionResult> {
    this.ensureClient();

    const completion = await this.client!.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content:
            'Extraia apenas intenções e produtos sem calcular preços. Responda em JSON válido.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const text = completion.output_text?.trim() ?? '';

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
    this.ensureClient();

    const completion = await this.client!.responses.create({
      model: 'gpt-4o-mini',
      input: question,
    });

    return completion.output_text?.trim() ?? '';
  }
}
