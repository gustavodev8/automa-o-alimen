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
    const response = await fetch(
      `${this.baseUrl}/message/sendText/${encodeURIComponent(env.EVOLUTION_INSTANCE_NAME)}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: message.to,
          text: message.text,
          textMessage: {
            text: message.text,
          },
        }),
      },
    );

    if (!response.ok) {
      const responseBody = await response.text();
      throw new AppError('Evolution API request failed', 502, 'EVOLUTION_REQUEST_FAILED', {
        status: response.status,
        body: responseBody,
      });
    }

    return response.json();
  }

  async sendImage(to: string, imageUrl: string, caption?: string) {
    const form = new FormData();
    const headers = env.EVOLUTION_API_KEY ? { apikey: env.EVOLUTION_API_KEY } : {};

    form.append('number', to);
    form.append('mediatype', 'image');
    form.append('media', imageUrl);

    if (caption) {
      form.append('caption', caption);
    }

    const response = await fetch(
      `${this.baseUrl}/message/sendMedia/${encodeURIComponent(env.EVOLUTION_INSTANCE_NAME)}`,
      {
        method: 'POST',
        headers,
        body: form,
      },
    );

    if (!response.ok) {
      const responseBody = await response.text();
      throw new AppError('Evolution API request failed', 502, 'EVOLUTION_REQUEST_FAILED', {
        status: response.status,
        body: responseBody,
      });
    }

    return response.json();
  }
}
