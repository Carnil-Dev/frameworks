# @carnil/next

[![npm version](https://badge.fury.io/js/%40carnil%2Fnext.svg)](https://badge.fury.io/js/%40carnil%2Fnext)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Next.js integration for Carnil unified payments platform. This package provides Next.js-specific utilities including API route handlers, middleware, and server-side components for building payment applications.

## Features

- 🚀 **API Routes** - Pre-built API route handlers for payments
- 🔄 **Middleware** - Request/response middleware for webhooks
- ⚡ **Server Components** - Server-side payment components
- 🔒 **Security** - Built-in security features for Next.js
- 📱 **App Router** - Full support for Next.js App Router
- 🎯 **TypeScript** - Full TypeScript support
- 🔧 **Easy Integration** - Simple setup and configuration

## Installation

```bash
npm install @carnil/next
```

## Peer Dependencies

```bash
npm install next@^14.0.0 || next@^15.0.0
```

## Quick Start

### App Router Setup

```typescript
// app/api/carnil/route.ts
import { createCarnilHandler } from '@carnil/next';

export const POST = createCarnilHandler({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  debug: process.env.NODE_ENV === 'development'
});
```

### Pages Router Setup

```typescript
// pages/api/carnil.ts
import { createCarnilHandler } from '@carnil/next';

export default createCarnilHandler({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  debug: process.env.NODE_ENV === 'development'
});
```

## API Reference

### createCarnilHandler

Creates a Next.js API route handler for Carnil operations.

```typescript
function createCarnilHandler(config: CarnilConfig): NextApiHandler;
```

### createWebhookHandler

Creates a Next.js API route handler specifically for webhooks.

```typescript
function createWebhookHandler(config: WebhookConfig): NextApiHandler;
```

### createMiddleware

Creates Next.js middleware for request/response processing.

```typescript
function createMiddleware(config: MiddlewareConfig): NextMiddleware;
```

## API Routes

### Payment Operations

```typescript
// app/api/payments/route.ts
import { createCarnilHandler } from '@carnil/next';

export const POST = createCarnilHandler({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  }
});

// Usage:
// POST /api/payments
// Body: { action: 'createPaymentIntent', data: { amount: 2000, currency: 'usd' } }
```

### Customer Operations

```typescript
// app/api/customers/route.ts
import { createCarnilHandler } from '@carnil/next';

export const POST = createCarnilHandler({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  }
});

// Usage:
// POST /api/customers
// Body: { action: 'createCustomer', data: { email: 'customer@example.com' } }
```

### Subscription Operations

```typescript
// app/api/subscriptions/route.ts
import { createCarnilHandler } from '@carnil/next';

export const POST = createCarnilHandler({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  }
});

// Usage:
// POST /api/subscriptions
// Body: { action: 'createSubscription', data: { customerId: 'cus_123', priceId: 'price_123' } }
```

## Webhook Handling

### Webhook Endpoint

```typescript
// app/api/webhooks/route.ts
import { createWebhookHandler } from '@carnil/next';

export const POST = createWebhookHandler({
  webhookSecret: process.env.WEBHOOK_SECRET!,
  handlers: {
    'payment.succeeded': async (event) => {
      console.log('Payment succeeded:', event.data);
      // Handle payment success
    },
    'payment.failed': async (event) => {
      console.log('Payment failed:', event.data);
      // Handle payment failure
    },
    'subscription.created': async (event) => {
      console.log('Subscription created:', event.data);
      // Handle subscription creation
    }
  }
});
```

### Webhook with Database

```typescript
// app/api/webhooks/route.ts
import { createWebhookHandler } from '@carnil/next';
import { db } from '@/lib/db';

export const POST = createWebhookHandler({
  webhookSecret: process.env.WEBHOOK_SECRET!,
  handlers: {
    'payment.succeeded': async (event) => {
      const { paymentId, customerId, amount } = event.data;
      
      // Update database
      await db.payment.update({
        where: { id: paymentId },
        data: { status: 'succeeded' }
      });
      
      // Send confirmation email
      await sendConfirmationEmail(customerId, amount);
    },
    'subscription.created': async (event) => {
      const { subscriptionId, customerId, planId } = event.data;
      
      // Create subscription record
      await db.subscription.create({
        data: {
          id: subscriptionId,
          customerId,
          planId,
          status: 'active'
        }
      });
    }
  }
});
```

## Middleware

### Request Logging

```typescript
// middleware.ts
import { createMiddleware } from '@carnil/next';

export default createMiddleware({
  logging: {
    enabled: true,
    level: 'info'
  },
  security: {
    enableCORS: true,
    enableRateLimit: true,
    rateLimitOptions: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
});

export const config = {
  matcher: '/api/:path*'
};
```

### Authentication Middleware

```typescript
// middleware.ts
import { createMiddleware } from '@carnil/next';
import { NextRequest } from 'next/server';

export default createMiddleware({
  authentication: {
    enabled: true,
    verifyToken: async (token: string) => {
      // Verify JWT token
      return verifyJWT(token);
    }
  },
  authorization: {
    enabled: true,
    checkPermission: async (user: any, resource: string, action: string) => {
      // Check user permissions
      return checkPermission(user, resource, action);
    }
  }
});

export const config = {
  matcher: '/api/:path*'
};
```

## Server Components

### Payment Form Component

```tsx
// app/components/PaymentForm.tsx
import { createServerComponent } from '@carnil/next';

export const PaymentForm = createServerComponent({
  name: 'PaymentForm',
  serverAction: async (formData: FormData) => {
    'use server';
    
    const amount = formData.get('amount') as string;
    const currency = formData.get('currency') as string;
    
    // Create payment intent
    const paymentIntent = await carnil.createPaymentIntent({
      amount: parseInt(amount),
      currency: currency
    });
    
    return paymentIntent;
  }
});

// Usage in page
export default function CheckoutPage() {
  return (
    <div>
      <h1>Checkout</h1>
      <PaymentForm />
    </div>
  );
}
```

### Customer Dashboard Component

```tsx
// app/components/CustomerDashboard.tsx
import { createServerComponent } from '@carnil/next';

export const CustomerDashboard = createServerComponent({
  name: 'CustomerDashboard',
  serverAction: async (customerId: string) => {
    'use server';
    
    // Fetch customer data
    const customer = await carnil.getCustomer(customerId);
    const paymentMethods = await carnil.listPaymentMethods(customerId);
    const subscriptions = await carnil.listSubscriptions({ customerId });
    
    return {
      customer,
      paymentMethods,
      subscriptions
    };
  }
});

// Usage in page
export default function CustomerPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Customer Dashboard</h1>
      <CustomerDashboard customerId={params.id} />
    </div>
  );
}
```

## Client Components

### Payment Button Component

```tsx
// app/components/PaymentButton.tsx
'use client';

import { useState } from 'react';
import { createClientComponent } from '@carnil/next';

export const PaymentButton = createClientComponent({
  name: 'PaymentButton',
  clientAction: async (amount: number, currency: string) => {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'createPaymentIntent',
        data: { amount, currency }
      })
    });
    
    const result = await response.json();
    return result;
  }
});

// Usage
export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  
  const handlePayment = async () => {
    setLoading(true);
    try {
      const result = await PaymentButton.clientAction(2000, 'usd');
      console.log('Payment created:', result);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay $20.00'}
    </button>
  );
}
```

## Configuration

### Environment Variables

```bash
# Carnil Configuration
CARNIL_PROVIDER=stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Next.js Configuration
NEXT_PUBLIC_CARNIL_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CARNIL_ENVIRONMENT=test
```

### Next.js Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  env: {
    CARNIL_PROVIDER: process.env.CARNIL_PROVIDER,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
  }
};

module.exports = nextConfig;
```

## Error Handling

### API Route Error Handling

```typescript
// app/api/payments/route.ts
import { createCarnilHandler } from '@carnil/next';
import { NextRequest, NextResponse } from 'next/server';

export const POST = createCarnilHandler({
  provider: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSecret: process.env.WEBHOOK_SECRET!
  },
  errorHandler: (error, req) => {
    console.error('Payment API error:', error);
    
    if (error.code === 'INVALID_REQUEST') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
    
    if (error.code === 'AUTHENTICATION_ERROR') {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
```

### Webhook Error Handling

```typescript
// app/api/webhooks/route.ts
import { createWebhookHandler } from '@carnil/next';

export const POST = createWebhookHandler({
  webhookSecret: process.env.WEBHOOK_SECRET!,
  handlers: {
    'payment.succeeded': async (event) => {
      try {
        // Handle payment success
        await handlePaymentSuccess(event.data);
      } catch (error) {
        console.error('Failed to handle payment success:', error);
        throw error; // Re-throw to trigger retry
      }
    }
  },
  errorHandler: (error, event) => {
    console.error('Webhook error:', error);
    
    // Log error for debugging
    console.error('Event data:', event.data);
    
    // Return appropriate status code
    if (error.code === 'INVALID_SIGNATURE') {
      return { status: 401, message: 'Invalid signature' };
    }
    
    return { status: 500, message: 'Internal server error' };
  }
});
```

## Testing

### API Route Testing

```typescript
// __tests__/api/payments.test.ts
import { POST } from '@/app/api/payments/route';
import { NextRequest } from 'next/server';

describe('/api/payments', () => {
  it('should create payment intent', async () => {
    const request = new NextRequest('http://localhost:3000/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        action: 'createPaymentIntent',
        data: { amount: 2000, currency: 'usd' }
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
  });
});
```

### Webhook Testing

```typescript
// __tests__/api/webhooks.test.ts
import { POST } from '@/app/api/webhooks/route';
import { NextRequest } from 'next/server';

describe('/api/webhooks', () => {
  it('should handle payment succeeded webhook', async () => {
    const payload = JSON.stringify({
      type: 'payment.succeeded',
      data: { paymentId: 'pi_123', amount: 2000 }
    });
    
    const signature = generateWebhookSignature(payload, process.env.WEBHOOK_SECRET!);
    
    const request = new NextRequest('http://localhost:3000/api/webhooks', {
      method: 'POST',
      headers: {
        'x-webhook-signature': signature
      },
      body: payload
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## Deployment

### Vercel Deployment

```json
// vercel.json
{
  "env": {
    "STRIPE_API_KEY": "@stripe-api-key",
    "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret"
  },
  "functions": {
    "app/api/payments/route.ts": {
      "maxDuration": 30
    },
    "app/api/webhooks/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
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
