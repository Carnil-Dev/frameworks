import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Carnil } from '@carnil/core';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';

// src/context/carnil-provider.tsx
var CarnilContext = createContext(void 0);
function CarnilProvider({ children, config, fallback, onError }) {
  const [carnil, setCarnil] = useState(void 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const initializeCarnil = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const carnilInstance = new Carnil(config);
        const isHealthy = await carnilInstance.healthCheck();
        if (!isHealthy) {
          throw new Error("Carnil health check failed");
        }
        setCarnil(carnilInstance);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize Carnil";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    };
    initializeCarnil();
  }, [config, onError]);
  const contextValue = {
    carnil,
    isLoading,
    error,
    config
  };
  if (isLoading && fallback) {
    return /* @__PURE__ */ jsx(Fragment, { children: fallback });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { style: { padding: "1rem", color: "red" }, children: [
      /* @__PURE__ */ jsx("h3", { children: "Carnil Error" }),
      /* @__PURE__ */ jsx("p", { children: error })
    ] });
  }
  return /* @__PURE__ */ jsx(CarnilContext.Provider, { value: contextValue, children });
}
function useCarnilContext() {
  const context = useContext(CarnilContext);
  if (!context) {
    throw new Error("useCarnilContext must be used within a CarnilProvider");
  }
  return context;
}
function useCarnil() {
  const { carnil } = useCarnilContext();
  if (!carnil) {
    throw new Error(
      "Carnil instance not available. Make sure CarnilProvider is properly configured."
    );
  }
  return carnil;
}
function useCustomer(customerId) {
  const carnil = useCarnil();
  const [state, setState] = useState({
    customer: null,
    customers: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalCount: void 0
  });
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);
  const createCustomer = useCallback(
    async (request) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.createCustomer(request);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customer: response.data,
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to create customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const updateCustomer = useCallback(
    async (id, request) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.updateCustomer(id, request);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customer: response.data,
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to update customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const deleteCustomer = useCallback(
    async (id) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.deleteCustomer(id);
        if (response.success) {
          setState((prev) => ({
            ...prev,
            customer: null,
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to delete customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: void 0, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const fetchCustomer = useCallback(
    async (id) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.getCustomer(id);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customer: response.data,
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to fetch customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const listCustomers = useCallback(
    async (request) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.listCustomers(request);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customers: response.data.data,
            hasMore: response.data.hasMore,
            totalCount: response.data.totalCount,
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to list customers",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to list customers";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const refetch = useCallback(async () => {
    if (customerId) {
      await fetchCustomer(customerId);
    } else {
      await listCustomers();
    }
  }, [customerId, fetchCustomer, listCustomers]);
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
    clearError
  };
}
function useCustomerList(initialRequest) {
  const carnil = useCarnil();
  const [state, setState] = useState({
    customer: null,
    customers: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalCount: void 0
  });
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);
  const listCustomers = useCallback(
    async (request) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.listCustomers(request);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customers: response.data.data,
            hasMore: response.data.hasMore,
            totalCount: response.data.totalCount,
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to list customers",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to list customers";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const createCustomer = useCallback(
    async (request) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.createCustomer(request);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customers: [response.data, ...prev.customers],
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to create customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const updateCustomer = useCallback(
    async (id, request) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.updateCustomer(id, request);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customers: prev.customers.map((c) => c.id === id ? response.data : c),
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to update customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const deleteCustomer = useCallback(
    async (id) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.deleteCustomer(id);
        if (response.success) {
          setState((prev) => ({
            ...prev,
            customers: prev.customers.filter((c) => c.id !== id),
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to delete customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: void 0, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const fetchCustomer = useCallback(
    async (id) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await carnil.getCustomer(id);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            customer: response.data,
            isLoading: false
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to fetch customer",
            isLoading: false
          }));
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch customer";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { data: null, success: false, error: errorMessage };
      }
    },
    [carnil]
  );
  const refetch = useCallback(async () => {
    await listCustomers(initialRequest);
  }, [listCustomers, initialRequest]);
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
    clearError
  };
}

export { CarnilProvider, useCarnil, useCarnilContext, useCustomer, useCustomerList };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map