// ============================================================================
// Next.js Integration for Carnil Payments SDK
// ============================================================================

export { 
  createCarnilHandler, 
  createCarnilWebhookHandler, 
  createCarnilServerActions 
} from './handler';

export type { CarnilHandlerConfig } from './handler';

// Re-export core types for convenience
export type {
  Customer,
  PaymentMethod,
  PaymentIntent,
  Subscription,
  Invoice,
  Refund,
  Dispute,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreatePaymentIntentRequest,
  CreateSubscriptionRequest,
  CreateInvoiceRequest,
  CreateRefundRequest,
  CustomerListRequest,
  PaymentIntentListRequest,
  SubscriptionListRequest,
  InvoiceListRequest,
  ListResponse,
  WebhookEvent,
  UsageMetrics,
  AIUsageMetrics,
  CarnilConfig,
  CarnilResponse,
} from '@carnil/core';
