import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/app-error.js';

export interface EvolutionTextMessage {
  to: string;
  text: string;
}

export interface EvolutionConnectionState {
  instanceName: string;
  state: string;
}

export interface EvolutionConnectionQrCode {
  pairingCode: string | null;
  code: string | null;
  base64: string | null;
  count?: number | null;
}

export interface EvolutionConnectionInfo {
  instanceName: string;
  state: string;
  qrCode: EvolutionConnectionQrCode | null;
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
      ...(env.EVOLUTION_API_KEY ? { apikey: env.EVOLUTION_API_KEY } : {}),
    };
  }

  private async requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const isFormData = init.body instanceof FormData;
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(init.headers ?? {}),
      },
    });

    const responseBody = await response.text();
    let parsedBody: T;

    try {
      parsedBody = responseBody ? (JSON.parse(responseBody) as T) : (null as T);
    } catch {
      parsedBody = responseBody as T;
    }

    if (!response.ok) {
      throw new AppError('Evolution API request failed', 502, 'EVOLUTION_REQUEST_FAILED', {
        status: response.status,
        body: responseBody,
      });
    }

    return parsedBody;
  }

  async ensureInstance() {
    return this.requestJson<EvolutionConnectionState>('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName: env.EVOLUTION_INSTANCE_NAME,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });
  }

  async getConnectionState() {
    const response = await this.requestJson<{ instance?: EvolutionConnectionState }>(
      `/instance/connectionState/${encodeURIComponent(env.EVOLUTION_INSTANCE_NAME)}`,
    );

    return response.instance ?? {
      instanceName: env.EVOLUTION_INSTANCE_NAME,
      state: 'unknown',
    };
  }

  async getConnectionQrCode() {
    return this.requestJson<EvolutionConnectionQrCode>(
      `/instance/connect/${encodeURIComponent(env.EVOLUTION_INSTANCE_NAME)}`,
    );
  }

  async getConnectionInfo(): Promise<EvolutionConnectionInfo> {
    let state = await this.getConnectionState().catch(async () => {
      await this.ensureInstance();
      return this.getConnectionState();
    });

    if (state.state !== 'open') {
      const qrCode = await this.getConnectionQrCode().catch(async () => {
        await this.ensureInstance();
        return this.getConnectionQrCode();
      });

      state = await this.getConnectionState().catch(() => state);

      return {
        instanceName: state.instanceName,
        state: state.state,
        qrCode,
      };
    }

    return {
      instanceName: state.instanceName,
      state: state.state,
      qrCode: null,
    };
  }

  async sendTextMessage(message: EvolutionTextMessage) {
    return this.requestJson(
      `/message/sendText/${encodeURIComponent(env.EVOLUTION_INSTANCE_NAME)}`,
      {
        method: 'POST',
        body: JSON.stringify({
          number: message.to,
          text: message.text,
          textMessage: {
            text: message.text,
          },
        }),
      },
    );
  }

  async sendImage(to: string, imageUrl: string, caption?: string) {
    const form = new FormData();

    form.append('number', to);
    form.append('mediatype', 'image');
    form.append('media', imageUrl);

    if (caption) {
      form.append('caption', caption);
    }

    return this.requestJson(
      `/message/sendMedia/${encodeURIComponent(env.EVOLUTION_INSTANCE_NAME)}`,
      {
        method: 'POST',
        body: form,
      },
    );
  }
}
