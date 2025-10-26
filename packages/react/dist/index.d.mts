import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { CarnilConfig, Carnil, Customer, CreateCustomerRequest, CarnilResponse, UpdateCustomerRequest, CustomerListRequest, ListResponse } from '@carnil/core';
export { AIUsageMetrics, CarnilConfig, CarnilResponse, CreateCustomerRequest, CreateInvoiceRequest, CreatePaymentIntentRequest, CreateRefundRequest, CreateSubscriptionRequest, Customer, CustomerListRequest, Dispute, Invoice, InvoiceListRequest, ListResponse, PaymentIntent, PaymentIntentListRequest, PaymentMethod, Refund, Subscription, SubscriptionListRequest, UpdateCustomerRequest, UsageMetrics, WebhookEvent } from '@carnil/core';

interface CarnilContextValue {
    carnil: Carnil | undefined;
    isLoading: boolean;
    error: string | null;
    config: CarnilConfig | null;
}
interface CarnilProviderProps {
    children: ReactNode;
    config: CarnilConfig;
    fallback?: ReactNode;
    onError?: (error: Error) => void;
}
declare function CarnilProvider({ children, config, fallback, onError }: CarnilProviderProps): react_jsx_runtime.JSX.Element;
declare function useCarnilContext(): CarnilContextValue;
declare function useCarnil(): Carnil;

interface UseCustomerState {
    customer: Customer | null;
    customers: Customer[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    totalCount?: number;
}
interface UseCustomerActions {
    createCustomer: (request: CreateCustomerRequest) => Promise<CarnilResponse<Customer>>;
    updateCustomer: (id: string, request: UpdateCustomerRequest) => Promise<CarnilResponse<Customer>>;
    deleteCustomer: (id: string) => Promise<CarnilResponse<void>>;
    fetchCustomer: (id: string) => Promise<CarnilResponse<Customer>>;
    listCustomers: (request?: CustomerListRequest) => Promise<CarnilResponse<ListResponse<Customer>>>;
    refetch: () => Promise<void>;
    clearError: () => void;
}
type UseCustomerReturn = UseCustomerState & UseCustomerActions;
declare function useCustomer(customerId?: string): UseCustomerReturn;
declare function useCustomerList(initialRequest?: CustomerListRequest): UseCustomerReturn;

export { CarnilProvider, type CarnilProviderProps, type UseCustomerReturn, useCarnil, useCarnilContext, useCustomer, useCustomerList };
