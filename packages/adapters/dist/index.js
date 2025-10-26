'use strict';

var core = require('@carnil/core');

// src/express.ts
function createCarnilExpressHandler(config) {
  const carnil = new core.Carnil({
    provider: config.provider,
    debug: config.debug
  });
  return async function carnilExpressHandler(req, res, _next) {
    try {
      if (req.method === "OPTIONS") {
        res.status(200).json({});
        return;
      }
      const { customerId } = await config.identify(req);
      if (!customerId) {
        res.status(401).json({ error: "Customer ID is required" });
        return;
      }
      const { action, ...params } = req.body;
      let result;
      switch (action) {
        case "createCustomer":
          result = await carnil.createCustomer(params);
          break;
        case "getCustomer":
          result = await carnil.getCustomer(params.id);
          break;
        case "updateCustomer":
          result = await carnil.updateCustomer(params.id, params.updates);
          break;
        case "deleteCustomer":
          result = await carnil.deleteCustomer(params.id);
          break;
        case "listCustomers":
          result = await carnil.listCustomers(params.request);
          break;
        case "createPaymentIntent":
          result = await carnil.createPaymentIntent(params);
          break;
        case "getPaymentIntent":
          result = await carnil.getPaymentIntent(params.id);
          break;
        case "updatePaymentIntent":
          result = await carnil.updatePaymentIntent(params.id, params.updates);
          break;
        case "cancelPaymentIntent":
          result = await carnil.cancelPaymentIntent(params.id);
          break;
        case "confirmPaymentIntent":
          result = await carnil.confirmPaymentIntent(params.id, params.paymentMethodId);
          break;
        case "capturePaymentIntent":
          result = await carnil.capturePaymentIntent(params.id, params.amount);
          break;
        case "listPaymentIntents":
          result = await carnil.listPaymentIntents(params.request);
          break;
        case "createSubscription":
          result = await carnil.createSubscription(params);
          break;
        case "getSubscription":
          result = await carnil.getSubscription(params.id);
          break;
        case "updateSubscription":
          result = await carnil.updateSubscription(params.id, params.updates);
          break;
        case "cancelSubscription":
          result = await carnil.cancelSubscription(params.id);
          break;
        case "listSubscriptions":
          result = await carnil.listSubscriptions(params.request);
          break;
        case "createInvoice":
          result = await carnil.createInvoice(params);
          break;
        case "getInvoice":
          result = await carnil.getInvoice(params.id);
          break;
        case "updateInvoice":
          result = await carnil.updateInvoice(params.id, params.updates);
          break;
        case "finalizeInvoice":
          result = await carnil.finalizeInvoice(params.id);
          break;
        case "payInvoice":
          result = await carnil.payInvoice(params.id, params.paymentMethodId);
          break;
        case "listInvoices":
          result = await carnil.listInvoices(params.request);
          break;
        case "createRefund":
          result = await carnil.createRefund(params);
          break;
        case "getRefund":
          result = await carnil.getRefund(params.id);
          break;
        case "listRefunds":
          result = await carnil.listRefunds(params.paymentId);
          break;
        case "trackUsage":
          result = await carnil.trackUsage(params);
          break;
        case "trackAIUsage":
          result = await carnil.trackAIUsage(params);
          break;
        case "getUsageMetrics":
          result = await carnil.getUsageMetrics(params.customerId, params.featureId, params.period);
          break;
        case "getAIUsageMetrics":
          result = await carnil.getAIUsageMetrics(params.customerId, params.modelId, params.period);
          break;
        default:
          res.status(400).json({ error: `Unknown action: ${action}` });
          return;
      }
      res.json(result);
    } catch (error) {
      console.error("Carnil Express handler error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
        success: false
      });
    }
  };
}
function createCarnilExpressWebhookHandler(config) {
  const carnil = new core.Carnil({
    provider: config.provider,
    debug: config.debug
  });
  return async function carnilExpressWebhookHandler(req, res, _next) {
    try {
      const body = JSON.stringify(req.body);
      const signature = req.headers["stripe-signature"] || req.headers["razorpay-signature"] || req.headers["x-signature"] || "";
      const webhookSecret = config.provider.webhookSecret;
      if (!webhookSecret) {
        res.status(400).json({ error: "Webhook secret not configured" });
        return;
      }
      const isValid = await carnil.verifyWebhook(body, signature, webhookSecret);
      if (!isValid) {
        res.status(400).json({ error: "Invalid webhook signature" });
        return;
      }
      const event = await carnil.parseWebhook(body, signature, webhookSecret);
      console.log("Webhook event received:", event);
      res.json({ received: true });
    } catch (error) {
      console.error("Carnil Express webhook handler error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  };
}
function setupCarnilExpress(app, config) {
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (config.corsHeaders) {
      Object.entries(config.corsHeaders).forEach(([key, value]) => {
        res.header(key, value);
      });
    }
    next();
  });
  app.use("/api/carnil", createCarnilExpressHandler(config));
  app.use("/api/carnil/webhook", createCarnilExpressWebhookHandler(config));
}
function createCarnilHonoHandler(config) {
  const carnil = new core.Carnil({
    provider: config.provider,
    debug: config.debug
  });
  return async function carnilHonoHandler(c) {
    try {
      if (c.req.method === "OPTIONS") {
        return c.json({}, 200);
      }
      const { customerId } = await config.identify(c);
      if (!customerId) {
        return c.json({ error: "Customer ID is required" }, 401);
      }
      const body = await c.req.json().catch(() => ({}));
      const { action, ...params } = body;
      let result;
      switch (action) {
        case "createCustomer":
          result = await carnil.createCustomer(params);
          break;
        case "getCustomer":
          result = await carnil.getCustomer(params.id);
          break;
        case "updateCustomer":
          result = await carnil.updateCustomer(params.id, params.updates);
          break;
        case "deleteCustomer":
          result = await carnil.deleteCustomer(params.id);
          break;
        case "listCustomers":
          result = await carnil.listCustomers(params.request);
          break;
        case "createPaymentIntent":
          result = await carnil.createPaymentIntent(params);
          break;
        case "getPaymentIntent":
          result = await carnil.getPaymentIntent(params.id);
          break;
        case "updatePaymentIntent":
          result = await carnil.updatePaymentIntent(params.id, params.updates);
          break;
        case "cancelPaymentIntent":
          result = await carnil.cancelPaymentIntent(params.id);
          break;
        case "confirmPaymentIntent":
          result = await carnil.confirmPaymentIntent(params.id, params.paymentMethodId);
          break;
        case "capturePaymentIntent":
          result = await carnil.capturePaymentIntent(params.id, params.amount);
          break;
        case "listPaymentIntents":
          result = await carnil.listPaymentIntents(params.request);
          break;
        case "createSubscription":
          result = await carnil.createSubscription(params);
          break;
        case "getSubscription":
          result = await carnil.getSubscription(params.id);
          break;
        case "updateSubscription":
          result = await carnil.updateSubscription(params.id, params.updates);
          break;
        case "cancelSubscription":
          result = await carnil.cancelSubscription(params.id);
          break;
        case "listSubscriptions":
          result = await carnil.listSubscriptions(params.request);
          break;
        case "createInvoice":
          result = await carnil.createInvoice(params);
          break;
        case "getInvoice":
          result = await carnil.getInvoice(params.id);
          break;
        case "updateInvoice":
          result = await carnil.updateInvoice(params.id, params.updates);
          break;
        case "finalizeInvoice":
          result = await carnil.finalizeInvoice(params.id);
          break;
        case "payInvoice":
          result = await carnil.payInvoice(params.id, params.paymentMethodId);
          break;
        case "listInvoices":
          result = await carnil.listInvoices(params.request);
          break;
        case "createRefund":
          result = await carnil.createRefund(params);
          break;
        case "getRefund":
          result = await carnil.getRefund(params.id);
          break;
        case "listRefunds":
          result = await carnil.listRefunds(params.paymentId);
          break;
        case "trackUsage":
          result = await carnil.trackUsage(params);
          break;
        case "trackAIUsage":
          result = await carnil.trackAIUsage(params);
          break;
        case "getUsageMetrics":
          result = await carnil.getUsageMetrics(params.customerId, params.featureId, params.period);
          break;
        case "getAIUsageMetrics":
          result = await carnil.getAIUsageMetrics(params.customerId, params.modelId, params.period);
          break;
        default:
          return c.json({ error: `Unknown action: ${action}` }, 400);
      }
      return c.json(result);
    } catch (error) {
      console.error("Carnil Hono handler error:", error);
      return c.json(
        {
          error: error instanceof Error ? error.message : "Internal server error",
          success: false
        },
        500
      );
    }
  };
}
function createCarnilHonoWebhookHandler(config) {
  const carnil = new core.Carnil({
    provider: config.provider,
    debug: config.debug
  });
  return async function carnilHonoWebhookHandler(c) {
    try {
      const body = await c.req.text();
      const signature = c.req.header("stripe-signature") || c.req.header("razorpay-signature") || c.req.header("x-signature") || "";
      const webhookSecret = config.provider.webhookSecret;
      if (!webhookSecret) {
        return c.json({ error: "Webhook secret not configured" }, 400);
      }
      const isValid = await carnil.verifyWebhook(body, signature, webhookSecret);
      if (!isValid) {
        return c.json({ error: "Invalid webhook signature" }, 400);
      }
      const event = await carnil.parseWebhook(body, signature, webhookSecret);
      console.log("Webhook event received:", event);
      return c.json({ received: true });
    } catch (error) {
      console.error("Carnil Hono webhook handler error:", error);
      return c.json(
        {
          error: error instanceof Error ? error.message : "Internal server error"
        },
        500
      );
    }
  };
}
function setupCarnilHono(app, config) {
  app.use("*", async (c, next) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (config.corsHeaders) {
      Object.entries(config.corsHeaders).forEach(([key, value]) => {
        c.header(key, value);
      });
    }
    await next();
  });
  app.post("/api/carnil", createCarnilHonoHandler(config));
  app.post("/api/carnil/webhook", createCarnilHonoWebhookHandler(config));
}

exports.createCarnilExpressHandler = createCarnilExpressHandler;
exports.createCarnilExpressWebhookHandler = createCarnilExpressWebhookHandler;
exports.createCarnilHonoHandler = createCarnilHonoHandler;
exports.createCarnilHonoWebhookHandler = createCarnilHonoWebhookHandler;
exports.setupCarnilExpress = setupCarnilExpress;
exports.setupCarnilHono = setupCarnilHono;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map