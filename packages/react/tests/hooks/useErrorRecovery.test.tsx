import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useErrorRecovery,
  useExponentialBackoff,
  useBulkhead,
} from "../../src/hooks/useErrorRecovery";
import { createError } from "try-error";

describe("useErrorRecovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("circuit breaker", () => {
    it("should open circuit after failure threshold", async () => {
      const onOpen = jest.fn();
      const onClose = jest.fn();
      const failingFn = jest.fn().mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useErrorRecovery({
          circuitBreaker: {
            failureThreshold: 3,
            resetTimeout: 5000,
            onOpen,
            onClose,
          },
          retry: {
            maxRetries: 0, // No retries for this test
          },
        })
      );

      // First 3 failures should open the circuit
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          try {
            await result.current.execute(failingFn);
          } catch (error) {
            // Expected to fail
          }
        });
      }

      expect(result.current.circuitState).toBe("OPEN");
      expect(result.current.consecutiveFailures).toBe(3);
      expect(onOpen).toHaveBeenCalledTimes(1);

      // Next call should fail immediately without calling the function
      await act(async () => {
        try {
          await result.current.execute(failingFn);
        } catch (error: any) {
          expect(error.type).toBe("CIRCUIT_OPEN");
        }
      });

      expect(failingFn).toHaveBeenCalledTimes(3); // Not called on 4th attempt
    });

    it("should transition to half-open after reset timeout", async () => {
      const onHalfOpen = jest.fn();
      const failingFn = jest.fn().mockRejectedValue(new Error("Error"));

      const { result } = renderHook(() =>
        useErrorRecovery({
          circuitBreaker: {
            failureThreshold: 1,
            resetTimeout: 5000,
            onHalfOpen,
          },
          retry: {
            maxRetries: 0,
          },
        })
      );

      // Open the circuit
      await act(async () => {
        try {
          await result.current.execute(failingFn);
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.circuitState).toBe("OPEN");

      // Fast-forward to reset timeout
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.circuitState).toBe("HALF_OPEN");
        expect(onHalfOpen).toHaveBeenCalledTimes(1);
      });
    });

    it("should close circuit on successful call in half-open state", async () => {
      const onClose = jest.fn();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Error"))
        .mockResolvedValueOnce("success");

      const { result } = renderHook(() =>
        useErrorRecovery({
          circuitBreaker: {
            failureThreshold: 1,
            resetTimeout: 1000,
            onClose,
          },
          retry: {
            maxRetries: 0,
          },
        })
      );

      // Open the circuit
      await act(async () => {
        try {
          await result.current.execute(fn);
        } catch (error) {
          // Expected
        }
      });

      // Wait for half-open
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Successful call should close the circuit
      await act(async () => {
        const result2 = await result.current.execute(fn);
        expect(result2).toBe("success");
      });

      expect(result.current.circuitState).toBe("CLOSED");
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should use custom shouldTrip function", async () => {
      const shouldTrip = jest.fn((error) => error.type === "NETWORK_ERROR");
      const fn = jest
        .fn()
        .mockRejectedValue(
          createError({ type: "VALIDATION_ERROR", message: "Invalid input" })
        );

      const { result } = renderHook(() =>
        useErrorRecovery({
          circuitBreaker: {
            failureThreshold: 1,
            shouldTrip,
          },
          retry: {
            maxRetries: 0,
          },
        })
      );

      // This error should not trip the circuit
      await act(async () => {
        try {
          await result.current.execute(fn);
        } catch (error) {
          // Expected
        }
      });

      expect(shouldTrip).toHaveBeenCalled();
      expect(result.current.circuitState).toBe("CLOSED");
      expect(result.current.consecutiveFailures).toBe(0);
    });
  });

  describe("retry strategy", () => {
    it("should retry failed operations", async () => {
      let attempts = 0;
      const fn = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error(`Attempt ${attempts} failed`);
        }
        return "success";
      });

      const onRetry = jest.fn();

      const { result } = renderHook(() =>
        useErrorRecovery({
          retry: {
            maxRetries: 3,
            retryDelay: 10,
            onRetry,
          },
        })
      );

      const outcome = await act(async () => {
        return await result.current.execute(fn);
      });

      expect(outcome).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2); // Called on retry, not initial attempt
      expect(result.current.recoveryAttempts).toBe(2);
    });

    it("should use custom retry delay function", async () => {
      const delays: number[] = [];
      let lastTime = Date.now();

      const fn = jest.fn().mockImplementation(async () => {
        const now = Date.now();
        if (delays.length > 0) {
          delays.push(now - lastTime);
        }
        lastTime = now;
        if (delays.length < 2) {
          throw new Error("Retry");
        }
        return "success";
      });

      const { result } = renderHook(() =>
        useErrorRecovery({
          retry: {
            maxRetries: 3,
            retryDelay: (attempt) => attempt * 100,
          },
        })
      );

      jest.useRealTimers(); // Need real timers for this test

      await act(async () => {
        await result.current.execute(fn);
      });

      // Verify delays are approximately correct (with some tolerance)
      expect(delays[0]).toBeGreaterThanOrEqual(90);
      expect(delays[0]).toBeLessThan(150);
      expect(delays[1]).toBeGreaterThanOrEqual(190);
      expect(delays[1]).toBeLessThan(250);
    });

    it("should respect shouldRetry function", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(
          createError({ type: "RETRY_ME", message: "Retry" })
        )
        .mockRejectedValueOnce(
          createError({ type: "DONT_RETRY", message: "Stop" })
        );

      const shouldRetry = jest.fn((error) => error.type === "RETRY_ME");

      const { result } = renderHook(() =>
        useErrorRecovery({
          retry: {
            maxRetries: 3,
            retryDelay: 10,
            shouldRetry,
          },
        })
      );

      await act(async () => {
        try {
          await result.current.execute(fn);
        } catch (error: any) {
          expect(error.type).toBe("DONT_RETRY");
        }
      });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(shouldRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe("fallback", () => {
    it("should use fallback when main function fails", async () => {
      const mainFn = jest.fn().mockRejectedValue(new Error("Main failed"));
      const fallback = jest.fn().mockResolvedValue("fallback result");

      const { result } = renderHook(() =>
        useErrorRecovery({
          fallback,
          retry: {
            maxRetries: 0,
          },
        })
      );

      const outcome = await act(async () => {
        return await result.current.execute(mainFn);
      });

      expect(outcome).toBe("fallback result");
      expect(mainFn).toHaveBeenCalledTimes(1);
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it("should use fallback when circuit is open", async () => {
      const mainFn = jest.fn().mockRejectedValue(new Error("Error"));
      const fallback = jest.fn().mockResolvedValue("fallback result");

      const { result } = renderHook(() =>
        useErrorRecovery({
          circuitBreaker: {
            failureThreshold: 1,
          },
          fallback,
          retry: {
            maxRetries: 0,
          },
        })
      );

      // Open the circuit
      await act(async () => {
        try {
          await result.current.execute(mainFn);
        } catch (error) {
          // Expected
        }
      });

      // Next call should use fallback
      const outcome = await act(async () => {
        return await result.current.execute(mainFn);
      });

      expect(outcome).toBe("fallback result");
      expect(mainFn).toHaveBeenCalledTimes(1); // Not called when circuit is open
    });

    it("should throw original error if fallback also fails", async () => {
      const mainFn = jest.fn().mockRejectedValue(new Error("Main failed"));
      const fallback = jest
        .fn()
        .mockRejectedValue(new Error("Fallback failed"));

      const { result } = renderHook(() =>
        useErrorRecovery({
          fallback,
          retry: {
            maxRetries: 0,
          },
        })
      );

      await act(async () => {
        try {
          await result.current.execute(mainFn);
        } catch (error: any) {
          expect(error.message).toBe("Main failed");
        }
      });

      expect(fallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("timeout", () => {
    it("should timeout long-running operations", async () => {
      const fn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return "success";
      });

      const { result } = renderHook(() =>
        useErrorRecovery({
          timeout: 1000,
          retry: {
            maxRetries: 0,
          },
        })
      );

      jest.useRealTimers();

      await act(async () => {
        try {
          await result.current.execute(fn);
        } catch (error: any) {
          expect(error.type).toBe("TIMEOUT_ERROR");
          expect(error.message).toContain("1000ms");
        }
      });
    });
  });

  describe("callbacks", () => {
    it("should call onError and onRecover callbacks", async () => {
      const onError = jest.fn();
      const onRecover = jest.fn();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Error"))
        .mockResolvedValueOnce("success");

      const { result } = renderHook(() =>
        useErrorRecovery({
          retry: {
            maxRetries: 1,
            retryDelay: 10,
          },
          onError,
          onRecover,
        })
      );

      const outcome = await act(async () => {
        return await result.current.execute(fn);
      });

      expect(outcome).toBe("success");
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onRecover).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset", () => {
    it("should reset all state", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("Error"));

      const { result } = renderHook(() =>
        useErrorRecovery({
          circuitBreaker: {
            failureThreshold: 1,
          },
          retry: {
            maxRetries: 0,
          },
        })
      );

      // Cause a failure
      await act(async () => {
        try {
          await result.current.execute(fn);
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.circuitState).toBe("OPEN");
      expect(result.current.consecutiveFailures).toBe(1);
      expect(result.current.lastError).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.circuitState).toBe("CLOSED");
      expect(result.current.consecutiveFailures).toBe(0);
      expect(result.current.lastError).toBeNull();
      expect(result.current.isRecovering).toBe(false);
    });
  });
});

describe("useExponentialBackoff", () => {
  it("should implement exponential backoff with jitter", async () => {
    const delays: number[] = [];
    let lastTime = Date.now();

    const fn = jest.fn().mockImplementation(async () => {
      const now = Date.now();
      if (delays.length > 0) {
        delays.push(now - lastTime);
      }
      lastTime = now;
      if (delays.length < 3) {
        throw new Error("Retry");
      }
      return "success";
    });

    const { result } = renderHook(() =>
      useExponentialBackoff({
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 1000,
        factor: 2,
        jitter: true,
      })
    );

    jest.useRealTimers();

    await act(async () => {
      await result.execute(fn);
    });

    // Verify exponential increase with jitter
    // First retry: ~100ms (75-125ms with jitter)
    expect(delays[0]).toBeGreaterThanOrEqual(75);
    expect(delays[0]).toBeLessThanOrEqual(125);

    // Second retry: ~200ms (150-250ms with jitter)
    expect(delays[1]).toBeGreaterThanOrEqual(150);
    expect(delays[1]).toBeLessThanOrEqual(250);

    // Third retry: ~400ms (300-500ms with jitter)
    expect(delays[2]).toBeGreaterThanOrEqual(300);
    expect(delays[2]).toBeLessThanOrEqual(500);
  });

  it("should respect maxDelay", async () => {
    const { result } = renderHook(() =>
      useExponentialBackoff({
        maxRetries: 10,
        initialDelay: 1000,
        maxDelay: 2000,
        factor: 10,
        jitter: false,
      })
    );

    // Access the internal delay calculation
    const recovery = result as any;
    const delayFn = recovery.retry.retryDelay;

    // Should cap at maxDelay
    expect(delayFn(5)).toBe(2000);
    expect(delayFn(10)).toBe(2000);
  });
});

describe("useBulkhead", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should limit concurrent operations", async () => {
    let activeCount = 0;
    let maxActive = 0;

    const fn = jest.fn().mockImplementation(async () => {
      activeCount++;
      maxActive = Math.max(maxActive, activeCount);
      await new Promise((resolve) => setTimeout(resolve, 100));
      activeCount--;
      return "result";
    });

    const { result } = renderHook(() =>
      useBulkhead({
        maxConcurrent: 2,
        queueSize: 10,
      })
    );

    // Start 5 operations
    const promises = Array(5)
      .fill(null)
      .map(() => result.current.execute(fn));

    // Fast-forward time
    jest.advanceTimersByTime(500);

    await act(async () => {
      await Promise.all(promises);
    });

    expect(maxActive).toBe(2); // Never more than 2 concurrent
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("should queue operations when at capacity", async () => {
    const fn = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return "result";
    });

    const { result } = renderHook(() =>
      useBulkhead({
        maxConcurrent: 1,
        queueSize: 2,
      })
    );

    // Start 3 operations
    act(() => {
      result.current.execute(fn);
      result.current.execute(fn);
      result.current.execute(fn);
    });

    expect(result.current.activeCount).toBe(1);
    expect(result.current.queuedCount).toBe(2);
    expect(result.current.isAtCapacity).toBe(true);
  });

  it("should reject when queue is full", async () => {
    const onReject = jest.fn();
    const fn = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return "result";
    });

    const { result } = renderHook(() =>
      useBulkhead({
        maxConcurrent: 1,
        queueSize: 1,
        onReject,
      })
    );

    // Fill capacity and queue
    act(() => {
      result.current.execute(fn);
      result.current.execute(fn);
    });

    // This should be rejected
    await act(async () => {
      try {
        await result.current.execute(fn);
      } catch (error: any) {
        expect(error.type).toBe("BULKHEAD_REJECTED");
      }
    });

    expect(onReject).toHaveBeenCalledTimes(1);
    expect(result.current.isQueueFull).toBe(true);
  });

  it("should timeout operations", async () => {
    const fn = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return "result";
    });

    const { result } = renderHook(() =>
      useBulkhead({
        maxConcurrent: 1,
        timeout: 1000,
      })
    );

    jest.useRealTimers();

    await act(async () => {
      try {
        await result.current.execute(fn);
      } catch (error: any) {
        expect(error.type).toBe("BULKHEAD_TIMEOUT");
      }
    });
  });
});
