import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Carnil, CarnilConfig } from '@carnil/core';

// ============================================================================
// Carnil Context
// ============================================================================

interface CarnilContextValue {
  carnil: Carnil | null;
  isLoading: boolean;
  error: string | null;
  config: CarnilConfig | null;
}

const CarnilContext = createContext<CarnilContextValue | null>(null);

// ============================================================================
// Carnil Provider Props
// ============================================================================

export interface CarnilProviderProps {
  children: ReactNode;
  config: CarnilConfig;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

// ============================================================================
// Carnil Provider Component
// ============================================================================

export function CarnilProvider({
  children,
  config,
  fallback,
  onError,
}: CarnilProviderProps) {
  const [carnil, setCarnil] = useState<Carnil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCarnil = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const carnilInstance = new Carnil(config);
        
        // Perform health check
        const isHealthy = await carnilInstance.healthCheck();
        if (!isHealthy) {
          throw new Error('Carnil health check failed');
        }

        setCarnil(carnilInstance);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Carnil';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    };

    initializeCarnil();
  }, [config, onError]);

  const contextValue: CarnilContextValue = {
    carnil,
    isLoading,
    error,
    config,
  };

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        <h3>Carnil Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <CarnilContext.Provider value={contextValue}>
      {children}
    </CarnilContext.Provider>
  );
}

// ============================================================================
// Hook to use Carnil context
// ============================================================================

export function useCarnilContext(): CarnilContextValue {
  const context = useContext(CarnilContext);
  
  if (!context) {
    throw new Error('useCarnilContext must be used within a CarnilProvider');
  }
  
  return context;
}

// ============================================================================
// Hook to get Carnil instance
// ============================================================================

export function useCarnil(): Carnil {
  const { carnil } = useCarnilContext();
  
  if (!carnil) {
    throw new Error('Carnil instance not available. Make sure CarnilProvider is properly configured.');
  }
  
  return carnil;
}
