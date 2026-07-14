export type PaymentWebhookPayload = Record<string, unknown>;

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentGatewayStatus {
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled';
  externalId?: string;
  raw?: unknown;
}

export interface PaymentGatewayPort {
  createPayment(input: CreatePaymentInput): Promise<PaymentGatewayStatus>;
  getStatus(externalId: string): Promise<PaymentGatewayStatus>;
  cancel(externalId: string): Promise<PaymentGatewayStatus>;
  refund(externalId: string): Promise<PaymentGatewayStatus>;
  webhook(payload: PaymentWebhookPayload): Promise<PaymentGatewayStatus>;
}
