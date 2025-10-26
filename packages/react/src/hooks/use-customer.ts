import { useState, useEffect, useCallback } from 'react';
import { useCarnil } from '../context/carnil-provider';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerListRequest,
  ListResponse,
  CarnilResponse,
} from '@carnil/core';

// ============================================================================
// Customer Hook State
// ============================================================================

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

export type UseCustomerReturn = UseCustomerState & UseCustomerActions;

// ============================================================================
// Single Customer Hook
// ============================================================================

export function useCustomer(customerId?: string): UseCustomerReturn {
  const carnil = useCarnil();
  const [state, setState] = useState<UseCustomerState>({
    customer: null,
    customers: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalCount: undefined,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const createCustomer = useCallback(
    async (request: CreateCustomerRequest): Promise<CarnilResponse<Customer>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.createCustomer(request);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customer: response.data,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to create customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const updateCustomer = useCallback(
    async (id: string, request: UpdateCustomerRequest): Promise<CarnilResponse<Customer>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.updateCustomer(id, request);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customer: response.data,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to update customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<CarnilResponse<void>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.deleteCustomer(id);

        if (response.success) {
          setState(prev => ({
            ...prev,
            customer: null,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to delete customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: undefined, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const fetchCustomer = useCallback(
    async (id: string): Promise<CarnilResponse<Customer>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.getCustomer(id);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customer: response.data,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to fetch customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const listCustomers = useCallback(
    async (request?: CustomerListRequest): Promise<CarnilResponse<ListResponse<Customer>>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.listCustomers(request);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customers: response.data.data,
            hasMore: response.data.hasMore,
            totalCount: response.data.totalCount,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to list customers',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to list customers';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const refetch = useCallback(async (): Promise<void> => {
    if (customerId) {
      await fetchCustomer(customerId);
    } else {
      await listCustomers();
    }
  }, [customerId, fetchCustomer, listCustomers]);

  // Auto-fetch customer if customerId is provided
  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId);
    }
  }, [customerId, fetchCustomer]);

  return {
    ...state,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomer,
    listCustomers,
    refetch,
    clearError,
  };
}

// ============================================================================
// Customer List Hook
// ============================================================================

export function useCustomerList(initialRequest?: CustomerListRequest): UseCustomerReturn {
  const carnil = useCarnil();
  const [state, setState] = useState<UseCustomerState>({
    customer: null,
    customers: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalCount: undefined,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const listCustomers = useCallback(
    async (request?: CustomerListRequest): Promise<CarnilResponse<ListResponse<Customer>>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.listCustomers(request);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customers: response.data.data,
            hasMore: response.data.hasMore,
            totalCount: response.data.totalCount,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to list customers',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to list customers';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const createCustomer = useCallback(
    async (request: CreateCustomerRequest): Promise<CarnilResponse<Customer>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.createCustomer(request);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customers: [response.data, ...prev.customers],
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to create customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const updateCustomer = useCallback(
    async (id: string, request: UpdateCustomerRequest): Promise<CarnilResponse<Customer>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.updateCustomer(id, request);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customers: prev.customers.map(c => (c.id === id ? response.data! : c)),
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to update customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<CarnilResponse<void>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.deleteCustomer(id);

        if (response.success) {
          setState(prev => ({
            ...prev,
            customers: prev.customers.filter(c => c.id !== id),
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to delete customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: undefined, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const fetchCustomer = useCallback(
    async (id: string): Promise<CarnilResponse<Customer>> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await carnil.getCustomer(id);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            customer: response.data,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Failed to fetch customer',
            isLoading: false,
          }));
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customer';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        return { data: null as any, success: false, error: errorMessage };
      }
    },
    [carnil]
  );

  const refetch = useCallback(async (): Promise<void> => {
    await listCustomers(initialRequest);
  }, [listCustomers, initialRequest]);

  // Auto-fetch customers on mount
  useEffect(() => {
    listCustomers(initialRequest);
  }, [listCustomers, initialRequest]);

  return {
    ...state,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomer,
    listCustomers,
    refetch,
    clearError,
  };
}
