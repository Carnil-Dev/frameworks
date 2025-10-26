# @carnil/adapters

[![npm version](https://badge.fury.io/js/%40carnil%2Fadapters.svg)](https://badge.fury.io/js/%40carnil%2Fadapters)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Framework adapters for Carnil unified payments platform. This package provides adapters for popular Node.js frameworks including Express and Hono, making it easy to integrate Carnil into your existing applications.

## Features

- 🚀 **Express Adapter** - Full Express.js integration
- ⚡ **Hono Adapter** - High-performance Hono framework support
- 🔧 **Middleware Support** - Built-in middleware for common tasks
- 🔒 **Security** - Request validation and security features
- 📱 **TypeScript** - Full TypeScript support
- 🎯 **Easy Integration** - Simple setup and configuration

## Installation

```bash
npm install @carnil/adapters
```

## Quick Start

### Express.js Integration

```typescript
import express from 'express';
import { createExpressAdapter } from '@carnil/adapters';

const app = express();

// Create Carnil adapter
const carnilAdapter = createExpressAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  debug: process.env.NODE_ENV === 'development'
});

// Use the adapter
app.use('/api/carnil', carnilAdapter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Hono Integration

```typescript
import { Hono } from 'hono';
import { createHonoAdapter } from '@carnil/adapters';

const app = new Hono();

// Create Carnil adapter
const carnilAdapter = createHonoAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  debug: process.env.NODE_ENV === 'development'
});

// Use the adapter
app.route('/api/carnil', carnilAdapter);

export default app;
```

## API Reference

### createExpressAdapter

Creates an Express.js router with Carnil integration.

```typescript
function createExpressAdapter(config: AdapterConfig): express.Router;
```

### createHonoAdapter

Creates a Hono app with Carnil integration.

```typescript
function createHonoAdapter(config: AdapterConfig): Hono;
```

### createMiddleware

Creates middleware for request/response processing.

```typescript
function createMiddleware(config: MiddlewareConfig): express.RequestHandler | HonoMiddleware;
```

## Express.js Integration

### Basic Setup

```typescript
import express from 'express';
import { createExpressAdapter } from '@carnil/adapters';

const app = express();

// Create Carnil adapter
const carnilAdapter = createExpressAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  debug: process.env.NODE_ENV === 'development'
});

// Use the adapter
app.use('/api/carnil', carnilAdapter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### With Custom Middleware

```typescript
import express from 'express';
import { createExpressAdapter, createMiddleware } from '@carnil/adapters';

const app = express();

// Create custom middleware
const authMiddleware = createMiddleware({
  authentication: {
    enabled: true,
    verifyToken: async (token: string) => {
      // Verify JWT token
      return verifyJWT(token);
    }
  }
});

// Create Carnil adapter with middleware
const carnilAdapter = createExpressAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  middleware: [authMiddleware]
});

// Use the adapter
app.use('/api/carnil', carnilAdapter);
```

### Custom Routes

```typescript
import express from 'express';
import { createExpressAdapter } from '@carnil/adapters';

const app = express();

const carnilAdapter = createExpressAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  routes: {
    // Custom route handlers
    '/custom-payment': async (req, res) => {
      try {
        const { amount, currency } = req.body;
        
        // Create payment intent
        const paymentIntent = await carnil.createPaymentIntent({
          amount,
          currency
        });
        
        res.json({ success: true, data: paymentIntent });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }
});

app.use('/api/carnil', carnilAdapter);
```

## Hono Integration

### Basic Setup

```typescript
import { Hono } from 'hono';
import { createHonoAdapter } from '@carnil/adapters';

const app = new Hono();

// Create Carnil adapter
const carnilAdapter = createHonoAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  debug: process.env.NODE_ENV === 'development'
});

// Use the adapter
app.route('/api/carnil', carnilAdapter);

export default app;
```

### With Custom Middleware

```typescript
import { Hono } from 'hono';
import { createHonoAdapter, createMiddleware } from '@carnil/adapters';

const app = new Hono();

// Create custom middleware
const authMiddleware = createMiddleware({
  authentication: {
    enabled: true,
    verifyToken: async (token: string) => {
      // Verify JWT token
      return verifyJWT(token);
    }
  }
});

// Create Carnil adapter with middleware
const carnilAdapter = createHonoAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  middleware: [authMiddleware]
});

app.route('/api/carnil', carnilAdapter);
```

### Custom Routes

```typescript
import { Hono } from 'hono';
import { createHonoAdapter } from '@carnil/adapters';

const app = new Hono();

const carnilAdapter = createHonoAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  routes: {
    // Custom route handlers
    '/custom-payment': async (c) => {
      try {
        const { amount, currency } = await c.req.json();
        
        // Create payment intent
        const paymentIntent = await carnil.createPaymentIntent({
          amount,
          currency
        });
        
        return c.json({ success: true, data: paymentIntent });
      } catch (error) {
        return c.json({ success: false, error: error.message }, 500);
      }
    }
  }
});

app.route('/api/carnil', carnilAdapter);
```

## Middleware

### Authentication Middleware

```typescript
import { createMiddleware } from '@carnil/adapters';

const authMiddleware = createMiddleware({
  authentication: {
    enabled: true,
    verifyToken: async (token: string) => {
      // Verify JWT token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded;
      } catch (error) {
        throw new Error('Invalid token');
      }
    }
  }
});

// Use with Express
app.use('/api/carnil', authMiddleware);

// Use with Hono
app.use('/api/carnil/*', authMiddleware);
```

### Rate Limiting Middleware

```typescript
import { createMiddleware } from '@carnil/adapters';

const rateLimitMiddleware = createMiddleware({
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  }
});

// Use with Express
app.use('/api/carnil', rateLimitMiddleware);

// Use with Hono
app.use('/api/carnil/*', rateLimitMiddleware);
```

### Logging Middleware

```typescript
import { createMiddleware } from '@carnil/adapters';

const loggingMiddleware = createMiddleware({
  logging: {
    enabled: true,
    level: 'info',
    format: 'combined'
  }
});

// Use with Express
app.use('/api/carnil', loggingMiddleware);

// Use with Hono
app.use('/api/carnil/*', loggingMiddleware);
```

## Webhook Handling

### Express Webhook Handler

```typescript
import express from 'express';
import { createExpressAdapter } from '@carnil/adapters';

const app = express();

const carnilAdapter = createExpressAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  webhooks: {
    enabled: true,
    handlers: {
      'payment.succeeded': async (event) => {
        console.log('Payment succeeded:', event.data);
        // Handle payment success
      },
      'payment.failed': async (event) => {
        console.log('Payment failed:', event.data);
        // Handle payment failure
      }
    }
  }
});

app.use('/api/carnil', carnilAdapter);
```

### Hono Webhook Handler

```typescript
import { Hono } from 'hono';
import { createHonoAdapter } from '@carnil/adapters';

const app = new Hono();

const carnilAdapter = createHonoAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  webhooks: {
    enabled: true,
    handlers: {
      'payment.succeeded': async (event) => {
        console.log('Payment succeeded:', event.data);
        // Handle payment success
      },
      'payment.failed': async (event) => {
        console.log('Payment failed:', event.data);
        // Handle payment failure
      }
    }
  }
});

app.route('/api/carnil', carnilAdapter);
```

## Error Handling

### Express Error Handling

```typescript
import express from 'express';
import { createExpressAdapter } from '@carnil/adapters';

const app = express();

const carnilAdapter = createExpressAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  errorHandler: (error, req, res, next) => {
    console.error('Carnil error:', error);
    
    if (error.code === 'INVALID_REQUEST') {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    if (error.code === 'AUTHENTICATION_ERROR') {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api/carnil', carnilAdapter);
```

### Hono Error Handling

```typescript
import { Hono } from 'hono';
import { createHonoAdapter } from '@carnil/adapters';

const app = new Hono();

const carnilAdapter = createHonoAdapter({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  errorHandler: (error, c) => {
    console.error('Carnil error:', error);
    
    if (error.code === 'INVALID_REQUEST') {
      return c.json({ error: 'Invalid request' }, 400);
    }
    
    if (error.code === 'AUTHENTICATION_ERROR') {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.route('/api/carnil', carnilAdapter);
```

## Configuration

### Adapter Configuration

```typescript
interface AdapterConfig {
  provider: ProviderConfig;
  debug?: boolean;
  middleware?: Middleware[];
  routes?: Record<string, RouteHandler>;
  webhooks?: {
    enabled: boolean;
    handlers: Record<string, WebhookHandler>;
  };
  errorHandler?: ErrorHandler;
}
```

### Middleware Configuration

```typescript
interface MiddlewareConfig {
  authentication?: {
    enabled: boolean;
    verifyToken: (token: string) => Promise<any>;
  };
  rateLimit?: {
    enabled: boolean;
    windowMs: number;
    max: number;
    message?: string;
  };
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    format?: string;
  };
}
```

## Testing

### Express Testing

```typescript
import request from 'supertest';
import express from 'express';
import { createExpressAdapter } from '@carnil/adapters';

describe('Express Adapter', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    const carnilAdapter = createExpressAdapter({
      provider: {
        provider: 'stripe',
        apiKey: 'sk_test_...',
        webhookSecret: 'whsec_...'
      }
    });
    app.use('/api/carnil', carnilAdapter);
  });
  
  it('should create payment intent', async () => {
    const response = await request(app)
      .post('/api/carnil/payment-intents')
      .send({
        amount: 2000,
        currency: 'usd'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Hono Testing

```typescript
import { Hono } from 'hono';
import { createHonoAdapter } from '@carnil/adapters';

describe('Hono Adapter', () => {
  let app: Hono;
  
  beforeEach(() => {
    app = new Hono();
    const carnilAdapter = createHonoAdapter({
      provider: {
        provider: 'stripe',
        apiKey: 'sk_test_...',
        webhookSecret: 'whsec_...'
      }
    });
    app.route('/api/carnil', carnilAdapter);
  });
  
  it('should create payment intent', async () => {
    const response = await app.request('/api/carnil/payment-intents', {
      method: 'POST',
      body: JSON.stringify({
        amount: 2000,
        currency: 'usd'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Carnil-Dev/carnil-sdk/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [Carnil Team](https://carnil.dev)

## Support

- 📖 [Documentation](https://docs.carnil.dev)
- 💬 [Discord Community](https://discord.gg/carnil)
- 🐛 [Report Issues](https://github.com/Carnil-Dev/carnil-sdk/issues)
- 📧 [Email Support](mailto:hello@carnil.dev)
