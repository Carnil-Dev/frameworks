import { Request, Response, NextFunction } from 'express';
import { Carnil, CarnilConfig } from '@carnil/core';

// ============================================================================
// Express Adapter Configuration
// ============================================================================

export interface ExpressCarnilConfig {
  provider: CarnilConfig['provider'];
  identify: (req: Request) => Promise<{ customerId: string; customerData?: any }>;
  corsHeaders?: Record<string, string>;
  debug?: boolean;
}

// ============================================================================
// Express Middleware for Carnil
// ============================================================================

export function createCarnilExpressHandler(config: ExpressCarnilConfig) {
  const carnil = new Carnil({
    provider: config.provider,
    debug: config.debug,
  });

  return async function carnilExpressHandler(req: Request, res: Response, _next: NextFunction) {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return;
      }

      // Extract customer information
      const { customerId } = await config.identify(req);

      if (!customerId) {
        res.status(401).json({ error: 'Customer ID is required' });
        return;
      }

      // Parse the request body
      const { action, ...params } = req.body;

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
          res.status(400).json({ error: `Unknown action: ${action}` });
          return;
      }

      res.json(result);
    } catch (error) {
      console.error('Carnil Express handler error:', error);

      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
      });
    }
  };
}

// ============================================================================
// Express Webhook Handler
// ============================================================================

export function createCarnilExpressWebhookHandler(config: ExpressCarnilConfig) {
  const carnil = new Carnil({
    provider: config.provider,
    debug: config.debug,
  });

  return async function carnilExpressWebhookHandler(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const body = JSON.stringify(req.body);
      const signature =
        (req.headers['stripe-signature'] as string) ||
        (req.headers['razorpay-signature'] as string) ||
        (req.headers['x-signature'] as string) ||
        '';

      const webhookSecret = config.provider.webhookSecret;
      if (!webhookSecret) {
        res.status(400).json({ error: 'Webhook secret not configured' });
        return;
      }

      // Verify webhook signature
      const isValid = await carnil.verifyWebhook(body, signature, webhookSecret);
      if (!isValid) {
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }

      // Parse webhook event
      const event = await carnil.parseWebhook(body, signature, webhookSecret);

      // Handle webhook event
      // This is where you would implement your webhook handling logic
      console.log('Webhook event received:', event);

      res.json({ received: true });
    } catch (error) {
      console.error('Carnil Express webhook handler error:', error);

      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };
}

// ============================================================================
// Express Middleware Setup
// ============================================================================

export function setupCarnilExpress(app: any, config: ExpressCarnilConfig) {
  // Add CORS headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (config.corsHeaders) {
      Object.entries(config.corsHeaders).forEach(([key, value]) => {
        res.header(key, value);
      });
    }

    next();
  });

  // Mount Carnil handler
  app.use('/api/carnil', createCarnilExpressHandler(config));

  // Mount webhook handler
  app.use('/api/carnil/webhook', createCarnilExpressWebhookHandler(config));
}
