import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import {
  TryErrorBoundary,
  AsyncErrorBoundary,
  useAsyncError,
  useAsyncErrorHandler,
} from "../../src/components/TryErrorBoundary";
import { createError } from "try-error";
import "../test-setup";

describe("Async Error Boundary", () => {
  // Mock console.error to avoid noise in tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("TryErrorBoundary with async errors", () => {
    it("should catch unhandled promise rejections when catchAsyncErrors is true", async () => {
      const onError = jest.fn();

      const AsyncComponent = () => {
        React.useEffect(() => {
          // Simulate an async error
          Promise.reject(new Error("Async error"));
        }, []);

        return <div>Component content</div>;
      };

      render(
        <TryErrorBoundary catchAsyncErrors onError={onError}>
          <AsyncComponent />
        </TryErrorBoundary>
      );

      // Wait for the error to be caught
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Async error",
            context: expect.objectContaining({
              async: true,
              source: "unhandledRejection",
            }),
          }),
          null
        );
      });
    });

    it("should catch event handler errors when catchEventHandlerErrors is true", async () => {
      const onError = jest.fn();

      const ComponentWithEventHandler = () => {
        const handleClick = () => {
          throw new Error("Event handler error");
        };

        return <button onClick={handleClick}>Click me</button>;
      };

      render(
        <TryErrorBoundary catchEventHandlerErrors onError={onError}>
          <ComponentWithEventHandler />
        </TryErrorBoundary>
      );

      // Click the button to trigger the error
      fireEvent.click(screen.getByText("Click me"));

      // Wait for the error to be caught
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Event handler error",
            context: expect.objectContaining({
              source: "globalError",
            }),
          }),
          null
        );
      });
    });

    it("should not catch async errors when catchAsyncErrors is false", async () => {
      const onError = jest.fn();

      const AsyncComponent = () => {
        React.useEffect(() => {
          Promise.reject(new Error("Should not be caught"));
        }, []);

        return <div>Component content</div>;
      };

      render(
        <TryErrorBoundary catchAsyncErrors={false} onError={onError}>
          <AsyncComponent />
        </TryErrorBoundary>
      );

      // Wait a bit to ensure the error is not caught
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("useAsyncError hook", () => {
    it("should throw errors to the nearest error boundary", async () => {
      const onError = jest.fn();

      const ComponentWithAsyncError = () => {
        const throwAsyncError = useAsyncError();

        const handleClick = async () => {
          try {
            throw new Error("Async operation failed");
          } catch (error) {
            throwAsyncError(error as Error);
          }
        };

        return <button onClick={handleClick}>Trigger Error</button>;
      };

      render(
        <TryErrorBoundary onError={onError}>
          <ComponentWithAsyncError />
        </TryErrorBoundary>
      );

      fireEvent.click(screen.getByText("Trigger Error"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Async operation failed",
          }),
          expect.any(Object)
        );
      });
    });

    it("should work with TryError objects", async () => {
      const onError = jest.fn();

      const ComponentWithTryError = () => {
        const throwAsyncError = useAsyncError();

        const handleClick = () => {
          const error = createError({
            type: "CustomError",
            message: "Custom async error",
            context: { customData: "test" },
          });
          throwAsyncError(error);
        };

        return <button onClick={handleClick}>Trigger TryError</button>;
      };

      render(
        <TryErrorBoundary onError={onError}>
          <ComponentWithTryError />
        </TryErrorBoundary>
      );

      fireEvent.click(screen.getByText("Trigger TryError"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "CustomError",
            message: "Custom async error",
            context: expect.objectContaining({ customData: "test" }),
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe("useAsyncErrorHandler hook", () => {
    it("should wrap async functions and catch errors automatically", async () => {
      const onError = jest.fn();

      const ComponentWithAsyncHandler = () => {
        const wrapAsync = useAsyncErrorHandler();

        const fetchData = wrapAsync(async () => {
          throw new Error("Fetch failed");
        });

        return <button onClick={fetchData}>Fetch Data</button>;
      };

      render(
        <TryErrorBoundary onError={onError}>
          <ComponentWithAsyncHandler />
        </TryErrorBoundary>
      );

      fireEvent.click(screen.getByText("Fetch Data"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Fetch failed",
          }),
          expect.any(Object)
        );
      });
    });

    it("should preserve function arguments and return values", async () => {
      const ComponentWithAsyncHandler = () => {
        const wrapAsync = useAsyncErrorHandler();
        const [result, setResult] = React.useState<string>("");

        const processData = wrapAsync(async (input: string) => {
          const processed = `Processed: ${input}`;
          setResult(processed);
          return processed;
        });

        return (
          <>
            <button onClick={() => processData("test input")}>Process</button>
            <div>{result}</div>
          </>
        );
      };

      render(
        <TryErrorBoundary>
          <ComponentWithAsyncHandler />
        </TryErrorBoundary>
      );

      fireEvent.click(screen.getByText("Process"));

      await waitFor(() => {
        expect(screen.getByText("Processed: test input")).toBeInTheDocument();
      });
    });
  });

  describe("AsyncErrorBoundary component", () => {
    it("should provide a simple async error boundary", async () => {
      const onError = jest.fn();

      const AsyncComponent = () => {
        React.useEffect(() => {
          Promise.reject(new Error("Async component error"));
        }, []);

        return <div>Async Component</div>;
      };

      render(
        <AsyncErrorBoundary
          fallback={<div>Error occurred!</div>}
          onError={onError}
        >
          <AsyncComponent />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Async component error",
          })
        );
      });
    });

    it("should render fallback UI on error", async () => {
      const AsyncComponent = () => {
        const throwAsyncError = useAsyncError();

        React.useEffect(() => {
          throwAsyncError(new Error("Component failed"));
        }, [throwAsyncError]);

        return <div>Should not render</div>;
      };

      render(
        <AsyncErrorBoundary fallback={<div>Custom error UI</div>}>
          <AsyncComponent />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("Custom error UI")).toBeInTheDocument();
        expect(screen.queryByText("Should not render")).not.toBeInTheDocument();
      });
    });
  });
});
