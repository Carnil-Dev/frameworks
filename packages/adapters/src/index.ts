// ============================================================================
// Framework Adapters for Carnil Payments SDK
// ============================================================================

// Express adapter
export { 
  createCarnilExpressHandler, 
  createCarnilExpressWebhookHandler, 
  setupCarnilExpress 
} from './express';

export type { ExpressCarnilConfig } from './express';

// Hono adapter
export { 
  createCarnilHonoHandler, 
  createCarnilHonoWebhookHandler, 
  setupCarnilHono 
} from './hono';

export type { HonoCarnilConfig } from './hono';

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
