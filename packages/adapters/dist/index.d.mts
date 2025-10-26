import { Request, Response as Response$1, NextFunction } from 'express';
import { CarnilConfig } from '@carnil/core';
export { AIUsageMetrics, CarnilConfig, CarnilResponse, CreateCustomerRequest, CreateInvoiceRequest, CreatePaymentIntentRequest, CreateRefundRequest, CreateSubscriptionRequest, Customer, CustomerListRequest, Dispute, Invoice, InvoiceListRequest, ListResponse, PaymentIntent, PaymentIntentListRequest, PaymentMethod, Refund, Subscription, SubscriptionListRequest, UpdateCustomerRequest, UsageMetrics, WebhookEvent } from '@carnil/core';
import * as hono from 'hono';
import { Context, Hono } from 'hono';

interface ExpressCarnilConfig {
    provider: CarnilConfig['provider'];
    identify: (req: Request) => Promise<{
        customerId: string;
        customerData?: any;
    }>;
    corsHeaders?: Record<string, string>;
    debug?: boolean;
}
declare function createCarnilExpressHandler(config: ExpressCarnilConfig): (req: Request, res: Response$1, _next: NextFunction) => Promise<void>;
declare function createCarnilExpressWebhookHandler(config: ExpressCarnilConfig): (req: Request, res: Response$1, _next: NextFunction) => Promise<void>;
declare function setupCarnilExpress(app: any, config: ExpressCarnilConfig): void;

interface HonoCarnilConfig {
    provider: CarnilConfig['provider'];
    identify: (c: Context) => Promise<{
        customerId: string;
        customerData?: any;
    }>;
    corsHeaders?: Record<string, string>;
    debug?: boolean;
}
declare function createCarnilHonoHandler(config: HonoCarnilConfig): (c: Context) => Promise<Response & hono.TypedResponse<{}>>;
declare function createCarnilHonoWebhookHandler(config: HonoCarnilConfig): (c: Context) => Promise<(Response & hono.TypedResponse<{
    error: string;
}>) | (Response & hono.TypedResponse<{
    received: boolean;
}>)>;
declare function setupCarnilHono(app: Hono, config: HonoCarnilConfig): void;

export { type ExpressCarnilConfig, type HonoCarnilConfig, createCarnilExpressHandler, createCarnilExpressWebhookHandler, createCarnilHonoHandler, createCarnilHonoWebhookHandler, setupCarnilExpress, setupCarnilHono };
