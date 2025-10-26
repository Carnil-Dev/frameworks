'use strict';

var react = require('react');
var core = require('@carnil/core');
var jsxRuntime = require('react/jsx-runtime');

// src/context/carnil-provider.tsx
var CarnilContext = react.createContext(void 0);
function CarnilProvider({ children, config, fallback, onError }) {
  const [carnil, setCarnil] = react.useState(void 0);
  const [isLoading, setIsLoading] = react.useState(true);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
    const initializeCarnil = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const carnilInstance = new core.Carnil(config);
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
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: fallback });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { padding: "1rem", color: "red" }, children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Carnil Error" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: error })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(CarnilContext.Provider, { value: contextValue, children });
}
function useCarnilContext() {
  const context = react.useContext(CarnilContext);
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
  const [state, setState] = react.useState({
    customer: null,
    customers: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalCount: void 0
  });
  const clearError = react.useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);
  const createCustomer = react.useCallback(
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
  const updateCustomer = react.useCallback(
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
  const deleteCustomer = react.useCallback(
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
  const fetchCustomer = react.useCallback(
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
  const listCustomers = react.useCallback(
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
  const refetch = react.useCallback(async () => {
    if (customerId) {
      await fetchCustomer(customerId);
    } else {
      await listCustomers();
    }
  }, [customerId, fetchCustomer, listCustomers]);
  react.useEffect(() => {
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
  const [state, setState] = react.useState({
    customer: null,
    customers: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalCount: void 0
  });
  const clearError = react.useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);
  const listCustomers = react.useCallback(
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
  const createCustomer = react.useCallback(
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
  const updateCustomer = react.useCallback(
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
  const deleteCustomer = react.useCallback(
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
  const fetchCustomer = react.useCallback(
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
  const refetch = react.useCallback(async () => {
    await listCustomers(initialRequest);
  }, [listCustomers, initialRequest]);
  react.useEffect(() => {
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

exports.CarnilProvider = CarnilProvider;
exports.useCarnil = useCarnil;
exports.useCarnilContext = useCarnilContext;
exports.useCustomer = useCustomer;
exports.useCustomerList = useCustomerList;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map