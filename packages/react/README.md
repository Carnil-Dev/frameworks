# @carnil/react

[![npm version](https://badge.fury.io/js/%40carnil%2Freact.svg)](https://badge.fury.io/js/%40carnil%2Freact)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React components and hooks for Carnil unified payments platform. This package provides React-specific integrations including context providers, hooks, and UI components for building payment applications.

## Features

- ⚛️ **React Context** - Carnil provider for React applications
- 🎣 **Custom Hooks** - Easy-to-use hooks for payment operations
- 🎨 **UI Components** - Pre-built React components
- 🔄 **State Management** - Built-in state management for payments
- 📱 **Responsive Design** - Mobile-friendly components
- 🎯 **TypeScript Support** - Full TypeScript support
- 🚀 **Performance Optimized** - Optimized for React performance

## Installation

```bash
npm install @carnil/react
```

## Peer Dependencies

```bash
npm install react react-dom
```

## Quick Start

```tsx
import React from "react";
import { CarnilProvider, useCustomer } from "@carnil/react";

function App() {
  return (
    <CarnilProvider
      config={{
        provider: {
          provider: "stripe",
          apiKey: "sk_test_...",
          webhookSecret: "whsec_...",
        },
        debug: true,
      }}
    >
      <PaymentPage />
    </CarnilProvider>
  );
}

function PaymentPage() {
  const { customer, loading, error } = useCustomer("cus_123");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome, {customer?.name || customer?.email}</h1>
      {/* Your payment UI */}
    </div>
  );
}
```

## API Reference

### CarnilProvider Component

```tsx
interface CarnilProviderProps {
  config: CarnilConfig;
  children: React.ReactNode;
}
```

### useCustomer Hook

```tsx
function useCustomer(customerId: string): {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};
```

### usePaymentIntent Hook

```tsx
function usePaymentIntent(paymentIntentId: string): {
  paymentIntent: PaymentIntent | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  confirm: (paymentMethodId?: string) => Promise<void>;
  cancel: () => Promise<void>;
};
```

### useSubscription Hook

```tsx
function useSubscription(subscriptionId: string): {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (updates: Partial<CreateSubscriptionRequest>) => Promise<void>;
  cancel: () => Promise<void>;
};
```

### usePaymentMethods Hook

```tsx
function usePaymentMethods(customerId: string): {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  attach: (paymentMethodId: string) => Promise<void>;
  detach: (paymentMethodId: string) => Promise<void>;
  setDefault: (paymentMethodId: string) => Promise<void>;
};
```

## Components

### CarnilProvider

The main provider component that wraps your React application.

```tsx
import { CarnilProvider } from "@carnil/react";

function App() {
  return (
    <CarnilProvider
      config={{
        provider: {
          provider: "stripe",
          apiKey: process.env.REACT_APP_STRIPE_API_KEY!,
          webhookSecret: process.env.REACT_APP_WEBHOOK_SECRET!,
        },
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <YourApp />
    </CarnilProvider>
  );
}
```

### CustomerProvider

A specialized provider for customer-related operations.

```tsx
import { CustomerProvider } from "@carnil/react";

function CustomerDashboard({ customerId }: { customerId: string }) {
  return (
    <CustomerProvider customerId={customerId}>
      <CustomerInfo />
      <PaymentMethods />
      <Subscriptions />
    </CustomerProvider>
  );
}
```

## Hooks

### useCustomer

Hook for managing customer data and operations.

```tsx
import { useCustomer } from "@carnil/react";

function CustomerProfile({ customerId }: { customerId: string }) {
  const { customer, loading, error, refetch } = useCustomer(customerId);

  if (loading) return <div>Loading customer...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div>
      <h2>{customer.name || customer.email}</h2>
      <p>Customer ID: {customer.id}</p>
      <p>Created: {customer.createdAt.toLocaleDateString()}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### usePaymentIntent

Hook for managing payment intents.

```tsx
import { usePaymentIntent } from "@carnil/react";

function PaymentIntentDetails({
  paymentIntentId,
}: {
  paymentIntentId: string;
}) {
  const { paymentIntent, loading, error, refetch, confirm, cancel } =
    usePaymentIntent(paymentIntentId);

  if (loading) return <div>Loading payment...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!paymentIntent) return <div>Payment not found</div>;

  const handleConfirm = async () => {
    try {
      await confirm();
      console.log("Payment confirmed");
    } catch (error) {
      console.error("Failed to confirm payment:", error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancel();
      console.log("Payment cancelled");
    } catch (error) {
      console.error("Failed to cancel payment:", error);
    }
  };

  return (
    <div>
      <h3>Payment Intent</h3>
      <p>Amount: ${(paymentIntent.amount / 100).toFixed(2)}</p>
      <p>Currency: {paymentIntent.currency.toUpperCase()}</p>
      <p>Status: {paymentIntent.status}</p>

      {paymentIntent.status === "requires_confirmation" && (
        <button onClick={handleConfirm}>Confirm Payment</button>
      )}

      {paymentIntent.status === "requires_payment_method" && (
        <button onClick={handleCancel}>Cancel Payment</button>
      )}

      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useSubscription

Hook for managing subscriptions.

```tsx
import { useSubscription } from "@carnil/react";

function SubscriptionDetails({ subscriptionId }: { subscriptionId: string }) {
  const { subscription, loading, error, refetch, update, cancel } =
    useSubscription(subscriptionId);

  if (loading) return <div>Loading subscription...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!subscription) return <div>Subscription not found</div>;

  const handleUpdate = async () => {
    try {
      await update({
        // Update subscription properties
      });
      console.log("Subscription updated");
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancel();
      console.log("Subscription cancelled");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
  };

  return (
    <div>
      <h3>Subscription</h3>
      <p>Status: {subscription.status}</p>
      <p>
        Current Period: {subscription.currentPeriodStart.toLocaleDateString()} -{" "}
        {subscription.currentPeriodEnd.toLocaleDateString()}
      </p>

      {subscription.status === "active" && (
        <>
          <button onClick={handleUpdate}>Update Subscription</button>
          <button onClick={handleCancel}>Cancel Subscription</button>
        </>
      )}

      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### usePaymentMethods

Hook for managing payment methods.

```tsx
import { usePaymentMethods } from "@carnil/react";

function PaymentMethodsList({ customerId }: { customerId: string }) {
  const {
    paymentMethods,
    loading,
    error,
    refetch,
    attach,
    detach,
    setDefault,
  } = usePaymentMethods(customerId);

  if (loading) return <div>Loading payment methods...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDetach = async (paymentMethodId: string) => {
    try {
      await detach(paymentMethodId);
      console.log("Payment method detached");
    } catch (error) {
      console.error("Failed to detach payment method:", error);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefault(paymentMethodId);
      console.log("Default payment method set");
    } catch (error) {
      console.error("Failed to set default payment method:", error);
    }
  };

  return (
    <div>
      <h3>Payment Methods</h3>
      {paymentMethods.length === 0 ? (
        <p>No payment methods found</p>
      ) : (
        <ul>
          {paymentMethods.map((method) => (
            <li key={method.id}>
              <div>
                <p>Type: {method.type}</p>
                {method.card && <p>Card: **** **** **** {method.card.last4}</p>}
                <p>Default: {method.isDefault ? "Yes" : "No"}</p>
                <p>Created: {method.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                {!method.isDefault && (
                  <button onClick={() => handleSetDefault(method.id)}>
                    Set as Default
                  </button>
                )}
                <button onClick={() => handleDetach(method.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## Advanced Usage

### Custom Hooks

You can create custom hooks that combine multiple Carnil hooks:

```tsx
import { useCustomer, usePaymentMethods, useSubscription } from "@carnil/react";

function useCustomerDashboard(customerId: string) {
  const customer = useCustomer(customerId);
  const paymentMethods = usePaymentMethods(customerId);
  const subscriptions = useSubscription(customerId);

  return {
    customer: customer.customer,
    paymentMethods: paymentMethods.paymentMethods,
    subscriptions: subscriptions.subscription,
    loading:
      customer.loading || paymentMethods.loading || subscriptions.loading,
    error: customer.error || paymentMethods.error || subscriptions.error,
    refetch: () => {
      customer.refetch();
      paymentMethods.refetch();
      subscriptions.refetch();
    },
  };
}

function CustomerDashboard({ customerId }: { customerId: string }) {
  const dashboard = useCustomerDashboard(customerId);

  if (dashboard.loading) return <div>Loading dashboard...</div>;
  if (dashboard.error) return <div>Error: {dashboard.error}</div>;

  return (
    <div>
      <h1>Customer Dashboard</h1>
      <CustomerInfo customer={dashboard.customer} />
      <PaymentMethodsList paymentMethods={dashboard.paymentMethods} />
      <SubscriptionDetails subscription={dashboard.subscriptions} />
    </div>
  );
}
```

### Error Handling

```tsx
import { useCustomer } from "@carnil/react";
import { CarnilError } from "@carnil/core";

function CustomerProfile({ customerId }: { customerId: string }) {
  const { customer, loading, error, refetch } = useCustomer(customerId);

  if (loading) return <div>Loading...</div>;

  if (error) {
    // Handle different types of errors
    if (error.includes("not found")) {
      return <div>Customer not found</div>;
    }
    if (error.includes("unauthorized")) {
      return <div>Unauthorized access</div>;
    }
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>{customer?.name || customer?.email}</h2>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Loading States

```tsx
import { useCustomer } from "@carnil/react";

function CustomerProfile({ customerId }: { customerId: string }) {
  const { customer, loading, error, refetch } = useCustomer(customerId);

  return (
    <div>
      {loading && <div>Loading customer data...</div>}

      {!loading && error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={refetch}>Try Again</button>
        </div>
      )}

      {!loading && !error && customer && (
        <div>
          <h2>{customer.name || customer.email}</h2>
          <p>Customer ID: {customer.id}</p>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  );
}
```

## Context Usage

### Accessing Carnil Instance

```tsx
import { useContext } from "react";
import { CarnilContext } from "@carnil/react";

function CustomComponent() {
  const carnil = useContext(CarnilContext);

  if (!carnil) {
    throw new Error("useCarnil must be used within a CarnilProvider");
  }

  const handleCustomOperation = async () => {
    try {
      const result = await carnil.createPaymentIntent({
        amount: 2000,
        currency: "usd",
        customerId: "cus_123",
      });
      console.log("Payment intent created:", result);
    } catch (error) {
      console.error("Failed to create payment intent:", error);
    }
  };

  return <button onClick={handleCustomOperation}>Create Payment Intent</button>;
}
```

## Styling

### CSS Classes

The components use CSS classes that can be customized:

```css
/* Carnil Provider */
.carnil-provider {
  /* Provider container */
}

/* Customer components */
.carnil-customer {
  /* Customer container */
}

.carnil-customer-loading {
  /* Loading state */
}

.carnil-customer-error {
  /* Error state */
}

/* Payment Intent components */
.carnil-payment-intent {
  /* Payment intent container */
}

.carnil-payment-intent-loading {
  /* Loading state */
}

.carnil-payment-intent-error {
  /* Error state */
}
```

### Tailwind CSS Integration

The components are built with Tailwind CSS and can be customized:

```tsx
<CarnilProvider config={config} className="min-h-screen bg-gray-50">
  <YourApp />
</CarnilProvider>
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
