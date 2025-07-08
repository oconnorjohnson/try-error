import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { TryErrorBoundary, useTry, useTryState } from "../../src";
import "../test-setup";

// Mock server environment detection
const mockServerEnvironment = () => {
  Object.defineProperty(window, "location", {
    value: undefined,
    writable: true,
  });

  // Mock process for server-side
  (global as any).process = {
    env: { NODE_ENV: "production" },
  };
};

const restoreClientEnvironment = () => {
  Object.defineProperty(window, "location", {
    value: {
      href: "http://localhost:3000",
      origin: "http://localhost:3000",
    },
    writable: true,
  });

  // Restore window object
  delete (global as any).process;
};

describe("SSR/Hydration Critical Edge Cases", () => {
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
    restoreClientEnvironment();
  });

  describe("Server-Client Mismatch", () => {
    it("should handle different error states between server and client", async () => {
      let serverError: any = null;
      let clientError: any = null;

      const MismatchComponent = () => {
        const { data, error, execute } = useTry(async () => {
          const isServer = typeof window === "undefined";

          if (isServer) {
            throw new Error("Server error");
          } else {
            throw new Error("Client error");
          }
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        if (error) {
          const isServer = typeof window === "undefined";
          if (isServer) {
            serverError = error;
          } else {
            clientError = error;
          }
        }

        return <div>Error: {error?.message || "No error"}</div>;
      };

      // Simulate server rendering
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <MismatchComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("Server error");
      expect(serverError?.message).toBe("Server error");

      // Simulate client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <MismatchComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(clientError?.message).toBe("Client error");
      });

      // Should handle mismatch gracefully
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("hydration")
      );
    });

    it("should handle data fetching mismatches", async () => {
      const DataMismatchComponent = () => {
        const { data, execute } = useTry(async () => {
          const isServer = typeof window === "undefined";

          if (isServer) {
            return { source: "server", data: "server-data" };
          } else {
            return { source: "client", data: "client-data" };
          }
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return (
          <div>
            <div>Source: {data?.source || "loading"}</div>
            <div>Data: {data?.data || "loading"}</div>
          </div>
        );
      };

      // Server render
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <DataMismatchComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("server-data");

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <DataMismatchComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("Source: client")).toBeInTheDocument();
        expect(screen.getByText("Data: client-data")).toBeInTheDocument();
      });
    });

    it("should handle state initialization mismatches", async () => {
      const StateMismatchComponent = () => {
        const isServer = typeof window === "undefined";

        const [state, setState] = useTryState({
          value: isServer ? "server-initial" : "client-initial",
          timestamp: Date.now(),
        });

        React.useEffect(() => {
          setState({
            value: "hydrated",
            timestamp: Date.now(),
          });
        }, [setState]);

        return <div>State: {state.value}</div>;
      };

      // Server render
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <StateMismatchComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("server-initial");

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <StateMismatchComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("State: hydrated")).toBeInTheDocument();
      });
    });

    it("should handle context mismatches", async () => {
      const ServerContext = React.createContext({ mode: "unknown" });

      const ContextMismatchComponent = () => {
        const context = React.useContext(ServerContext);
        const { data, execute } = useTry(async () => {
          return `Context mode: ${context.mode}`;
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>{data || "loading"}</div>;
      };

      // Server render with server context
      mockServerEnvironment();
      const serverHtml = renderToString(
        <ServerContext.Provider value={{ mode: "server" }}>
          <TryErrorBoundary>
            <ContextMismatchComponent />
          </TryErrorBoundary>
        </ServerContext.Provider>
      );

      expect(serverHtml).toContain("Context mode: server");

      // Client hydration with client context
      restoreClientEnvironment();
      render(
        <ServerContext.Provider value={{ mode: "client" }}>
          <TryErrorBoundary>
            <ContextMismatchComponent />
          </TryErrorBoundary>
        </ServerContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText("Context mode: client")).toBeInTheDocument();
      });
    });
  });

  describe("Environment Transition Handling", () => {
    it("should handle environment detection during hydration", async () => {
      const environments: string[] = [];

      const EnvironmentComponent = () => {
        const { data, execute } = useTry(async () => {
          const env = typeof window === "undefined" ? "server" : "client";
          environments.push(env);
          return `Environment: ${env}`;
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>{data || "detecting environment"}</div>;
      };

      // Server render
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <EnvironmentComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("Environment: server");
      expect(environments).toContain("server");

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <EnvironmentComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("Environment: client")).toBeInTheDocument();
        expect(environments).toContain("client");
      });

      // Should detect both environments
      expect(environments).toEqual(["server", "client"]);
    });

    it("should handle API availability differences", async () => {
      const ApiComponent = () => {
        const { data, error, execute } = useTry(async () => {
          // API only available in browser
          if (typeof window === "undefined") {
            throw new Error("API not available on server");
          }

          if (typeof localStorage === "undefined") {
            throw new Error("localStorage not available");
          }

          return "API available";
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        if (error) {
          return <div>Error: {error.message}</div>;
        }

        return <div>Status: {data || "checking"}</div>;
      };

      // Server render - should handle API unavailability
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <ApiComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("Error: API not available on server");

      // Client hydration - should work
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <ApiComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("Status: API available")).toBeInTheDocument();
      });
    });

    it("should handle async operations during hydration", async () => {
      const operationStates: string[] = [];

      const AsyncHydrationComponent = () => {
        const { data, execute } = useTry(async () => {
          const isServer = typeof window === "undefined";

          if (isServer) {
            // Server-side async operation
            operationStates.push("server-start");
            await new Promise((resolve) => setTimeout(resolve, 50));
            operationStates.push("server-complete");
            return "server-result";
          } else {
            // Client-side async operation
            operationStates.push("client-start");
            await new Promise((resolve) => setTimeout(resolve, 50));
            operationStates.push("client-complete");
            return "client-result";
          }
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return (
          <div>
            <div>Data: {data || "none"}</div>
          </div>
        );
      };

      // Server render
      mockServerEnvironment();
      renderToString(
        <TryErrorBoundary>
          <AsyncHydrationComponent />
        </TryErrorBoundary>
      );

      // Wait for server operation to complete
      await waitFor(() => {
        expect(operationStates).toContain("server-complete");
      });

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <AsyncHydrationComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(operationStates).toContain("client-complete");
        expect(screen.getByText("Data: client-result")).toBeInTheDocument();
      });
    });

    it("should handle configuration differences", async () => {
      const ConfigComponent = () => {
        const { data, execute } = useTry(async () => {
          const isServer = typeof window === "undefined";

          if (isServer) {
            // Server config
            return {
              env: "server",
              features: ["ssr", "static"],
              apiUrl: "http://localhost:3000",
            };
          } else {
            // Client config
            return {
              env: "client",
              features: ["csr", "interactive"],
              apiUrl: window.location.origin,
            };
          }
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return (
          <div>
            <div>Env: {data?.env || "unknown"}</div>
            <div>Features: {data?.features?.join(", ") || "none"}</div>
            <div>API: {data?.apiUrl || "unknown"}</div>
          </div>
        );
      };

      // Server render
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <ConfigComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("Env: server");
      expect(serverHtml).toContain("Features: ssr, static");

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <ConfigComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("Env: client")).toBeInTheDocument();
        expect(
          screen.getByText("Features: csr, interactive")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Hydration Error Handling", () => {
    it("should handle hydration errors gracefully", async () => {
      const onError = jest.fn();

      const HydrationErrorComponent = () => {
        const { execute } = useTry(async () => {
          const isServer = typeof window === "undefined";

          if (!isServer) {
            // Only throw on client to simulate hydration error
            throw new Error("Hydration error");
          }

          return "server-success";
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Hydration Test</div>;
      };

      // Server render - should succeed
      mockServerEnvironment();
      renderToString(
        <TryErrorBoundary onError={onError}>
          <HydrationErrorComponent />
        </TryErrorBoundary>
      );

      expect(onError).not.toHaveBeenCalled();

      // Client hydration - should handle error
      restoreClientEnvironment();
      render(
        <TryErrorBoundary onError={onError}>
          <HydrationErrorComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Hydration error",
          }),
          expect.any(Object)
        );
      });
    });

    it("should handle state hydration errors", async () => {
      const StateHydrationComponent = () => {
        const [state, setState] = useTryState(() => {
          const isServer = typeof window === "undefined";

          if (isServer) {
            return { value: "server-state", valid: true };
          } else {
            // Simulate corrupted state during hydration
            throw new Error("State hydration failed");
          }
        });

        React.useEffect(() => {
          setState({ value: "hydrated", valid: true });
        }, [setState]);

        return <div>State: {state.value}</div>;
      };

      // Server render
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <StateHydrationComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("server-state");

      // Client hydration - should handle error
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <StateHydrationComponent />
        </TryErrorBoundary>
      );

      // Should not crash during hydration
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("unhandled")
      );
    });

    it("should handle async hydration errors", async () => {
      const onError = jest.fn();

      const AsyncHydrationErrorComponent = () => {
        const { execute } = useTry(async () => {
          const isServer = typeof window === "undefined";

          if (!isServer) {
            // Simulate async error during hydration
            await new Promise((resolve) => setTimeout(resolve, 10));
            throw new Error("Async hydration error");
          }

          return "server-async-success";
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Async Hydration Test</div>;
      };

      // Server render
      mockServerEnvironment();
      renderToString(
        <TryErrorBoundary onError={onError}>
          <AsyncHydrationErrorComponent />
        </TryErrorBoundary>
      );

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary onError={onError}>
          <AsyncHydrationErrorComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Async hydration error",
          }),
          expect.any(Object)
        );
      });
    });

    it("should handle event handler hydration mismatches", async () => {
      const events: string[] = [];

      const EventComponent = () => {
        const isServer = typeof window === "undefined";
        const eventType = isServer ? "server-event" : "client-event";

        const { execute } = useTry(async () => {
          events.push(eventType);
          return `Event: ${eventType}`;
        });

        const handleEvent = () => {
          execute();
        };

        return (
          <button onClick={handleEvent}>
            {isServer ? "Server Button" : "Client Button"}
          </button>
        );
      };

      // Server render
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <EventComponent />
        </TryErrorBoundary>
      );

      expect(serverHtml).toContain("Server Button");

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <EventComponent />
        </TryErrorBoundary>
      );

      // Should hydrate to client version
      await waitFor(() => {
        expect(screen.getByText("Client Button")).toBeInTheDocument();
      });
    });
  });

  describe("Cross-Environment Consistency", () => {
    it("should maintain error format consistency", async () => {
      const errors: any[] = [];

      const ConsistentErrorComponent = () => {
        const { execute } = useTry(async () => {
          throw new Error("Consistent error");
        });

        React.useEffect(() => {
          execute().catch((error) => {
            errors.push(error);
          });
        }, [execute]);

        return <div>Consistent Error Test</div>;
      };

      // Server render
      mockServerEnvironment();
      renderToString(
        <TryErrorBoundary>
          <ConsistentErrorComponent />
        </TryErrorBoundary>
      );

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <ConsistentErrorComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(errors.length).toBe(2);
      });

      // Both errors should have consistent format
      expect(errors[0].message).toBe("Consistent error");
      expect(errors[1].message).toBe("Consistent error");
    });

    it("should handle serialization across environments", async () => {
      const SerializationComponent = () => {
        const { data, execute } = useTry(async () => {
          const result = {
            id: 1,
            name: "test",
            timestamp: Date.now(),
            nested: {
              value: "nested-value",
              array: [1, 2, 3],
            },
          };

          // Simulate serialization/deserialization
          return JSON.parse(JSON.stringify(result));
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return (
          <div>
            <div>ID: {data?.id || "none"}</div>
            <div>Name: {data?.name || "none"}</div>
            <div>Nested: {data?.nested?.value || "none"}</div>
          </div>
        );
      };

      // Server render
      mockServerEnvironment();
      const serverHtml = renderToString(
        <TryErrorBoundary>
          <SerializationComponent />
        </TryErrorBoundary>
      );

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <SerializationComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("ID: 1")).toBeInTheDocument();
        expect(screen.getByText("Name: test")).toBeInTheDocument();
        expect(screen.getByText("Nested: nested-value")).toBeInTheDocument();
      });
    });

    it("should handle timing differences between environments", async () => {
      const timings: number[] = [];

      const TimingComponent = () => {
        const { execute } = useTry(async () => {
          const start = Date.now();
          await new Promise((resolve) => setTimeout(resolve, 50));
          const end = Date.now();
          const duration = end - start;
          timings.push(duration);
          return duration;
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Timing Test</div>;
      };

      // Server render
      mockServerEnvironment();
      renderToString(
        <TryErrorBoundary>
          <TimingComponent />
        </TryErrorBoundary>
      );

      // Client hydration
      restoreClientEnvironment();
      render(
        <TryErrorBoundary>
          <TimingComponent />
        </TryErrorBoundary>
      );

      await waitFor(() => {
        expect(timings.length).toBe(2);
      });

      // Both timings should be reasonable
      expect(timings[0]).toBeGreaterThan(40);
      expect(timings[1]).toBeGreaterThan(40);
    });
  });
});
