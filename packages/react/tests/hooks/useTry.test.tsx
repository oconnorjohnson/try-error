import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTry } from "../../src/hooks/useTry";
import { isTryError } from "try-error";

describe("useTry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useTry(async () => "test data"));

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it("should execute async function and update state on success", async () => {
      const mockData = { id: 1, name: "Test User" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useTry(asyncFn));

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
      });

      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it("should handle async function errors", async () => {
      const errorMessage = "Network error";
      const asyncFn = jest.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTry(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
        expect(result.current.data).toBeNull();
        expect(isTryError(result.current.error)).toBe(true);
        expect(result.current.error?.message).toContain(errorMessage);
      });
    });
  });

  describe("immediate execution", () => {
    it("should execute immediately when immediate option is true", async () => {
      const mockData = "immediate data";
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useTry(asyncFn, { immediate: true }));

      // Should start loading immediately
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockData);
      });

      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it("should not execute immediately when immediate option is false", () => {
      const asyncFn = jest.fn().mockResolvedValue("data");

      renderHook(() => useTry(asyncFn, { immediate: false }));

      expect(asyncFn).not.toHaveBeenCalled();
    });
  });

  describe("dependency tracking", () => {
    it("should re-execute when dependencies change", async () => {
      const asyncFn = jest.fn((id: number) => Promise.resolve(`User ${id}`));
      let userId = 1;

      const { result, rerender } = renderHook(() =>
        useTry(() => asyncFn(userId), { immediate: true, deps: [userId] })
      );

      await waitFor(() => {
        expect(result.current.data).toBe("User 1");
      });

      // Change dependency
      userId = 2;
      rerender();

      await waitFor(() => {
        expect(result.current.data).toBe("User 2");
      });

      expect(asyncFn).toHaveBeenCalledTimes(2);
      expect(asyncFn).toHaveBeenCalledWith(1);
      expect(asyncFn).toHaveBeenCalledWith(2);
    });
  });

  describe("state management", () => {
    it("should reset state when resetOnExecute is true", async () => {
      const asyncFn = jest
        .fn()
        .mockResolvedValueOnce("first")
        .mockResolvedValueOnce("second");

      const { result } = renderHook(() =>
        useTry(asyncFn, { resetOnExecute: true })
      );

      // First execution
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe("first");

      // Second execution - should reset state first
      act(() => {
        result.current.execute();
      });

      // Should be loading with no data
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();

      await waitFor(() => {
        expect(result.current.data).toBe("second");
      });
    });

    it("should not reset state when resetOnExecute is false", async () => {
      const asyncFn = jest
        .fn()
        .mockResolvedValueOnce("first")
        .mockResolvedValueOnce("second");

      const { result } = renderHook(() =>
        useTry(asyncFn, { resetOnExecute: false })
      );

      // First execution
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe("first");

      // Second execution - should keep previous data while loading
      act(() => {
        result.current.execute();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe("first"); // Previous data retained

      await waitFor(() => {
        expect(result.current.data).toBe("second");
      });
    });
  });

  describe("manual state control", () => {
    it("should reset state when calling reset", async () => {
      const asyncFn = jest.fn().mockResolvedValue("test data");

      const { result } = renderHook(() => useTry(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe("test data");
      expect(result.current.isSuccess).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it("should update data when calling mutate", () => {
      interface User {
        id: number;
        name: string;
      }

      const { result } = renderHook(() =>
        useTry<User>(async () => ({ id: 0, name: "initial" }))
      );

      const newData: User = { id: 1, name: "Mutated User" };

      act(() => {
        result.current.mutate(newData);
      });

      expect(result.current.data).toEqual(newData);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("memory leak prevention", () => {
    it("should not update state after unmount", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      const asyncFn = jest.fn(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("delayed"), 100))
      );

      const { result, unmount } = renderHook(() => useTry(asyncFn));

      act(() => {
        result.current.execute();
      });

      expect(result.current.isLoading).toBe(true);

      // Unmount before promise resolves
      unmount();

      // Wait for promise to resolve
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      // Should not have any console errors about updating unmounted component
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it("should handle multiple rapid executions", async () => {
      let resolveFirst: (value: string) => void;
      let resolveSecond: (value: string) => void;

      const firstPromise = new Promise<string>((resolve) => {
        resolveFirst = resolve;
      });

      const secondPromise = new Promise<string>((resolve) => {
        resolveSecond = resolve;
      });

      const asyncFn = jest
        .fn()
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);

      const { result } = renderHook(() => useTry(asyncFn));

      // Start first execution
      act(() => {
        result.current.execute();
      });

      // Start second execution before first completes
      act(() => {
        result.current.execute();
      });

      // Resolve second promise first
      await act(async () => {
        resolveSecond!("second");
      });

      await waitFor(() => {
        expect(result.current.data).toBe("second");
      });

      // Resolve first promise later - should be ignored
      await act(async () => {
        resolveFirst!("first");
      });

      // Data should still be from second execution
      expect(result.current.data).toBe("second");
    });
  });

  describe("error handling edge cases", () => {
    it("should handle non-Error thrown values", async () => {
      const asyncFn = jest.fn().mockRejectedValue("string error");

      const { result } = renderHook(() => useTry(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.isError).toBe(true);
      expect(isTryError(result.current.error)).toBe(true);
      expect(result.current.error?.message).toBe("string error");
    });

    it("should handle null/undefined thrown values", async () => {
      const asyncFn = jest.fn().mockRejectedValue(null);

      const { result } = renderHook(() => useTry(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.isError).toBe(true);
      expect(isTryError(result.current.error)).toBe(true);
      expect(result.current.error?.message).toBe("An unknown error occurred");
    });
  });

  describe("TypeScript type inference", () => {
    it("should infer correct data type", async () => {
      interface User {
        id: number;
        name: string;
      }

      const mockUser: User = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(mockUser);

      const { result } = renderHook(() => useTry<User>(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      // TypeScript should know that data is User | null
      if (result.current.data) {
        expect(result.current.data.id).toBe(1);
        expect(result.current.data.name).toBe("Test");
      }
    });
  });

  describe("AbortController support", () => {
    it("should pass AbortSignal to async function", async () => {
      const asyncFn = jest.fn(async (signal: AbortSignal) => {
        expect(signal).toBeInstanceOf(AbortSignal);
        return "test data";
      });

      const { result } = renderHook(() => useTry(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(asyncFn).toHaveBeenCalledWith(expect.any(AbortSignal));
      expect(result.current.data).toBe("test data");
    });

    it("should abort in-flight request when abort is called", async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      const asyncFn = jest.fn(async (signal: AbortSignal) => {
        await promise;
        if (signal.aborted) {
          throw new Error("AbortError");
        }
        return "should not reach here";
      });

      const { result } = renderHook(() => useTry(asyncFn));

      act(() => {
        result.current.execute();
      });

      expect(result.current.isLoading).toBe(true);

      // Abort the request
      act(() => {
        result.current.abort();
      });

      // Resolve the promise after abort
      await act(async () => {
        resolvePromise!("data");
      });

      // Should not update with success data
      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle AbortError correctly", async () => {
      const asyncFn = jest.fn(async (signal: AbortSignal) => {
        const error = new Error("Operation aborted");
        error.name = "AbortError";
        throw error;
      });

      const { result } = renderHook(() =>
        useTry(asyncFn, { abortMessage: "Custom abort message" })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.type).toBe("ABORTED");
      expect(result.current.error?.message).toBe("Custom abort message");
      expect(result.current.error?.context?.reason).toBe("manual_abort");
    });

    it("should abort previous request when executing new one", async () => {
      const abortedSignals: boolean[] = [];

      const asyncFn = jest.fn(async (signal: AbortSignal) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        abortedSignals.push(signal.aborted);
        return `result-${abortedSignals.length}`;
      });

      const { result } = renderHook(() => useTry(asyncFn));

      // Start first execution
      act(() => {
        result.current.execute();
      });

      // Start second execution immediately
      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First signal should have been aborted
      expect(abortedSignals[0]).toBe(true);
      // Second signal should not have been aborted
      expect(abortedSignals[1]).toBe(false);
      // Should have the result from the second execution
      expect(result.current.data).toBe("result-2");
    });

    it("should abort request on unmount", async () => {
      let signalAborted = false;

      const asyncFn = jest.fn(async (signal: AbortSignal) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        signalAborted = signal.aborted;
        return "data";
      });

      const { result, unmount } = renderHook(() => useTry(asyncFn));

      act(() => {
        result.current.execute();
      });

      // Unmount while request is in flight
      unmount();

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      // Signal should have been aborted
      expect(signalAborted).toBe(true);
    });

    it("should abort request when dependencies change", async () => {
      const abortedSignals: boolean[] = [];
      let currentId = 1;

      const asyncFn = jest.fn(async (id: number, signal: AbortSignal) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        abortedSignals.push(signal.aborted);
        return `user-${id}`;
      });

      const { result, rerender } = renderHook(() =>
        useTry((signal) => asyncFn(currentId, signal), {
          immediate: true,
          deps: [currentId],
        })
      );

      // Wait for first execution
      await waitFor(() => {
        expect(result.current.data).toBe("user-1");
      });

      // Change dependency
      currentId = 2;
      rerender();

      // Wait for second execution
      await waitFor(() => {
        expect(result.current.data).toBe("user-2");
      });

      // First request should have been aborted
      expect(abortedSignals[0]).toBe(false); // First completed normally
      expect(abortedSignals[1]).toBe(false); // Second also completed
    });

    it("should handle fetch with AbortSignal", async () => {
      // Mock fetch
      const mockFetch = jest.fn().mockImplementation((url, options) => {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, name: "Test User" }),
        });
      });
      global.fetch = mockFetch as any;

      const { result } = renderHook(() =>
        useTry(async (signal) => {
          const response = await fetch("/api/user", { signal });
          return response.json();
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/user",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );

      expect(result.current.data).toEqual({ id: 1, name: "Test User" });
    });

    it("should cleanup abort controller on reset", async () => {
      let signalAborted = false;

      const asyncFn = jest.fn(async (signal: AbortSignal) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        signalAborted = signal.aborted;
        return "data";
      });

      const { result } = renderHook(() => useTry(asyncFn));

      act(() => {
        result.current.execute();
      });

      // Reset while request is in flight
      act(() => {
        result.current.reset();
      });

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      // Signal should have been aborted
      expect(signalAborted).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
