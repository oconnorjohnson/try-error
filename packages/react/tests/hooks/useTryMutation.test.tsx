import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useTryMutation,
  useFormMutation,
} from "../../src/hooks/useTryMutation";
import { createError } from "try-error";

describe("useTryMutation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should handle successful mutation", async () => {
      const mockData = { id: 1, name: "Test User" };
      const mutationFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useTryMutation(mutationFn));

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      await act(async () => {
        await result.current.mutate("test-input");
      });

      expect(mutationFn).toHaveBeenCalledWith("test-input");
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
    });

    it("should handle failed mutation", async () => {
      const mockError = new Error("Network error");
      const mutationFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useTryMutation(mutationFn));

      await act(async () => {
        await result.current.mutate("test-input");
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe("Network error");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(true);
    });

    it("should handle loading state correctly", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      const mutationFn = jest.fn().mockReturnValue(promise);

      const { result } = renderHook(() => useTryMutation(mutationFn));

      // Start mutation
      act(() => {
        result.current.mutate("test-input");
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ success: true });
        await promise;
      });

      // Should no longer be loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe("callbacks", () => {
    it("should call onSuccess callback on successful mutation", async () => {
      const mockData = { id: 1, name: "Test" };
      const mutationFn = jest.fn().mockResolvedValue(mockData);
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onSettled = jest.fn();

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, { onSuccess, onError, onSettled })
      );

      await act(async () => {
        await result.current.mutate("input");
      });

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onError).not.toHaveBeenCalled();
      expect(onSettled).toHaveBeenCalled();
    });

    it("should call onError callback on failed mutation", async () => {
      const mockError = new Error("Failed");
      const mutationFn = jest.fn().mockRejectedValue(mockError);
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onSettled = jest.fn();

      const { result } = renderHook(() =>
        useTryMutation(mutationFn, { onSuccess, onError, onSettled })
      );

      await act(async () => {
        await result.current.mutate("input");
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe("Failed");
      expect(onSettled).toHaveBeenCalled();
    });

    it("should always call onSettled callback", async () => {
      const onSettled = jest.fn();

      // Test with success
      const successFn = jest.fn().mockResolvedValue("success");
      const { result: successResult } = renderHook(() =>
        useTryMutation(successFn, { onSettled })
      );

      await act(async () => {
        await successResult.current.mutate("input");
      });

      expect(onSettled).toHaveBeenCalledTimes(1);

      // Test with failure
      onSettled.mockClear();
      const failFn = jest.fn().mockRejectedValue(new Error("fail"));
      const { result: failResult } = renderHook(() =>
        useTryMutation(failFn, { onSettled })
      );

      await act(async () => {
        await failResult.current.mutate("input");
      });

      expect(onSettled).toHaveBeenCalledTimes(1);
    });
  });

  describe("mutateAsync", () => {
    it("should return the result from mutateAsync", async () => {
      const mockData = { id: 1 };
      const mutationFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useTryMutation(mutationFn));

      let mutationResult;
      await act(async () => {
        mutationResult = await result.current.mutateAsync("input");
      });

      expect(mutationResult).toEqual(mockData);
    });

    it("should return error result from mutateAsync on failure", async () => {
      const mockError = new Error("Failed");
      const mutationFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useTryMutation(mutationFn));

      let mutationResult;
      await act(async () => {
        mutationResult = await result.current.mutateAsync("input");
      });

      expect(mutationResult).toMatchObject({
        type: "Error",
        message: "Failed",
      });
    });
  });

  describe("reset", () => {
    it("should reset all state when reset is called", async () => {
      const mockData = { id: 1 };
      const mutationFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useTryMutation(mutationFn));

      // First mutate
      await act(async () => {
        await result.current.mutate("input");
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isSuccess).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  describe("multiple mutations", () => {
    it("should handle sequential mutations correctly", async () => {
      let counter = 0;
      const mutationFn = jest.fn().mockImplementation(() => {
        counter++;
        return Promise.resolve({ count: counter });
      });

      const { result } = renderHook(() => useTryMutation(mutationFn));

      // First mutation
      await act(async () => {
        await result.current.mutate("first");
      });
      expect(result.current.data).toEqual({ count: 1 });

      // Second mutation
      await act(async () => {
        await result.current.mutate("second");
      });
      expect(result.current.data).toEqual({ count: 2 });
      expect(mutationFn).toHaveBeenCalledTimes(2);
    });

    it("should clear previous error on new mutation", async () => {
      const mutationFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("First error"))
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useTryMutation(mutationFn));

      // First mutation (fails)
      await act(async () => {
        await result.current.mutate("first");
      });
      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe("First error");

      // Second mutation (succeeds)
      await act(async () => {
        await result.current.mutate("second");
      });
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle mutations with void return type", async () => {
      const mutationFn = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useTryMutation<void, string>(mutationFn)
      );

      await act(async () => {
        await result.current.mutate("input");
      });

      // undefined is treated as success
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should handle mutations with no variables", async () => {
      const mutationFn = jest.fn().mockResolvedValue("result");

      const { result } = renderHook(() => useTryMutation<string>(mutationFn));

      await act(async () => {
        await result.current.mutate();
      });

      expect(mutationFn).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toBe("result");
    });
  });
});

describe("useFormMutation", () => {
  it("should handle form submission", async () => {
    const mockResponse = { success: true };
    const submitFn = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFormMutation(submitFn));

    // Create mock form event
    const formData = new FormData();
    formData.append("name", "Test User");
    formData.append("email", "test@example.com");

    const mockEvent = {
      preventDefault: jest.fn(),
      currentTarget: {
        // Mock FormData constructor
        constructor: {
          name: "HTMLFormElement",
        },
      },
    } as any;

    // Mock FormData constructor
    const originalFormData = global.FormData;
    global.FormData = jest.fn(() => formData) as any;

    await act(async () => {
      result.current.submitForm(mockEvent);
      // Wait for async operations
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(submitFn).toHaveBeenCalledWith(formData);
    expect(result.current.submitData).toEqual(mockResponse);
    expect(result.current.submitError).toBeNull();

    // Restore FormData
    global.FormData = originalFormData;
  });

  it("should expose aliased properties", () => {
    const submitFn = jest.fn();
    const { result } = renderHook(() => useFormMutation(submitFn));

    // Check that aliases are properly set
    expect(result.current.isSubmitting).toBe(result.current.isLoading);
    expect(result.current.submitError).toBe(result.current.error);
    expect(result.current.submitData).toBe(result.current.data);
  });

  it("should handle form submission errors", async () => {
    const mockError = new Error("Submission failed");
    const submitFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useFormMutation(submitFn));

    const formData = new FormData();
    const mockEvent = {
      preventDefault: jest.fn(),
      currentTarget: {},
    } as any;

    // Mock FormData constructor
    const originalFormData = global.FormData;
    global.FormData = jest.fn(() => formData) as any;

    await act(async () => {
      result.current.submitForm(mockEvent);
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });

    expect(result.current.submitError).toBeTruthy();
    expect(result.current.submitError?.message).toBe("Submission failed");
    expect(result.current.submitData).toBeNull();

    // Restore FormData
    global.FormData = originalFormData;
  });
});
