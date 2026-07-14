import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/app-error.js';

export interface EvolutionTextMessage {
  to: string;
  text: string;
}

export class EvolutionService {
  private get baseUrl() {
    if (!env.EVOLUTION_API_URL) {
      throw new AppError('EVOLUTION_API_URL is not configured', 500, 'EVOLUTION_NOT_CONFIGURED');
    }

    return env.EVOLUTION_API_URL.replace(/\/$/, '');
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      ...(env.EVOLUTION_API_KEY ? { apikey: env.EVOLUTION_API_KEY } : {}),
    };
  }

  async sendTextMessage(message: EvolutionTextMessage) {
    const response = await fetch(`${this.baseUrl}/message/sendText`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        number: message.to,
        text: message.text,
      }),
    });

    if (!response.ok) {
      throw new AppError('Evolution API request failed', 502, 'EVOLUTION_REQUEST_FAILED', {
        status: response.status,
      });
    }

    return response.json();
  }

  async sendImage(to: string, imageUrl: string, caption?: string) {
    const response = await fetch(`${this.baseUrl}/message/sendMedia`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        number: to,
        mediatype: 'image',
        media: imageUrl,
        caption,
      }),
    });

    if (!response.ok) {
      throw new AppError('Evolution API request failed', 502, 'EVOLUTION_REQUEST_FAILED', {
        status: response.status,
      });
    }

    return response.json();
  }
}
