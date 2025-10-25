import { Context, Hono } from 'hono';
import { Carnil, CarnilConfig } from '@carnil/core';

// ============================================================================
// Hono Adapter Configuration
// ============================================================================

export interface HonoCarnilConfig {
  provider: CarnilConfig['provider'];
  identify: (c: Context) => Promise<{ customerId: string; customerData?: any }>;
  corsHeaders?: Record<string, string>;
  debug?: boolean;
}

// ============================================================================
// Hono Middleware for Carnil
// ============================================================================

export function createCarnilHonoHandler(config: HonoCarnilConfig) {
  const carnil = new Carnil({
    provider: config.provider,
    debug: config.debug,
  });

  return async function carnilHonoHandler(c: Context) {
    try {
      // Handle CORS preflight
      if (c.req.method === 'OPTIONS') {
        return c.json({}, 200);
      }

      // Extract customer information
      const { customerId, customerData } = await config.identify(c);
      
      if (!customerId) {
        return c.json({ error: 'Customer ID is required' }, 401);
      }

      // Parse the request body
      const body = await c.req.json().catch(() => ({}));
      const { action, ...params } = body;

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
          result = await carnil.cancelSubscription(params.id, params.immediately);
          break;
        case 'listSubscriptions':
          result = await carnil.listSubscriptions(params.request);
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
          return c.json({ error: `Unknown action: ${action}` }, 400);
      }

      return c.json(result);

    } catch (error) {
      console.error('Carnil Hono handler error:', error);
      
      return c.json({
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      }, 500);
    }
  };
}

// ============================================================================
// Hono Webhook Handler
// ============================================================================

export function createCarnilHonoWebhookHandler(config: HonoCarnilConfig) {
  const carnil = new Carnil({
    provider: config.provider,
    debug: config.debug,
  });

  return async function carnilHonoWebhookHandler(c: Context) {
    try {
      const body = await c.req.text();
      const signature = c.req.header('stripe-signature') || 
                      c.req.header('razorpay-signature') || 
                      c.req.header('x-signature') || 
                      '';

      const webhookSecret = config.provider.webhookSecret;
      if (!webhookSecret) {
        return c.json({ error: 'Webhook secret not configured' }, 400);
      }

      // Verify webhook signature
      const isValid = await carnil.verifyWebhook(body, signature, webhookSecret);
      if (!isValid) {
        return c.json({ error: 'Invalid webhook signature' }, 400);
      }

      // Parse webhook event
      const event = await carnil.parseWebhook(body, signature, webhookSecret);

      // Handle webhook event
      // This is where you would implement your webhook handling logic
      console.log('Webhook event received:', event);

      return c.json({ received: true });

    } catch (error) {
      console.error('Carnil Hono webhook handler error:', error);
      
      return c.json({
        error: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  };
}

// ============================================================================
// Hono App Setup
// ============================================================================

export function setupCarnilHono(app: Hono, config: HonoCarnilConfig) {
  // Add CORS middleware
  app.use('*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (config.corsHeaders) {
      Object.entries(config.corsHeaders).forEach(([key, value]) => {
        c.header(key, value);
      });
    }
    
    await next();
  });

  // Mount Carnil handler
  app.post('/api/carnil', createCarnilHonoHandler(config));
  
  // Mount webhook handler
  app.post('/api/carnil/webhook', createCarnilHonoWebhookHandler(config));
}
