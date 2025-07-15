import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { TryErrorBoundary, useTry, useTryState } from "../../src";
import "../test-setup";

describe("SSR/Hydration Integration Tests", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic SSR/Hydration Functionality", () => {
    it("should handle server-side rendering with useTry", async () => {
      const TestComponent = () => {
        const { data, isLoading } = useTry(
          async () => {
            return "SSR data";
          },
          { immediate: true, deps: [] }
        );

        return (
          <div data-testid="content">
            {isLoading ? "Loading..." : data || "No data"}
          </div>
        );
      };

      // Server render should handle initial state (no async execution)
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <TestComponent />
        </TryErrorBoundary>
      );

      // Server should render initial state (no async execution in renderToString)
      expect(serverHtml).toContain("No data");

      // Client should eventually show data
      render(
        <TryErrorBoundary>
          <TestComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("content")).toHaveTextContent("SSR data");
      });
    });

    it("should handle server-side rendering with TryErrorBoundary", async () => {
      const ErrorComponent = () => {
        const { data, error } = useTry(
          async () => {
            throw new Error("Test error");
          },
          { immediate: true, deps: [] }
        );

        if (error) {
          return <div data-testid="error">Error: {error.message}</div>;
        }

        return <div data-testid="content">{data || "Loading..."}</div>;
      };

      const onError = jest.fn();

      // Server render should handle initial state (no async execution)
      const serverHtml = renderToString(
        <TryErrorBoundary onError={onError}>
          <ErrorComponent />
        </TryErrorBoundary>
      );

      // Server should render initial state (no async execution in renderToString)
      expect(serverHtml).toContain("Loading...");

      // Client should handle error
      render(
        <TryErrorBoundary onError={onError}>
          <ErrorComponent />
        </TryErrorBoundary>
      );

      // Error should be caught and displayed
      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Test error"
        );
      });

      // Note: TryErrorBoundary onError is not called because useTry handles errors internally
      // and doesn't throw them to the error boundary
      expect(onError).not.toHaveBeenCalled();
    });

    it("should handle useTryState with SSR", async () => {
      const StateComponent = () => {
        const [state, setState] = useTryState({
          count: 0,
          message: "initial",
        });

        React.useEffect(() => {
          setState({ count: 1, message: "hydrated" });
        }, [setState]);

        return (
          <div data-testid="state">
            Count: {state.count}, Message: {state.message}
          </div>
        );
      };

      // Server render should handle initial state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <StateComponent />
        </TryErrorBoundary>
      );

      // Server should render initial state (with React comment nodes)
      expect(serverHtml).toContain("Count:");
      expect(serverHtml).toContain("0");
      expect(serverHtml).toContain("Message:");
      expect(serverHtml).toContain("initial");

      // Client should update after hydration
      render(
        <TryErrorBoundary>
          <StateComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("state")).toHaveTextContent(
          "Count: 1, Message: hydrated"
        );
      });
    });
  });

  describe("Environment Detection", () => {
    it("should properly detect client environment", async () => {
      const environments: string[] = [];

      const EnvironmentComponent = () => {
        const { data } = useTry(
          async () => {
            const env = typeof window === "undefined" ? "server" : "client";
            environments.push(env);
            return `Environment: ${env}`;
          },
          { immediate: true, deps: [] }
        );

        return <div data-testid="env">{data || "detecting..."}</div>;
      };

      // Test client environment
      render(
        <TryErrorBoundary>
          <EnvironmentComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("env")).toHaveTextContent(
          "Environment: client"
        );
      });

      // Should have detected client environment
      expect(environments).toContain("client");
    });

    it("should handle API differences between environments", async () => {
      const ApiComponent = () => {
        const { data } = useTry(
          async () => {
            // Test browser-specific API
            if (typeof window === "undefined") {
              return "Server: No browser APIs";
            }

            if (typeof localStorage === "undefined") {
              return "Client: No localStorage";
            }

            return "Client: Full API access";
          },
          { immediate: true, deps: [] }
        );

        return <div data-testid="api">{data || "Loading..."}</div>;
      };

      // Server render should handle loading state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <ApiComponent />
        </TryErrorBoundary>
      );

      // Server should render loading state initially
      expect(serverHtml).toContain("Loading...");

      // Client should have API access
      render(
        <TryErrorBoundary>
          <ApiComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("api")).toHaveTextContent(
          "Client: Full API access"
        );
      });
    });
  });

  describe("Error Handling Across Environments", () => {
    it("should handle errors consistently across server and client", async () => {
      const errors: any[] = [];

      const ErrorComponent = () => {
        const { data, error } = useTry(
          async () => {
            const errorMessage = "Consistent error message";
            throw new Error(errorMessage);
          },
          { immediate: true, deps: [] }
        );

        React.useEffect(() => {
          if (error) {
            errors.push(error);
          }
        }, [error]);

        return (
          <div data-testid="error">
            {error ? `Error: ${error.message}` : data || "Loading..."}
          </div>
        );
      };

      // Server render should handle loading state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <ErrorComponent />
        </TryErrorBoundary>
      );

      // Server should render loading state initially
      expect(serverHtml).toContain("Loading...");

      // Client should handle error
      render(
        <TryErrorBoundary>
          <ErrorComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Consistent error message"
        );
      });

      // Should have captured error
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Consistent error message");
    });

    it("should handle async errors during hydration", async () => {
      const onError = jest.fn();

      const AsyncErrorComponent = () => {
        const { data, error } = useTry(
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            throw new Error("Async hydration error");
          },
          { immediate: true, deps: [] }
        );

        return (
          <div data-testid="async-error">
            {error ? `Error: ${error.message}` : data || "Loading..."}
          </div>
        );
      };

      // Server render should handle initial state (no async execution)
      const serverHtml = renderToString(
        <TryErrorBoundary onError={onError}>
          <AsyncErrorComponent />
        </TryErrorBoundary>
      );

      // Server should render initial state (no async execution in renderToString)
      expect(serverHtml).toContain("Loading...");

      // Client should handle error
      render(
        <TryErrorBoundary onError={onError}>
          <AsyncErrorComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("async-error")).toHaveTextContent(
          "Error: Async hydration error"
        );
      });

      // Note: TryErrorBoundary onError is not called because useTry handles errors internally
      // and doesn't throw them to the error boundary
      expect(onError).not.toHaveBeenCalled();
    });

    it("should handle state initialization errors", async () => {
      const StateErrorComponent = () => {
        const [state, setState] = useTryState(() => {
          // This will work in both server and client environments
          return {
            initialized: true,
            env: typeof window === "undefined" ? "server" : "client",
          };
        });

        React.useEffect(() => {
          setState({ initialized: true, env: "client-updated" });
        }, [setState]);

        return (
          <div data-testid="state-error">
            Initialized: {state.initialized ? "true" : "false"}, Env:{" "}
            {state.env}
          </div>
        );
      };

      // Server render should handle initial state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <StateErrorComponent />
        </TryErrorBoundary>
      );

      // Should handle state initialization properly (with React comment nodes)
      expect(serverHtml).toContain("Initialized:");
      expect(serverHtml).toContain("true");
      expect(serverHtml).toContain("Env:");
      expect(serverHtml).toContain("client");

      // Client should update after hydration
      render(
        <TryErrorBoundary>
          <StateErrorComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("state-error")).toHaveTextContent(
          "Initialized: true, Env: client-updated"
        );
      });
    });
  });

  describe("Data Serialization", () => {
    it("should handle complex data serialization across environments", async () => {
      const SerializationComponent = () => {
        const { data } = useTry(
          async () => {
            const complexData = {
              id: 1,
              name: "test",
              timestamp: Date.now(),
              nested: {
                value: "nested-value",
                array: [1, 2, 3],
                boolean: true,
              },
            };

            // Simulate serialization/deserialization like Next.js does
            return JSON.parse(JSON.stringify(complexData));
          },
          { immediate: true, deps: [] }
        );

        return (
          <div data-testid="serialization">
            {data ? (
              <div>
                <span>ID: {data.id}</span>
                <span>Name: {data.name}</span>
                <span>Nested: {data.nested.value}</span>
                <span>Array: {data.nested.array.join(",")}</span>
                <span>Boolean: {data.nested.boolean.toString()}</span>
              </div>
            ) : (
              "Loading..."
            )}
          </div>
        );
      };

      // Server render should handle loading state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <SerializationComponent />
        </TryErrorBoundary>
      );

      // Server should render loading state initially
      expect(serverHtml).toContain("Loading...");

      // Client should handle serialization
      render(
        <TryErrorBoundary>
          <SerializationComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        const element = screen.getByTestId("serialization");
        expect(element).toHaveTextContent("ID: 1");
        expect(element).toHaveTextContent("Name: test");
        expect(element).toHaveTextContent("Nested: nested-value");
        expect(element).toHaveTextContent("Array: 1,2,3");
        expect(element).toHaveTextContent("Boolean: true");
      });
    });
  });

  describe("Next.js Integration Patterns", () => {
    it("should simulate server-side props data handling", async () => {
      const ServerPropsComponent = ({
        message,
        timestamp,
      }: {
        message: string;
        timestamp: number;
      }) => {
        const { data } = useTry(
          async () => {
            return `${message} (${timestamp})`;
          },
          { immediate: true, deps: [message, timestamp] }
        );

        return <div data-testid="server-props">{data || "Loading..."}</div>;
      };

      const serverSideData = {
        message: "Server-side data",
        timestamp: Date.now(),
      };

      // Server render should handle loading state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <ServerPropsComponent {...serverSideData} />
        </TryErrorBoundary>
      );

      // Server should render loading state initially
      expect(serverHtml).toContain("Loading...");

      // Client should handle props
      render(
        <TryErrorBoundary>
          <ServerPropsComponent {...serverSideData} />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("server-props")).toHaveTextContent(
          "Server-side data"
        );
      });
    });

    it("should handle dynamic imports and code splitting", async () => {
      const DynamicComponent = () => {
        const { data } = useTry(
          async () => {
            // Simulate dynamic import
            const module = await Promise.resolve({
              default: () => "Dynamic content loaded",
            });
            return module.default();
          },
          { immediate: true, deps: [] }
        );

        return (
          <div data-testid="dynamic">
            {data || "Loading dynamic content..."}
          </div>
        );
      };

      // Server render should handle loading state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <DynamicComponent />
        </TryErrorBoundary>
      );

      // Server should render loading state initially
      expect(serverHtml).toContain("Loading dynamic content...");

      // Client should handle dynamic loading
      render(
        <TryErrorBoundary>
          <DynamicComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("dynamic")).toHaveTextContent(
          "Dynamic content loaded"
        );
      });
    });
  });

  describe("Performance and Optimization", () => {
    it("should handle concurrent rendering patterns", async () => {
      const ConcurrentComponent = () => {
        const { data: data1 } = useTry(
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return "First data";
          },
          { immediate: true, deps: [] }
        );

        const { data: data2 } = useTry(
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 20));
            return "Second data";
          },
          { immediate: true, deps: [] }
        );

        return (
          <div data-testid="concurrent">
            <div>Data 1: {data1 || "Loading..."}</div>
            <div>Data 2: {data2 || "Loading..."}</div>
          </div>
        );
      };

      // Server render should handle loading state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <ConcurrentComponent />
        </TryErrorBoundary>
      );

      // Server should render loading state initially
      expect(serverHtml).toContain("Loading...");

      // Client should handle concurrent loading
      render(
        <TryErrorBoundary>
          <ConcurrentComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("concurrent")).toHaveTextContent(
          "Data 1: First data"
        );
        expect(screen.getByTestId("concurrent")).toHaveTextContent(
          "Data 2: Second data"
        );
      });
    });

    it("should handle memory cleanup during hydration", async () => {
      const cleanupSpy = jest.fn();

      const CleanupComponent = () => {
        const { data } = useTry(
          async () => {
            return "Cleanup test data";
          },
          { immediate: true, deps: [] }
        );

        React.useEffect(() => {
          return () => {
            cleanupSpy();
          };
        }, []);

        return <div data-testid="cleanup">{data || "Loading..."}</div>;
      };

      // Server render should handle loading state
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <CleanupComponent />
        </TryErrorBoundary>
      );

      // Server should render loading state initially
      expect(serverHtml).toContain("Loading...");

      // Client should handle cleanup
      const { unmount } = render(
        <TryErrorBoundary>
          <CleanupComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId("cleanup")).toHaveTextContent(
          "Cleanup test data"
        );
      });

      // Unmount to trigger cleanup
      unmount();

      expect(cleanupSpy).toHaveBeenCalled();
    });
  });
});
