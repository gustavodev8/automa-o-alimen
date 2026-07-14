import type {
  CreatePaymentInput,
  PaymentGatewayPort,
  PaymentGatewayStatus,
  PaymentWebhookPayload,
} from '../../../application/ports/payment-gateway.port.js';

export class MockPaymentGateway implements PaymentGatewayPort {
  async createPayment(input: CreatePaymentInput): Promise<PaymentGatewayStatus> {
    return {
      status: 'pending',
      externalId: `mock_${input.orderId}`,
      raw: input,
    };
  }

  async getStatus(externalId: string): Promise<PaymentGatewayStatus> {
    return {
      status: 'approved',
      externalId,
    };
  }

  async cancel(externalId: string): Promise<PaymentGatewayStatus> {
    return {
      status: 'cancelled',
      externalId,
    };
  }

  async refund(externalId: string): Promise<PaymentGatewayStatus> {
    return {
      status: 'refunded',
      externalId,
    };
  }

  async webhook(payload: PaymentWebhookPayload): Promise<PaymentGatewayStatus> {
    return {
      status: 'approved',
      raw: payload,
    };
  }
}
