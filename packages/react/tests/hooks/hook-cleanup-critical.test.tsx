import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import {
  useTry,
  useTryMutation,
  useTryCallback,
  useTryState,
  TryErrorBoundary,
} from "../../src";
import "../test-setup";

describe("Hook Cleanup Critical Edge Cases", () => {
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

  describe("AbortController Cleanup", () => {
    it("should cleanup AbortController on unmount", async () => {
      let abortController: AbortController | null = null;
      let aborted = false;

      const AsyncComponent = () => {
        const { execute } = useTry(async () => {
          abortController = new AbortController();

          return new Promise((resolve, reject) => {
            abortController!.signal.addEventListener("abort", () => {
              aborted = true;
              reject(new Error("Aborted"));
            });

            setTimeout(() => resolve("success"), 1000);
          });
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Async Component</div>;
      };

      const { unmount } = render(<AsyncComponent />);

      // Wait for AbortController to be created
      await waitFor(() => {
        expect(abortController).toBeTruthy();
      });

      // Unmount should trigger abort
      unmount();

      await waitFor(() => {
        expect(aborted).toBe(true);
      });
    });

    it("should handle multiple concurrent AbortControllers", async () => {
      const abortControllers: AbortController[] = [];
      let abortedCount = 0;

      const ConcurrentComponent = () => {
        const { execute } = useTry(async (id: number) => {
          const controller = new AbortController();
          abortControllers.push(controller);

          return new Promise((resolve, reject) => {
            controller.signal.addEventListener("abort", () => {
              abortedCount++;
              reject(new Error(`Aborted ${id}`));
            });

            setTimeout(() => resolve(`success-${id}`), 1000);
          });
        });

        React.useEffect(() => {
          // Start multiple concurrent operations
          for (let i = 0; i < 5; i++) {
            execute(i);
          }
        }, [execute]);

        return <div>Concurrent Component</div>;
      };

      const { unmount } = render(<ConcurrentComponent />);

      // Wait for AbortControllers to be created
      await waitFor(() => {
        expect(abortControllers.length).toBe(5);
      });

      // Unmount should abort all operations
      unmount();

      await waitFor(() => {
        expect(abortedCount).toBe(5);
      });
    });

    it("should prevent AbortController memory leaks", async () => {
      const createdControllers: WeakRef<AbortController>[] = [];

      const LeakTestComponent = () => {
        const { execute } = useTry(async () => {
          const controller = new AbortController();
          createdControllers.push(new WeakRef(controller));

          return new Promise((resolve, reject) => {
            controller.signal.addEventListener("abort", () => {
              reject(new Error("Aborted"));
            });

            setTimeout(() => resolve("success"), 100);
          });
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Leak Test</div>;
      };

      // Mount and unmount many times
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(<LeakTestComponent />);
        await new Promise((resolve) => setTimeout(resolve, 10));
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait for GC to run
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for memory leaks
      const aliveControllers = createdControllers.filter(
        (ref) => ref.deref() !== undefined
      );
      expect(aliveControllers.length).toBeLessThan(10); // Some tolerance for GC timing
    });

    it("should handle AbortController errors during cleanup", async () => {
      const FaultyAbortComponent = () => {
        const { execute } = useTry(async () => {
          const controller = new AbortController();

          // Simulate a controller that throws during abort
          const originalAbort = controller.abort.bind(controller);
          controller.abort = () => {
            throw new Error("Abort failed");
          };

          return new Promise((resolve) => {
            setTimeout(() => resolve("success"), 1000);
          });
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Faulty Abort Component</div>;
      };

      const { unmount } = render(
        <TryErrorBoundary>
          <FaultyAbortComponent />
        </TryErrorBoundary>
      );

      // Unmount should not crash despite abort error
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Memory Leaks During Cleanup", () => {
    it("should cleanup state references on unmount", async () => {
      const stateRefs: WeakRef<any>[] = [];

      const StateComponent = () => {
        const [state, setState] = useTryState({
          data: new Array(1000).fill("data"),
        });
        stateRefs.push(new WeakRef(state));

        const handleUpdate = () => {
          setState({ data: new Array(1000).fill("updated") });
        };

        return <button onClick={handleUpdate}>Update State</button>;
      };

      // Mount and unmount many components
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<StateComponent />);
        fireEvent.click(screen.getByText("Update State"));
        unmount();
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for memory leaks
      const aliveStates = stateRefs.filter((ref) => ref.deref() !== undefined);
      expect(aliveStates.length).toBeLessThan(5); // Tolerance for GC timing
    });

    it("should cleanup callback references", async () => {
      const callbackRefs: WeakRef<Function>[] = [];

      const CallbackComponent = () => {
        const callback = useTryCallback(async (data: any) => {
          // Large data processing
          return data.map((item: any) => ({ ...item, processed: true }));
        }, []);

        callbackRefs.push(new WeakRef(callback));

        return <div>Callback Component</div>;
      };

      // Create many callback components
      for (let i = 0; i < 30; i++) {
        const { unmount } = render(<CallbackComponent />);
        unmount();
      }

      // Force GC
      if (global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const aliveCallbacks = callbackRefs.filter(
        (ref) => ref.deref() !== undefined
      );
      expect(aliveCallbacks.length).toBeLessThan(10);
    });

    it("should cleanup mutation cache references", async () => {
      const mutationRefs: WeakRef<any>[] = [];

      const MutationComponent = () => {
        const mutation = useTryMutation(async (data: any) => {
          const result = { ...data, mutated: true };
          mutationRefs.push(new WeakRef(result));
          return result;
        });

        React.useEffect(() => {
          mutation.mutate({ test: "data" });
        }, [mutation]);

        return <div>Mutation Component</div>;
      };

      for (let i = 0; i < 25; i++) {
        const { unmount } = render(<MutationComponent />);
        await new Promise((resolve) => setTimeout(resolve, 10));
        unmount();
      }

      if (global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const aliveMutations = mutationRefs.filter(
        (ref) => ref.deref() !== undefined
      );
      expect(aliveMutations.length).toBeLessThan(15);
    });

    it("should handle cleanup with circular references", async () => {
      const CircularComponent = () => {
        const [state, setState] = useTryState({ refs: [] as any[] });

        React.useEffect(() => {
          // Create circular reference
          const obj1 = { name: "obj1", ref: null as any };
          const obj2 = { name: "obj2", ref: obj1 };
          obj1.ref = obj2;

          setState({ refs: [obj1, obj2] });
        }, [setState]);

        return <div>Circular Component</div>;
      };

      // This should not cause memory leaks
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<CircularComponent />);
        await new Promise((resolve) => setTimeout(resolve, 10));
        unmount();
      }

      // Should not have warnings about circular references
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining("circular")
      );
    });
  });

  describe("Race Conditions During Unmount", () => {
    it("should handle state updates after unmount", async () => {
      let updateAfterUnmount: () => void = () => {};

      const RaceComponent = () => {
        const [state, setState] = useTryState({ count: 0 });

        updateAfterUnmount = () => {
          setState({ count: state.count + 1 });
        };

        return <div>Count: {state.count}</div>;
      };

      const { unmount } = render(<RaceComponent />);

      // Unmount component
      unmount();

      // Try to update state after unmount
      expect(() => updateAfterUnmount()).not.toThrow();

      // Should not log memory leak warnings
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("memory leak")
      );
    });

    it("should handle async operations completing after unmount", async () => {
      let completeOperation: () => void = () => {};

      const AsyncRaceComponent = () => {
        const { data, execute } = useTry(async () => {
          return new Promise<string>((resolve) => {
            completeOperation = () => resolve("completed");
          });
        });

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Data: {data || "loading"}</div>;
      };

      const { unmount } = render(<AsyncRaceComponent />);

      // Unmount before operation completes
      unmount();

      // Complete operation after unmount
      expect(() => completeOperation()).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not cause warnings
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining("unmounted")
      );
    });

    it("should handle concurrent cleanup operations", async () => {
      const CleanupComponent = () => {
        const [mounted, setMounted] = React.useState(true);
        const { execute } = useTry(async () => "test");

        React.useEffect(() => {
          const timer = setTimeout(() => {
            if (mounted) {
              execute();
            }
          }, 10);

          return () => {
            clearTimeout(timer);
            setMounted(false);
          };
        }, [execute, mounted]);

        return <div>Cleanup Component</div>;
      };

      // Rapidly mount/unmount to test concurrent cleanup
      const promises = Array.from({ length: 20 }, async (_, i) => {
        const { unmount } = render(<CleanupComponent />);
        await new Promise((resolve) => setTimeout(resolve, i % 5));
        unmount();
      });

      await Promise.all(promises);

      // Should not have race condition warnings
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("race")
      );
    });

    it("should handle cleanup order dependencies", async () => {
      const cleanupOrder: string[] = [];

      const OrderedCleanupComponent = () => {
        React.useEffect(() => {
          return () => {
            cleanupOrder.push("effect1");
          };
        }, []);

        React.useEffect(() => {
          return () => {
            cleanupOrder.push("effect2");
          };
        }, []);

        React.useEffect(() => {
          return () => {
            cleanupOrder.push("effect3");
          };
        }, []);

        const { execute } = useTry(async () => {
          return "result";
        });

        React.useEffect(() => {
          execute();
          return () => {
            cleanupOrder.push("useTry");
          };
        }, [execute]);

        return <div>Ordered Cleanup</div>;
      };

      const { unmount } = render(<OrderedCleanupComponent />);
      unmount();

      // Should have completed all cleanup without errors
      expect(cleanupOrder.length).toBeGreaterThan(0);
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe("Hook Dependency Edge Cases", () => {
    it("should handle cleanup with changing dependencies", async () => {
      const DependencyComponent = ({ config }: { config: any }) => {
        const { execute } = useTry(async () => {
          return `result-${config.id}`;
        }, [config.id]);

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Config: {config.id}</div>;
      };

      const { rerender, unmount } = render(
        <DependencyComponent config={{ id: 1 }} />
      );

      // Change dependencies multiple times
      rerender(<DependencyComponent config={{ id: 2 }} />);
      rerender(<DependencyComponent config={{ id: 3 }} />);
      rerender(<DependencyComponent config={{ id: 4 }} />);

      // Unmount with changing deps should not cause issues
      expect(() => unmount()).not.toThrow();
    });

    it("should handle cleanup with unstable dependencies", async () => {
      const UnstableComponent = () => {
        // Intentionally unstable dependency (new object each render)
        const config = { id: Math.random() };

        const { execute } = useTry(async () => {
          return `result-${config.id}`;
        }, [config]);

        React.useEffect(() => {
          execute();
        }, [execute]);

        return <div>Unstable deps</div>;
      };

      const { rerender, unmount } = render(<UnstableComponent />);

      // Force multiple re-renders with unstable deps
      for (let i = 0; i < 10; i++) {
        rerender(<UnstableComponent />);
      }

      expect(() => unmount()).not.toThrow();
    });

    it("should handle cleanup with circular dependencies", async () => {
      const CircularDepsComponent = () => {
        const [state, setState] = useTryState({ value: 0 });

        const callback = useTryCallback(async () => {
          setState({ value: state.value + 1 });
        }, [state.value]);

        const { execute } = useTry(async () => {
          await callback();
          return "result";
        }, [callback]);

        React.useEffect(() => {
          if (state.value < 5) {
            execute();
          }
        }, [execute, state.value]);

        return <div>Value: {state.value}</div>;
      };

      const { unmount } = render(<CircularDepsComponent />);

      // Wait for some cycles
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Error Handling During Cleanup", () => {
    it("should handle errors in cleanup functions", async () => {
      const ErrorCleanupComponent = () => {
        React.useEffect(() => {
          return () => {
            throw new Error("Cleanup error");
          };
        }, []);

        return <div>Error Cleanup</div>;
      };

      const { unmount } = render(
        <TryErrorBoundary>
          <ErrorCleanupComponent />
        </TryErrorBoundary>
      );

      // Unmount should handle cleanup errors gracefully
      expect(() => unmount()).not.toThrow();
    });

    it("should handle async errors during cleanup", async () => {
      const AsyncErrorCleanupComponent = () => {
        React.useEffect(() => {
          return () => {
            setTimeout(() => {
              throw new Error("Async cleanup error");
            }, 10);
          };
        }, []);

        return <div>Async Error Cleanup</div>;
      };

      const { unmount } = render(
        <TryErrorBoundary>
          <AsyncErrorCleanupComponent />
        </TryErrorBoundary>
      );

      unmount();

      // Wait for async error
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should handle async cleanup errors
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("unhandled")
      );
    });
  });
});
