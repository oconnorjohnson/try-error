import React from "react";
import { TryError, TryResult } from "../../../try-error-prototype/src";

// Re-export core types for convenience
export {
  TryError,
  TryResult,
  TryTuple,
} from "../../../try-error-prototype/src";

// Hook-specific types
export interface UseTryOptions<T, E extends TryError> {
  // Execution control
  enabled?: boolean;
  suspense?: boolean;

  // Caching
  staleTime?: number;
  cacheTime?: number;
  cacheKey?: string;

  // Retry logic
  retry?: boolean | number | ((error: E, attempt: number) => boolean);
  retryDelay?: number | ((attempt: number) => number);

  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: (data: T | null, error: E | null) => void;

  // Error handling
  errorBoundary?: boolean;
  fallback?: (error: E) => T;

  // Dependencies
  deps?: React.DependencyList;
}

export interface UseTryResult<T, E extends TryError> {
  // Data state
  data: T | null;
  error: E | null;

  // Loading states
  isLoading: boolean;
  isValidating: boolean;
  isStale: boolean;

  // Actions
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
  reset: () => void;

  // Status
  status: "idle" | "loading" | "success" | "error";
  fetchStatus: "idle" | "fetching" | "paused";
}

export interface UseTryCallbackOptions<T, E extends TryError> {
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: (data: T | null, error: E | null) => void;

  // Optimistic updates
  optimisticUpdate?: (variables: any) => void;
  rollback?: (variables: any) => void;

  // Error handling
  throwOnError?: boolean;
  errorBoundary?: boolean;
}

export interface UseTryCallbackResult<
  T,
  E extends TryError,
  Args extends any[]
> {
  // Execute function
  execute: (...args: Args) => Promise<TryResult<T, E>>;

  // State
  data: T | null;
  error: E | null;
  isLoading: boolean;

  // Actions
  reset: () => void;

  // Status
  status: "idle" | "loading" | "success" | "error";
}

export interface UseTryMutationOptions<T, E extends TryError, Variables> {
  // Cache invalidation
  invalidateQueries?: string[];
  updateQueries?: Record<
    string,
    (oldData: any, newData: T, variables: Variables) => any
  >;

  // Optimistic updates
  optimisticUpdate?: (variables: Variables) => void;
  rollback?: (variables: Variables, error: E) => void;

  // Callbacks
  onMutate?: (variables: Variables) => void;
  onSuccess?: (data: T, variables: Variables) => void;
  onError?: (error: E, variables: Variables) => void;
  onSettled?: (data: T | null, error: E | null, variables: Variables) => void;
}

export interface UseTryQueryOptions<T, E extends TryError>
  extends UseTryOptions<T, E> {
  queryKey: string | (string | number)[];

  // Cache behavior
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number;

  // Background updates
  refetchInBackground?: boolean;
  keepPreviousData?: boolean;
}

// Component types
export interface TryErrorBoundaryProps {
  children: React.ReactNode;

  // Error handling
  fallback?: React.ComponentType<{ error: TryError; retry: () => void }>;
  onError?: (error: TryError, errorInfo: React.ErrorInfo) => void;

  // Error filtering
  filter?: (error: TryError) => boolean;
  isolate?: boolean; // Prevent error propagation to parent boundaries

  // Reset behavior
  resetKeys?: (string | number)[];
  resetOnPropsChange?: boolean;
}

export interface TryProviderProps {
  children: React.ReactNode;

  // Global defaults
  defaultOptions?: Partial<UseTryOptions<any, any>>;

  // Error handling
  onError?: (error: TryError) => void;
  errorBoundary?: React.ComponentType<{ error: TryError; retry: () => void }>;

  // Cache configuration
  cache?: TryCache;

  // Development
  devtools?: boolean;
}

// Cache types
export interface TryCacheOptions {
  maxSize?: number;
  defaultStaleTime?: number;
  defaultCacheTime?: number;

  // Persistence
  persist?: boolean;
  storage?: Storage;

  // Background updates
  backgroundRefetch?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
  cacheTime: number;
}

export interface QueryState<T = any, E extends TryError = TryError> {
  data: T | null;
  error: E | null;
  status: "idle" | "loading" | "success" | "error";
  fetchStatus: "idle" | "fetching" | "paused";
  isStale: boolean;
  lastFetch: number;
}

export interface MutationState<T = any, E extends TryError = TryError> {
  data: T | null;
  error: E | null;
  status: "idle" | "loading" | "success" | "error";
  variables: any;
}

export abstract class TryCache {
  abstract get<T>(key: string): T | undefined;
  abstract set<T>(
    key: string,
    data: T,
    options?: { staleTime?: number; cacheTime?: number }
  ): void;
  abstract invalidate(key: string | string[]): void;
  abstract clear(): void;
  abstract subscribe(key: string, callback: (data: any) => void): () => void;
}

// Suspense types
export interface TryResource<T> {
  read(key: string): T;
}

// DevTools types
export interface TryDevtools {
  queries: Record<string, QueryState>;
  mutations: MutationState[];
  errors: TryError[];
  cache: Record<string, any>;
}

// Context types
export interface TryContextValue {
  defaultOptions: Partial<UseTryOptions<any, any>>;
  onError?: (error: TryError) => void;
  cache: TryCache;
  devtools: boolean;
}
