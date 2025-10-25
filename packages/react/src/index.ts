// ============================================================================
// React Integration for Carnil Payments SDK
// ============================================================================

// Provider and Context
export { CarnilProvider, useCarnilContext, useCarnil } from './context/carnil-provider';
export type { CarnilProviderProps } from './context/carnil-provider';

// Hooks
export { useCustomer, useCustomerList } from './hooks/use-customer';

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

// Hook types
export type { UseCustomerReturn } from './hooks/use-customer';
