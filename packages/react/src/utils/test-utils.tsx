import React, { ReactElement, ErrorInfo } from "react";
import {
  render,
  RenderOptions,
  renderHook,
  RenderHookOptions,
  RenderResult,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { TryError, createError } from "@try-error/core";
import {
  TryErrorBoundary,
  TryErrorBoundaryProps,
} from "../components/TryErrorBoundary";
import { useCleanup } from "../hooks/useCleanup";

// Custom render function that includes TryErrorBoundary
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  errorBoundaryProps?: Omit<TryErrorBoundaryProps, "children">;
}

export function renderWithErrorBoundary(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  const { errorBoundaryProps, ...renderOptions } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TryErrorBoundary {...errorBoundaryProps}>{children}</TryErrorBoundary>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock error factories for testing
export const mockErrors = {
  validation: (field: string, message: string) =>
    createError({
      type: "ValidationError",
      message,
      context: { field },
    }),

  network: (status?: number) =>
    createError({
      type: "NetworkError",
      message: `Network request failed${
        status ? ` with status ${status}` : ""
      }`,
      context: { status },
    }),

  component: (componentName: string, message: string) =>
    createError({
      type: "ComponentError",
      message,
      context: { componentName },
    }),

  async: (operation: string) =>
    createError({
      type: "AsyncComponentError",
      message: `Async operation '${operation}' failed`,
      context: { operation },
    }),
};

// Test helper to trigger error boundary
export function triggerErrorBoundary(error: Error | TryError) {
  throw error;
}

// Helper to wait for async operations in tests
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Custom renderHook with error handling
interface CustomRenderHookOptions<TProps> extends RenderHookOptions<TProps> {
  errorBoundaryProps?: Omit<TryErrorBoundaryProps, "children">;
}

export function renderHookWithErrorBoundary<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: CustomRenderHookOptions<TProps>
) {
  const { errorBoundaryProps, ...renderHookOptions } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TryErrorBoundary {...errorBoundaryProps}>{children}</TryErrorBoundary>
    );
  }

  return renderHook(hook, { wrapper: Wrapper, ...renderHookOptions });
}

// Mock AbortController for testing
export class MockAbortController implements AbortController {
  signal: AbortSignal;
  private _aborted = false;
  private _reason: any = undefined; // Used to store abort reason
  private _listeners: Set<() => void> = new Set();

  constructor() {
    this.signal = {
      aborted: false,
      reason: undefined,
      onabort: null,
      addEventListener: (type: string, listener: any) => {
        if (type === "abort") {
          this._listeners.add(listener);
        }
      },
      removeEventListener: (type: string, listener: any) => {
        if (type === "abort") {
          this._listeners.delete(listener);
        }
      },
      dispatchEvent: () => true,
      throwIfAborted: () => {
        if (this._aborted) {
          throw new DOMException("The operation was aborted", "AbortError");
        }
      },
    } as AbortSignal;
  }

  abort(reason?: any): void {
    if (this._aborted) return;

    this._aborted = true;
    this._reason = reason;
    (this.signal as any).aborted = true;
    (this.signal as any).reason = reason;

    // Notify listeners
    this._listeners.forEach((listener) => listener());

    if (this.signal.onabort) {
      this.signal.onabort(new Event("abort"));
    }
  }
}

// Test helper for form submissions
export function createMockFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

// Helper to test loading states
export function expectLoadingState(element: HTMLElement) {
  expect(element).toHaveAttribute("aria-busy", "true");
}

// Helper to test error states
export function expectErrorState(element: HTMLElement, errorMessage?: string) {
  expect(element).toHaveAttribute("aria-invalid", "true");
  if (errorMessage) {
    expect(element).toHaveTextContent(errorMessage);
  }
}

/**
 * Test component that properly handles cleanup errors using useCleanup hook
 * This should be used instead of raw useEffect for testing cleanup errors
 */
export function TestCleanupErrorComponent({
  onCleanup,
  throwAsync = false,
}: {
  onCleanup?: () => void;
  throwAsync?: boolean;
}) {
  const { addCleanup } = useCleanup();

  React.useEffect(() => {
    if (onCleanup) {
      addCleanup(onCleanup);
    }

    if (throwAsync) {
      addCleanup(() => {
        setTimeout(() => {
          throw new Error("Async cleanup error");
        }, 10);
      });
    }
  }, [addCleanup, onCleanup, throwAsync]);

  return <div>Test Component</div>;
}

/**
 * Render component with error boundary that catches cleanup errors
 */
export function renderWithCleanupErrorBoundary(
  component: React.ReactElement,
  options: {
    onError?: (error: Error | TryError, errorInfo: ErrorInfo | null) => void;
    catchAsyncErrors?: boolean;
    catchEventHandlerErrors?: boolean;
  } = {}
): RenderResult {
  const {
    onError,
    catchAsyncErrors = true,
    catchEventHandlerErrors = true,
  } = options;

  return render(
    <TryErrorBoundary
      onError={onError}
      catchAsyncErrors={catchAsyncErrors}
      catchEventHandlerErrors={catchEventHandlerErrors}
    >
      {component}
    </TryErrorBoundary>
  );
}

// Re-export commonly used testing utilities
export * from "@testing-library/react";
export { act, waitFor, screen, fireEvent } from "@testing-library/react";
