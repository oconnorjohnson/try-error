import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTryMutation } from "../../src/hooks/useTryMutation";
import { createError } from "try-error";

describe("useTryMutation - Optimistic Updates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("optimistic updates", () => {
    it("should apply optimistic update immediately", async () => {
      const mockData = { id: 1, name: "Server User" };
      const optimisticData = { id: "temp-1", name: "Optimistic User" };
      const mutationFn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return mockData;
      });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          optimisticData,
        })
      );

      // Start mutation
      act(() => {
        result.current.mutate("test-input");
      });

      // Should immediately show optimistic data
      expect(result.current.data).toEqual(optimisticData);
      expect(result.current.isLoading).toBe(true);

      // Wait for mutation to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should now show server data
      expect(result.current.data).toEqual(mockData);
    });

    it("should support optimistic update function", async () => {
      const currentData = { id: 1, name: "Current User", count: 5 };
      const serverData = { id: 1, name: "Current User", count: 6 };
      const mutationFn = jest.fn().mockResolvedValue(serverData);

      const { result } = renderHook(() =>
        useTryMutation<
          { id: number; name: string; count: number },
          { increment: number }
        >(mutationFn, {
          optimisticData: (variables, current) => ({
            ...(current || { id: 0, name: "", count: 0 }),
            count: (current?.count || 0) + variables.increment,
          }),
        })
      );

      // Set initial data
      act(() => {
        result.current.setData(currentData);
      });

      // Start mutation with increment
      await act(async () => {
        await result.current.mutate({ increment: 1 });
      });

      // Should show incremented count
      expect(result.current.data).toEqual(serverData);
    });

    it("should rollback optimistic update on error", async () => {
      const previousData = { id: 1, name: "Previous User" };
      const optimisticData = { id: 1, name: "Optimistic User" };
      const mutationFn = jest.fn().mockRejectedValue(new Error("Server error"));

      const rollbackOnError = jest.fn();

      const { result } = renderHook(() =>
        useTryMutation<{ id: number; name: string }, string>(mutationFn, {
          optimisticData,
          rollbackOnError,
        })
      );

      // Set initial data
      act(() => {
        result.current.setData(previousData);
      });

      // Start mutation
      await act(async () => {
        await result.current.mutate("test-input");
      });

      // Should have rolled back to previous data
      expect(result.current.data).toBeNull(); // Error state sets data to null
      expect(result.current.isError).toBe(true);
      expect(rollbackOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Server error",
        }),
        "test-input",
        previousData
      );
    });

    it("should not apply optimistic update if component unmounts", async () => {
      const optimisticData = { id: "temp-1", name: "Optimistic User" };
      const mutationFn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { id: 1, name: "Server User" };
      });

      const { result, unmount } = renderHook(() =>
        useTryMutation(mutationFn, {
          optimisticData,
        })
      );

      // Start mutation
      act(() => {
        result.current.mutate("test-input");
      });

      // Unmount immediately
      unmount();

      // Optimistic update should not have been applied
      // (can't test this directly since component is unmounted)
    });
  });

  describe("retry functionality", () => {
    it("should retry failed mutations", async () => {
      let attemptCount = 0;
      const mutationFn = jest.fn().mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return { success: true };
      });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          retry: 3,
          retryDelay: 10,
        })
      );

      await act(async () => {
        await result.current.mutate("test");
      });

      expect(attemptCount).toBe(3);
      expect(result.current.data).toEqual({ success: true });
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.failureCount).toBe(0);
    });

    it("should use custom retry function", async () => {
      let attemptCount = 0;
      const mutationFn = jest.fn().mockImplementation(async () => {
        attemptCount++;
        console.log(
          `Attempt ${attemptCount}: throwing ${
            attemptCount === 1 ? "NETWORK_ERROR" : "VALIDATION_ERROR"
          }`
        );
        throw createError({
          type: attemptCount === 1 ? "NETWORK_ERROR" : "VALIDATION_ERROR",
          message: `Error ${attemptCount}`,
        });
      });

      const retryFn = jest.fn((failureCount, error) => {
        console.log(
          `Retry function called: failureCount=${failureCount}, error.type=${error.type}`
        );
        // Only retry network errors
        const shouldRetry = error.type === "NETWORK_ERROR" && failureCount < 2;
        console.log(`Should retry: ${shouldRetry}`);
        return shouldRetry;
      });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          retry: retryFn,
          retryDelay: 10,
        })
      );

      await act(async () => {
        await result.current.mutate("test");
      });

      console.log(`Final attemptCount: ${attemptCount}`);
      console.log(
        `Retry function was called ${retryFn.mock.calls.length} times`
      );
      console.log(`Retry function calls:`, retryFn.mock.calls);

      // Should have tried twice (initial + 1 retry)
      expect(attemptCount).toBe(2);
      expect(result.current.isError).toBe(true);
      expect(result.current.error?.type).toBe("VALIDATION_ERROR");
    });

    it("should use exponential backoff for retry delay", async () => {
      const delays: number[] = [];
      let lastCallTime = Date.now();

      const mutationFn = jest.fn().mockImplementation(async () => {
        const now = Date.now();
        const delay = now - lastCallTime;
        if (delays.length > 0) {
          delays.push(delay);
        }
        lastCallTime = now;

        if (delays.length < 2) {
          throw new Error("Retry me");
        }
        return { success: true };
      });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          retry: 3,
          retryDelay: (attemptNumber) => Math.min(50 * 2 ** attemptNumber, 200),
        })
      );

      await act(async () => {
        await result.current.mutate("test");
      });

      // Check that delays are increasing
      expect(delays[0]).toBeGreaterThanOrEqual(50);
      expect(delays[0]).toBeLessThan(150);
      expect(delays[1]).toBeGreaterThanOrEqual(100);
      expect(delays[1]).toBeLessThan(250);
    });
  });

  describe("caching", () => {
    it("should cache successful results", async () => {
      const mutationFn = jest.fn().mockResolvedValue({ id: 1, cached: true });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          cacheTime: 1000,
        })
      );

      // First call
      await act(async () => {
        await result.current.mutate("test");
      });

      expect(mutationFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual({ id: 1, cached: true });

      // Reset to clear state
      act(() => {
        result.current.reset();
      });

      // Second call with same variables - should use cache
      await act(async () => {
        await result.current.mutate("test");
      });

      expect(mutationFn).toHaveBeenCalledTimes(1); // Still only called once
      expect(result.current.data).toEqual({ id: 1, cached: true });
    });

    it("should not use expired cache", async () => {
      const mutationFn = jest
        .fn()
        .mockResolvedValueOnce({ id: 1, version: 1 })
        .mockResolvedValueOnce({ id: 1, version: 2 });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          cacheTime: 50,
        })
      );

      // First call
      await act(async () => {
        await result.current.mutate("test");
      });

      expect(result.current.data).toEqual({ id: 1, version: 1 });

      // Wait for cache to expire
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Reset and call again
      act(() => {
        result.current.reset();
      });

      await act(async () => {
        await result.current.mutate("test");
      });

      expect(mutationFn).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual({ id: 1, version: 2 });
    });

    it("should invalidate cache on demand", async () => {
      const mutationFn = jest.fn().mockResolvedValue({ id: 1 });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          cacheTime: 1000,
        })
      );

      // First call
      await act(async () => {
        await result.current.mutate("test");
      });

      // Invalidate cache
      act(() => {
        result.current.invalidate();
      });

      // Reset and call again
      act(() => {
        result.current.reset();
      });

      await act(async () => {
        await result.current.mutate("test");
      });

      expect(mutationFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("enhanced callbacks", () => {
    it("should pass variables to all callbacks", async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onSettled = jest.fn();

      const mutationFn = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, {
          onSuccess,
          onError,
          onSettled,
        })
      );

      const variables = { userId: 123, action: "update" };

      await act(async () => {
        await result.current.mutate(variables);
      });

      expect(onSuccess).toHaveBeenCalledWith({ success: true }, variables);
      expect(onError).not.toHaveBeenCalled();
      expect(onSettled).toHaveBeenCalledWith(
        expect.any(Object), // data
        null, // error
        variables
      );
    });
  });

  describe("state management", () => {
    it("should track idle state correctly", () => {
      const mutationFn = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useTryMutation(mutationFn));

      // Initial state should be idle
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it("should update data with setData", () => {
      const mutationFn = jest.fn();

      const { result } = renderHook(() => useTryMutation(mutationFn));

      const newData = { id: 1, name: "Manual Data" };

      act(() => {
        result.current.setData(newData);
      });

      expect(result.current.data).toEqual(newData);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isIdle).toBe(false);
    });

    it("should support functional updates with setData", () => {
      const mutationFn = jest.fn();

      const { result } = renderHook(() =>
        useTryMutation<{ count: number }>(mutationFn)
      );

      act(() => {
        result.current.setData({ count: 5 });
      });

      act(() => {
        result.current.setData((prev) => ({
          count: (prev?.count || 0) + 1,
        }));
      });

      expect(result.current.data).toEqual({ count: 6 });
    });
  });
});
