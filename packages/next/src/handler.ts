import { NextRequest, NextResponse } from 'next/server';
import { Carnil, CarnilConfig } from '@carnil/core';

// ============================================================================
// Carnil Handler Configuration
// ============================================================================

export interface CarnilHandlerConfig {
  provider: CarnilConfig['provider'];
  identify: (req: NextRequest) => Promise<{ customerId: string; customerData?: any }>;
  corsHeaders?: Record<string, string>;
  debug?: boolean;
}

// ============================================================================
// Carnil Handler for Next.js App Router
// ============================================================================

export function createCarnilHandler(config: CarnilHandlerConfig) {
  const carnil = new Carnil({
    provider: config.provider,
    debug: config.debug,
  });

  return async function carnilHandler(req: NextRequest) {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...config.corsHeaders,
          },
        });
      }

      // Extract customer information
      const { customerId } = await config.identify(req);

      if (!customerId) {
        return NextResponse.json({ error: 'Customer ID is required' }, { status: 401 });
      }

      // Parse the request body
      const body = await req.json().catch(() => ({}));
      const { action, ...params } = body as any;

      // Route the request based on action
      let result: any;

      switch (action) {
        case 'createCustomer':
          result = await carnil.createCustomer(params);
          break;
        case 'getCustomer':
          result = await carnil.getCustomer(params.id);
          break;
        case 'updateCustomer':
          result = await carnil.updateCustomer(params.id, params.updates);
          break;
        case 'deleteCustomer':
          result = await carnil.deleteCustomer(params.id);
          break;
        case 'listCustomers':
          result = await carnil.listCustomers(params.request);
          break;
        case 'createPaymentIntent':
          result = await carnil.createPaymentIntent(params);
          break;
        case 'getPaymentIntent':
          result = await carnil.getPaymentIntent(params.id);
          break;
        case 'updatePaymentIntent':
          result = await carnil.updatePaymentIntent(params.id, params.updates);
          break;
        case 'cancelPaymentIntent':
          result = await carnil.cancelPaymentIntent(params.id);
          break;
        case 'confirmPaymentIntent':
          result = await carnil.confirmPaymentIntent(params.id, params.paymentMethodId);
          break;
        case 'capturePaymentIntent':
          result = await carnil.capturePaymentIntent(params.id, params.amount);
          break;
        case 'listPaymentIntents':
          result = await carnil.listPaymentIntents(params.request);
          break;
        case 'createSubscription':
          result = await carnil.createSubscription(params);
          break;
        case 'getSubscription':
          result = await carnil.getSubscription(params.id);
          break;
        case 'updateSubscription':
          result = await carnil.updateSubscription(params.id, params.updates);
          break;
        case 'cancelSubscription':
          result = await carnil.cancelSubscription(params.id);
          break;
        case 'listSubscriptions':
          result = await carnil.listSubscriptions(params);
          break;
        case 'createInvoice':
          result = await carnil.createInvoice(params);
          break;
        case 'getInvoice':
          result = await carnil.getInvoice(params.id);
          break;
        case 'updateInvoice':
          result = await carnil.updateInvoice(params.id, params.updates);
          break;
        case 'finalizeInvoice':
          result = await carnil.finalizeInvoice(params.id);
          break;
        case 'payInvoice':
          result = await carnil.payInvoice(params.id, params.paymentMethodId);
          break;
        case 'listInvoices':
          result = await carnil.listInvoices(params.request);
          break;
        case 'createRefund':
          result = await carnil.createRefund(params);
          break;
        case 'getRefund':
          result = await carnil.getRefund(params.id);
          break;
        case 'listRefunds':
          result = await carnil.listRefunds(params.paymentId);
          break;
        case 'trackUsage':
          result = await carnil.trackUsage(params);
          break;
        case 'trackAIUsage':
          result = await carnil.trackAIUsage(params);
          break;
        case 'getUsageMetrics':
          result = await carnil.getUsageMetrics(params.customerId, params.featureId, params.period);
          break;
        case 'getAIUsageMetrics':
          result = await carnil.getAIUsageMetrics(params.customerId, params.modelId, params.period);
          break;
        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }

      return NextResponse.json(result, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          ...config.corsHeaders,
        },
      });
    } catch (error) {
      console.error('Carnil handler error:', error);

      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Internal server error',
          success: false,
        },
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...config.corsHeaders,
          },
        }
      );
    }
  };
}

// ============================================================================
// Webhook Handler for Next.js App Router
// ============================================================================

export function createCarnilWebhookHandler(config: CarnilHandlerConfig) {
  const carnil = new Carnil({
    provider: config.provider,
    debug: config.debug,
  });

  return async function carnilWebhookHandler(req: NextRequest) {
    try {
      const body = await req.text();
      const signature =
        req.headers.get('stripe-signature') ||
        req.headers.get('razorpay-signature') ||
        req.headers.get('x-signature') ||
        '';

      const webhookSecret = config.provider.webhookSecret;
      if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
      }

      // Verify webhook signature
      const isValid = await carnil.verifyWebhook(body, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }

      // Parse webhook event
      const event = await carnil.parseWebhook(body, signature, webhookSecret);

      // Handle webhook event
      // This is where you would implement your webhook handling logic
      console.log('Webhook event received:', event);

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Carnil webhook handler error:', error);

      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}

// ============================================================================
// Server Actions for Next.js
// ============================================================================

export function createCarnilServerActions(config: CarnilHandlerConfig) {
  const carnil = new Carnil({
    provider: config.provider,
    debug: config.debug,
  });

  return {
    async createCustomer(params: any) {
      return await carnil.createCustomer(params);
    },

    async getCustomer(id: string) {
      return await carnil.getCustomer(id);
    },

    async updateCustomer(id: string, updates: any) {
      return await carnil.updateCustomer(id, updates);
    },

    async deleteCustomer(id: string) {
      return await carnil.deleteCustomer(id);
    },

    async listCustomers(request?: any) {
      return await carnil.listCustomers(request);
    },

    async createPaymentIntent(params: any) {
      return await carnil.createPaymentIntent(params);
    },

    async getPaymentIntent(id: string) {
      return await carnil.getPaymentIntent(id);
    },

    async updatePaymentIntent(id: string, updates: any) {
      return await carnil.updatePaymentIntent(id, updates);
    },

    async cancelPaymentIntent(id: string) {
      return await carnil.cancelPaymentIntent(id);
    },

    async confirmPaymentIntent(id: string, paymentMethodId?: string) {
      return await carnil.confirmPaymentIntent(id, paymentMethodId);
    },

    async capturePaymentIntent(id: string, amount?: number) {
      return await carnil.capturePaymentIntent(id, amount);
    },

    async listPaymentIntents(request?: any) {
      return await carnil.listPaymentIntents(request);
    },

    async createSubscription(params: any) {
      return await carnil.createSubscription(params);
    },

    async getSubscription(id: string) {
      return await carnil.getSubscription(id);
    },

    async updateSubscription(id: string, updates: any) {
      return await carnil.updateSubscription(id, updates);
    },

    async cancelSubscription(id: string) {
      return await carnil.cancelSubscription(id);
    },

    async listSubscriptions(request?: any) {
      return await carnil.listSubscriptions(request);
    },

    async createInvoice(params: any) {
      return await carnil.createInvoice(params);
    },

    async getInvoice(id: string) {
      return await carnil.getInvoice(id);
    },

    async updateInvoice(id: string, updates: any) {
      return await carnil.updateInvoice(id, updates);
    },

    async finalizeInvoice(id: string) {
      return await carnil.finalizeInvoice(id);
    },

    async payInvoice(id: string, paymentMethodId?: string) {
      return await carnil.payInvoice(id, paymentMethodId);
    },

    async listInvoices(request?: any) {
      return await carnil.listInvoices(request);
    },

    async createRefund(params: any) {
      return await carnil.createRefund(params);
    },

    async getRefund(id: string) {
      return await carnil.getRefund(id);
    },

    async listRefunds(paymentId?: string) {
      return await carnil.listRefunds(paymentId);
    },

    async trackUsage(metrics: any) {
      return await carnil.trackUsage(metrics);
    },

    async trackAIUsage(metrics: any) {
      return await carnil.trackAIUsage(metrics);
    },

    async getUsageMetrics(customerId: string, featureId: string, period: string) {
      return await carnil.getUsageMetrics(customerId, featureId, period);
    },

    async getAIUsageMetrics(customerId: string, modelId?: string, period?: string) {
      return await carnil.getAIUsageMetrics(customerId, modelId, period);
    },
  };
}
