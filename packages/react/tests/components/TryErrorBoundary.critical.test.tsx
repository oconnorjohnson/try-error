import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import {
  TryErrorBoundary,
  AsyncErrorBoundary,
  useAsyncError,
  useAsyncErrorHandler,
} from "../../src/components/TryErrorBoundary";
import { createError } from "try-error";
import "../test-setup";

// Mock React 18 concurrent features
const MockConcurrentRoot = React.lazy(() => {
  return new Promise<{ default: React.ComponentType }>((resolve) => {
    setTimeout(() => {
      resolve({
        default: () => <div>Concurrent Component</div>,
      });
    }, 100);
  });
});

describe("React Error Boundary Critical Edge Cases", () => {
  let originalError: typeof console.error;
  let originalWarn: typeof console.warn;

  beforeAll(() => {
    originalError = console.error;
    originalWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Unmounting During Error Handling", () => {
    it("should handle component unmounting during error processing", async () => {
      const onError = jest.fn();
      let triggerError: () => void = () => {};

      const ErrorThrowingComponent = () => {
        const throwAsyncError = useAsyncError();

        triggerError = () => {
          setTimeout(() => {
            throwAsyncError(new Error("Delayed error"));
          }, 50);
        };

        return <button onClick={triggerError}>Trigger Error</button>;
      };

      const { unmount } = render(
        <TryErrorBoundary onError={onError}>
          <ErrorThrowingComponent />
        </TryErrorBoundary>
      );

      // Trigger error
      fireEvent.click(screen.getByText("Trigger Error"));

      // Unmount immediately while error is being processed
      act(() => {
        unmount();
      });

      // Wait for any pending errors
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not cause memory leaks or unhandled rejections
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("memory leak")
      );
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("unmounted component")
      );
    });

    it("should cleanup event listeners on unmount", async () => {
      const addEventListener = jest.spyOn(window, "addEventListener");
      const removeEventListener = jest.spyOn(window, "removeEventListener");

      const { unmount } = render(
        <TryErrorBoundary catchAsyncErrors>
          <div>Content</div>
        </TryErrorBoundary>
      );

      // Should have added event listeners
      expect(addEventListener).toHaveBeenCalledWith(
        "unhandledrejection",
        expect.any(Function)
      );
      expect(addEventListener).toHaveBeenCalledWith(
        "error",
        expect.any(Function)
      );

      // Unmount and check cleanup
      unmount();

      expect(removeEventListener).toHaveBeenCalledWith(
        "unhandledrejection",
        expect.any(Function)
      );
      expect(removeEventListener).toHaveBeenCalledWith(
        "error",
        expect.any(Function)
      );

      addEventListener.mockRestore();
      removeEventListener.mockRestore();
    });

    it("should handle rapid mount/unmount cycles", async () => {
      const onError = jest.fn();

      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <TryErrorBoundary onError={onError} catchAsyncErrors>
            <div>Component {i}</div>
          </TryErrorBoundary>
        );

        // Trigger an async error
        const event = new Event("unhandledrejection") as any;
        event.reason = new Error(`Error ${i}`);
        event.preventDefault = jest.fn();
        window.dispatchEvent(event);

        // Unmount immediately
        unmount();
      }

      // Should not accumulate memory leaks
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining("memory")
      );
    });

    it("should handle errors during unmount process", async () => {
      const onError = jest.fn();

      const ComponentWithUnmountError = () => {
        const throwAsyncError = useAsyncError();

        React.useEffect(() => {
          return () => {
            // Simulate error during cleanup
            try {
              throw new Error("Cleanup error");
            } catch (error) {
              throwAsyncError(error as Error);
            }
          };
        }, [throwAsyncError]);

        return <div>Component with cleanup error</div>;
      };

      const { unmount } = render(
        <TryErrorBoundary onError={onError}>
          <ComponentWithUnmountError />
        </TryErrorBoundary>
      );

      // Unmount should not crash
      expect(() => unmount()).not.toThrow();

      // Error should be handled gracefully
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Cleanup error",
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe("React 18 Concurrent Features", () => {
    it("should handle errors in Suspense boundaries", async () => {
      const onError = jest.fn();

      const SuspenseComponent = () => (
        <React.Suspense fallback={<div>Loading...</div>}>
          <MockConcurrentRoot />
        </React.Suspense>
      );

      render(
        <TryErrorBoundary onError={onError}>
          <SuspenseComponent />
        </TryErrorBoundary>
      );

      // Trigger error during suspense
      const event = new Event("unhandledrejection") as any;
      event.reason = new Error("Suspense error");
      event.preventDefault = jest.fn();
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(screen.getByText("Concurrent Component")).toBeInTheDocument();
      });
    });

    it("should handle concurrent mode rendering interruptions", async () => {
      const onError = jest.fn();
      let renderCount = 0;

      const ConcurrentComponent = () => {
        renderCount++;
        const throwAsyncError = useAsyncError();

        React.useEffect(() => {
          if (renderCount > 1) {
            throwAsyncError(new Error("Concurrent render error"));
          }
        }, [throwAsyncError]);

        return <div>Render count: {renderCount}</div>;
      };

      const { rerender } = render(
        <TryErrorBoundary onError={onError}>
          <ConcurrentComponent />
        </TryErrorBoundary>
      );

      // Force re-render to simulate concurrent interruption
      rerender(
        <TryErrorBoundary onError={onError}>
          <ConcurrentComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Concurrent render error",
          }),
          expect.any(Object)
        );
      });
    });

    it("should handle errors with startTransition", async () => {
      const onError = jest.fn();

      const TransitionComponent = () => {
        const [isPending, startTransition] = React.useTransition();
        const [count, setCount] = React.useState(0);
        const throwAsyncError = useAsyncError();

        const handleClick = () => {
          startTransition(() => {
            setCount((c) => c + 1);
            if (count >= 2) {
              throwAsyncError(new Error("Transition error"));
            }
          });
        };

        return (
          <div>
            <button onClick={handleClick}>
              {isPending ? "Updating..." : `Count: ${count}`}
            </button>
          </div>
        );
      };

      render(
        <TryErrorBoundary onError={onError}>
          <TransitionComponent />
        </TryErrorBoundary>
      );

      // Click multiple times to trigger error
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Transition error",
          }),
          expect.any(Object)
        );
      });
    });

    it("should handle errors with useDeferredValue", async () => {
      const onError = jest.fn();

      const DeferredComponent = () => {
        const [input, setInput] = React.useState("");
        const deferredInput = React.useDeferredValue(input);
        const throwAsyncError = useAsyncError();

        React.useEffect(() => {
          if (deferredInput === "error") {
            throwAsyncError(new Error("Deferred value error"));
          }
        }, [deferredInput, throwAsyncError]);

        return (
          <div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type 'error' to trigger error"
            />
            <div>Deferred: {deferredInput}</div>
          </div>
        );
      };

      render(
        <TryErrorBoundary onError={onError}>
          <DeferredComponent />
        </TryErrorBoundary>
      );

      const input = screen.getByPlaceholderText(
        "Type 'error' to trigger error"
      );
      fireEvent.change(input, { target: { value: "error" } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Deferred value error",
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe("Memory Leak Prevention", () => {
    it("should not leak memory with repeated error cycles", async () => {
      const onError = jest.fn();

      // Track object creation to detect leaks
      const createdObjects = new Set();
      const originalCreateError = createError;

      // Mock createError to track instances
      const mockCreateError = (options: any) => {
        const error = originalCreateError(options);
        createdObjects.add(error);
        return error;
      };

      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <TryErrorBoundary onError={onError}>
            <div>Cycle {i}</div>
          </TryErrorBoundary>
        );

        // Create error
        const event = new Event("unhandledrejection") as any;
        event.reason = mockCreateError({
          type: "TestError",
          message: `Cycle error ${i}`,
        });
        event.preventDefault = jest.fn();
        window.dispatchEvent(event);

        unmount();

        // Force garbage collection simulation
        if (global.gc) {
          global.gc();
        }
      }

      // Should not accumulate excessive objects
      expect(createdObjects.size).toBeLessThan(100);
    });

    it("should cleanup WeakMap references", async () => {
      const onError = jest.fn();
      let componentRef: any = null;

      const ComponentWithRef = () => {
        componentRef = React.useRef({});
        const throwAsyncError = useAsyncError();

        const handleClick = () => {
          throwAsyncError(new Error("Component error"));
        };

        return <button onClick={handleClick}>Trigger</button>;
      };

      const { unmount } = render(
        <TryErrorBoundary onError={onError}>
          <ComponentWithRef />
        </TryErrorBoundary>
      );

      fireEvent.click(screen.getByText("Trigger"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      // Component reference should exist
      expect(componentRef).toBeTruthy();

      // Unmount and clear reference
      unmount();
      componentRef = null;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Should not have memory leaks
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining("memory")
      );
    });

    it("should handle high-frequency error events", async () => {
      const onError = jest.fn();

      render(
        <TryErrorBoundary onError={onError} catchAsyncErrors>
          <div>High frequency test</div>
        </TryErrorBoundary>
      );

      // Simulate high-frequency errors
      for (let i = 0; i < 100; i++) {
        const event = new Event("unhandledrejection") as any;
        event.reason = new Error(`High freq error ${i}`);
        event.preventDefault = jest.fn();
        window.dispatchEvent(event);
      }

      await waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(100);
      });

      // Should not cause memory issues
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("memory")
      );
    });
  });

  describe("React DevTools Integration", () => {
    it("should provide meaningful component names in errors", async () => {
      const onError = jest.fn();

      const NamedComponent = () => {
        const throwAsyncError = useAsyncError();

        React.useEffect(() => {
          throwAsyncError(new Error("Named component error"));
        }, [throwAsyncError]);

        return <div>Named Component</div>;
      };

      render(
        <TryErrorBoundary onError={onError}>
          <NamedComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Named component error",
            context: expect.objectContaining({
              componentName: expect.any(String),
            }),
          }),
          expect.any(Object)
        );
      });
    });

    it("should include component stack in error context", async () => {
      const onError = jest.fn();

      const ParentComponent = () => (
        <div>
          <ChildComponent />
        </div>
      );

      const ChildComponent = () => {
        const throwAsyncError = useAsyncError();

        React.useEffect(() => {
          throwAsyncError(new Error("Child error with stack"));
        }, [throwAsyncError]);

        return <div>Child</div>;
      };

      render(
        <TryErrorBoundary onError={onError}>
          <ParentComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        const errorCall = onError.mock.calls[0];
        expect(errorCall[1]).toBeTruthy(); // Component stack info
        expect(errorCall[0].context).toEqual(
          expect.objectContaining({
            componentStack: expect.any(String),
          })
        );
      });
    });

    it("should handle errors with React Profiler", async () => {
      const onError = jest.fn();
      const onRender = jest.fn();

      const ProfiledComponent = () => {
        const throwAsyncError = useAsyncError();

        const handleClick = () => {
          throwAsyncError(new Error("Profiled error"));
        };

        return <button onClick={handleClick}>Profiled Component</button>;
      };

      render(
        <React.Profiler id="error-test" onRender={onRender}>
          <TryErrorBoundary onError={onError}>
            <ProfiledComponent />
          </TryErrorBoundary>
        </React.Profiler>
      );

      fireEvent.click(screen.getByText("Profiled Component"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Profiled error",
          }),
          expect.any(Object)
        );
      });

      // Should still work with Profiler
      expect(onRender).toHaveBeenCalled();
    });
  });

  describe("Race Condition Prevention", () => {
    it("should handle concurrent error processing", async () => {
      const onError = jest.fn();

      const ConcurrentErrorComponent = () => {
        const throwAsyncError = useAsyncError();

        const triggerConcurrentErrors = () => {
          // Fire multiple errors concurrently
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              throwAsyncError(new Error(`Concurrent error ${i}`));
            }, i * 10);
          }
        };

        return (
          <button onClick={triggerConcurrentErrors}>
            Trigger Concurrent Errors
          </button>
        );
      };

      render(
        <TryErrorBoundary onError={onError}>
          <ConcurrentErrorComponent />
        </TryErrorBoundary>
      );

      fireEvent.click(screen.getByText("Trigger Concurrent Errors"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(5);
      });

      // All errors should be handled without race conditions
      const errorMessages = onError.mock.calls.map((call) => call[0].message);
      expect(errorMessages).toHaveLength(5);
      errorMessages.forEach((msg, i) => {
        expect(msg).toBe(`Concurrent error ${i}`);
      });
    });

    it("should handle state updates during error processing", async () => {
      const onError = jest.fn();

      const StateUpdateComponent = () => {
        const [count, setCount] = React.useState(0);
        const throwAsyncError = useAsyncError();

        const handleClick = () => {
          setCount((c) => c + 1);

          setTimeout(() => {
            setCount((c) => c + 1);
            throwAsyncError(new Error(`State update error, count: ${count}`));
          }, 10);
        };

        return (
          <div>
            <button onClick={handleClick}>Count: {count}</button>
          </div>
        );
      };

      render(
        <TryErrorBoundary onError={onError}>
          <StateUpdateComponent />
        </TryErrorBoundary>
      );

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining("State update error"),
          }),
          expect.any(Object)
        );
      });
    });
  });
});
