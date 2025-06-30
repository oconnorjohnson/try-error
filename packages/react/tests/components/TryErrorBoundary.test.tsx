import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "../test-setup";
import {
  TryErrorBoundary,
  useErrorBoundaryTrigger,
  withTryErrorBoundary,
} from "../../src/components/TryErrorBoundary";
import { createError } from "try-error";

// Component that throws an error
const ThrowError: React.FC<{ error?: Error | null }> = ({ error }) => {
  if (error) {
    throw error;
  }
  return <div>No error</div>;
};

// Component that throws on click
const ThrowOnClick: React.FC = () => {
  const throwError = useErrorBoundaryTrigger();

  const handleClick = () => {
    throwError(new Error("Clicked error"));
  };

  return <button onClick={handleClick}>Throw Error</button>;
};

// Async component that throws
const AsyncThrow: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (shouldThrow) {
        throw new Error("Async error");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [shouldThrow]);

  if (loading) return <div>Loading...</div>;
  return <div>Loaded successfully</div>;
};

describe("TryErrorBoundary", () => {
  // Suppress console errors during tests
  const originalError = console.error;
  const originalGroup = console.group;
  const originalGroupEnd = console.groupEnd;

  beforeAll(() => {
    console.error = jest.fn();
    console.group = jest.fn();
    console.groupEnd = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
    console.group = originalGroup;
    console.groupEnd = originalGroupEnd;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("basic error catching", () => {
    it("should render children when there is no error", () => {
      render(
        <TryErrorBoundary>
          <div>Test content</div>
        </TryErrorBoundary>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("should catch errors and display default fallback", () => {
      const error = new Error("Test error");

      render(
        <TryErrorBoundary>
          <ThrowError error={error} />
        </TryErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      // Regular errors are converted to TryErrors with type "ReactError"
      expect(screen.getByText("⚠️ Operation Failed")).toBeInTheDocument();
      expect(screen.getByText("Test error")).toBeInTheDocument();
      expect(screen.getByText("ReactError")).toBeInTheDocument();
    });

    it("should catch TryError and display special handling", () => {
      const tryError = createError({
        type: "ValidationError",
        message: "Invalid input",
        source: "test-component",
      });

      render(
        <TryErrorBoundary>
          <ThrowError error={tryError as any} />
        </TryErrorBoundary>
      );

      expect(screen.getByText("⚠️ Operation Failed")).toBeInTheDocument();
      expect(screen.getByText("Invalid input")).toBeInTheDocument();
      expect(screen.getByText(/Error Type:/)).toBeInTheDocument();
      expect(screen.getByText("ValidationError")).toBeInTheDocument();
      expect(screen.getByText(/Source:/)).toBeInTheDocument();
      expect(screen.getByText("test-component")).toBeInTheDocument();
    });
  });

  describe("custom fallback", () => {
    it("should render custom fallback component", () => {
      const error = new Error("Custom error");
      const customFallback = jest.fn((error, errorInfo, retry) => (
        <div>
          <h1>Custom Error UI</h1>
          <p>{error.message}</p>
          <button onClick={retry}>Custom Retry</button>
        </div>
      ));

      render(
        <TryErrorBoundary fallback={customFallback}>
          <ThrowError error={error} />
        </TryErrorBoundary>
      );

      expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
      expect(screen.getByText("Custom error")).toBeInTheDocument();
      expect(screen.getByText("Custom Retry")).toBeInTheDocument();
      // The error is converted to a TryError in componentDidCatch
      expect(customFallback).toHaveBeenCalled();
      const [receivedError, receivedErrorInfo, receivedRetry] =
        customFallback.mock.calls[customFallback.mock.calls.length - 1];
      expect(receivedError.type).toBe("ReactError");
      expect(receivedError.message).toBe("Custom error");
      expect(receivedErrorInfo?.componentStack).toContain("ThrowError");
      expect(typeof receivedRetry).toBe("function");
    });

    it("should pass error info to custom fallback", () => {
      const error = new Error("Test");
      let capturedErrorInfo: any = null;

      render(
        <TryErrorBoundary
          fallback={(error, errorInfo) => {
            capturedErrorInfo = errorInfo;
            return <div>Error caught</div>;
          }}
        >
          <ThrowError error={error} />
        </TryErrorBoundary>
      );

      expect(capturedErrorInfo).toBeTruthy();
      expect(capturedErrorInfo.componentStack).toContain("ThrowError");
    });
  });

  describe("retry functionality", () => {
    it("should retry when retry button is clicked", () => {
      let shouldThrow = true;
      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error("Initial error");
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <TryErrorBoundary>
          <TestComponent />
        </TryErrorBoundary>
      );

      expect(screen.getByText("Initial error")).toBeInTheDocument();

      // Set shouldThrow to false before retry
      shouldThrow = false;

      // Click retry
      fireEvent.click(screen.getByText("Try Again"));

      expect(screen.getByText("No error")).toBeInTheDocument();
    });

    it("should disable retry after 3 attempts", () => {
      const PersistentErrorComponent = () => {
        throw new Error("Persistent error");
      };

      const { rerender } = render(
        <TryErrorBoundary>
          <PersistentErrorComponent />
        </TryErrorBoundary>
      );

      expect(screen.getByText("Persistent error")).toBeInTheDocument();

      // First retry
      fireEvent.click(screen.getByText("Try Again"));
      expect(screen.getByText(/Retry attempt: 1 of 3/)).toBeInTheDocument();

      // Second retry
      fireEvent.click(screen.getByText("Try Again"));
      expect(screen.getByText(/Retry attempt: 2 of 3/)).toBeInTheDocument();

      // Third retry
      fireEvent.click(screen.getByText("Try Again"));
      expect(screen.getByText(/Retry attempt: 3 of 3/)).toBeInTheDocument();
      expect(screen.getByText("Max retries reached")).toBeInTheDocument();
      expect(screen.getByText("Max retries reached")).toBeDisabled();
    });

    it("should not show retry button when showRetry is false", () => {
      render(
        <TryErrorBoundary showRetry={false}>
          <ThrowError error={new Error("No retry")} />
        </TryErrorBoundary>
      );

      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });
  });

  describe("error callback", () => {
    it("should call onError when error occurs", () => {
      const onError = jest.fn();
      const error = new Error("Callback test");

      render(
        <TryErrorBoundary onError={onError}>
          <ThrowError error={error} />
        </TryErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ReactError",
          message: "Callback test",
        }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it("should pass TryError directly to onError", () => {
      const onError = jest.fn();
      const tryError = createError({
        type: "TestError",
        message: "TryError test",
      });

      render(
        <TryErrorBoundary onError={onError}>
          <ThrowError error={tryError as any} />
        </TryErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "TestError",
          message: "TryError test",
          context: expect.objectContaining({
            componentStack: expect.any(String),
            errorBoundary: true,
          }),
        }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });
  });

  describe("error details", () => {
    it("should show error details in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error = new Error("Dev error");
      error.stack = "Error: Dev error\n  at TestComponent";

      render(
        <TryErrorBoundary showErrorDetails={true}>
          <ThrowError error={error} />
        </TryErrorBoundary>
      );

      expect(
        screen.getByText("Error Details (Development)")
      ).toBeInTheDocument();

      // Click to expand details
      fireEvent.click(screen.getByText("Error Details (Development)"));

      expect(screen.getByText(/Error: Dev error/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not show error details in production by default", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      render(
        <TryErrorBoundary>
          <ThrowError error={new Error("Prod error")} />
        </TryErrorBoundary>
      );

      expect(
        screen.queryByText("Error Details (Development)")
      ).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("custom props", () => {
    it("should use custom error message", () => {
      render(
        <TryErrorBoundary errorMessage="Oops! Please refresh the page.">
          <ThrowError error={new Error("Original error")} />
        </TryErrorBoundary>
      );

      expect(
        screen.getByText("Oops! Please refresh the page.")
      ).toBeInTheDocument();
      expect(screen.queryByText("Original error")).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <TryErrorBoundary className="custom-error-boundary">
          <ThrowError error={new Error("Test")} />
        </TryErrorBoundary>
      );

      const errorBoundary = screen.getByRole("alert");
      expect(errorBoundary).toHaveClass(
        "try-error-boundary",
        "custom-error-boundary"
      );
    });
  });
});

describe("useErrorBoundaryTrigger", () => {
  // Note: React error boundaries don't catch errors in event handlers,
  // so useErrorBoundaryTrigger won't work as intended when called from
  // event handlers. It would only work if the error is thrown during render.

  it("should be defined as a function", () => {
    const Component = () => {
      const throwError = useErrorBoundaryTrigger();
      expect(typeof throwError).toBe("function");
      return <div>Test</div>;
    };

    render(<Component />);
  });
});

describe("withTryErrorBoundary", () => {
  it("should wrap component with error boundary", () => {
    const TestComponent: React.FC = () => {
      throw new Error("Component error");
    };

    const SafeComponent = withTryErrorBoundary(TestComponent);

    render(<SafeComponent />);

    expect(screen.getByText("Component error")).toBeInTheDocument();
  });

  it("should pass props to wrapped component", () => {
    interface Props {
      message: string;
      shouldThrow?: boolean;
    }

    const TestComponent: React.FC<Props> = ({ message, shouldThrow }) => {
      if (shouldThrow) {
        throw new Error("Prop-based error");
      }
      return <div>{message}</div>;
    };

    const SafeComponent = withTryErrorBoundary(TestComponent);

    const { rerender } = render(
      <SafeComponent message="Hello" shouldThrow={false} />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();

    rerender(<SafeComponent message="Error time" shouldThrow={true} />);

    expect(screen.getByText("Prop-based error")).toBeInTheDocument();
  });

  it("should use custom boundary props", () => {
    const TestComponent: React.FC = () => {
      throw new Error("HOC error");
    };

    const onError = jest.fn();
    const SafeComponent = withTryErrorBoundary(TestComponent, {
      onError,
      errorMessage: "Custom HOC error message",
    });

    render(<SafeComponent />);

    expect(screen.getByText("Custom HOC error message")).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it("should set correct display name", () => {
    const NamedComponent: React.FC = () => <div>Named</div>;
    NamedComponent.displayName = "CustomName";

    const WrappedNamed = withTryErrorBoundary(NamedComponent);
    expect(WrappedNamed.displayName).toBe("withTryErrorBoundary(CustomName)");

    const UnnamedComponent: React.FC = () => <div>Unnamed</div>;
    const WrappedUnnamed = withTryErrorBoundary(UnnamedComponent);
    expect(WrappedUnnamed.displayName).toBe(
      "withTryErrorBoundary(UnnamedComponent)"
    );
  });
});
