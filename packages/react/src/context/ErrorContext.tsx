import React, { createContext, useContext, ReactNode } from "react";
import { TryError } from "try-error";
import { ErrorInfo } from "react";

export interface ErrorContextValue {
  error: Error | TryError | null;
  errorInfo: ErrorInfo | null;
  retry: () => void;
  clearError: () => void;
  retryCount: number;
  isRetrying: boolean;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

export interface ErrorProviderProps {
  children: ReactNode;
  value: ErrorContextValue;
}

export function ErrorProvider({ children, value }: ErrorProviderProps) {
  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorContext must be used within an ErrorProvider");
  }
  return context;
}

// Hook to check if we're inside an error boundary
export function useIsInErrorBoundary() {
  const context = useContext(ErrorContext);
  return context !== null;
}
