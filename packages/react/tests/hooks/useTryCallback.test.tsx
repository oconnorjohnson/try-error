import React from "react";
import { renderHook, act } from "@testing-library/react";
import {
  useTryCallback,
  useTryCallbackSync,
  useFormSubmitCallback,
} from "../../src/hooks/useTryCallback";
import { isTryError } from "try-error";

describe("useTryCallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("async callback", () => {
    it("should return a memoized callback function", () => {
      const asyncFn = jest.fn().mockResolvedValue("test data");

      const { result, rerender } = renderHook(() => useTryCallback(asyncFn));

      const callback1 = result.current;
      rerender();
      const callback2 = result.current;

      expect(callback1).toBe(callback2);
    });

    it("should handle successful async operations", async () => {
      const mockData = { id: 1, name: "Test User" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useTryCallback(asyncFn));

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current();
      });

      expect(isTryError(callbackResult)).toBe(false);
      expect(callbackResult).toEqual(mockData);
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it("should handle async errors", async () => {
      const errorMessage = "Network error";
      const asyncFn = jest.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTryCallback(asyncFn));

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current();
      });

      expect(isTryError(callbackResult)).toBe(true);
      expect(callbackResult.message).toContain(errorMessage);
    });

    it("should pass arguments to the callback", async () => {
      const asyncFn = jest.fn((a: number, b: string) =>
        Promise.resolve(`${a}-${b}`)
      );

      const { result } = renderHook(() => useTryCallback(asyncFn));

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current(42, "test");
      });

      expect(callbackResult).toBe("42-test");
      expect(asyncFn).toHaveBeenCalledWith(42, "test");
    });

    it("should call onSuccess handler on success", async () => {
      const mockData = "success data";
      const asyncFn = jest.fn().mockResolvedValue(mockData);
      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        useTryCallback(asyncFn, { onSuccess })
      );

      await act(async () => {
        await result.current();
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it("should call onError handler on error", async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error("Test error"));
      const onError = jest.fn();

      const { result } = renderHook(() => useTryCallback(asyncFn, { onError }));

      await act(async () => {
        await result.current();
      });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Test error"),
        })
      );
    });

    it("should transform data when transformData is provided", async () => {
      const mockData = { value: 10 };
      const asyncFn = jest.fn().mockResolvedValue(mockData);
      const transformData = jest.fn((data) => ({
        ...data,
        doubled: data.value * 2,
      }));

      const { result } = renderHook(() =>
        useTryCallback(asyncFn, { transformData })
      );

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current();
      });

      expect(transformData).toHaveBeenCalledWith(mockData);
      expect(callbackResult).toEqual({ value: 10, doubled: 20 });
    });

    it("should transform error when transformError is provided", async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error("Original error"));
      const transformError = jest.fn((error) => ({
        ...error,
        message: `Transformed: ${error.message}`,
      }));

      const { result } = renderHook(() =>
        useTryCallback(asyncFn, { transformError })
      );

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current();
      });

      expect(transformError).toHaveBeenCalled();
      expect(callbackResult.message).toBe("Transformed: Original error");
    });

    it("should update callback when dependencies change", () => {
      let multiplier = 2;
      const asyncFn = jest.fn((value: number) =>
        Promise.resolve(value * multiplier)
      );

      const { result, rerender } = renderHook(() =>
        useTryCallback((value: number) => asyncFn(value), {}, [multiplier])
      );

      const callback1 = result.current;

      multiplier = 3;
      rerender();

      const callback2 = result.current;

      expect(callback1).not.toBe(callback2);
    });
  });

  describe("sync callback", () => {
    it("should handle successful sync operations", () => {
      const mockData = { id: 1, name: "Test User" };
      const syncFn = jest.fn().mockReturnValue(mockData);

      const { result } = renderHook(() => useTryCallbackSync(syncFn));

      let callbackResult;
      act(() => {
        callbackResult = result.current();
      });

      expect(isTryError(callbackResult)).toBe(false);
      expect(callbackResult).toEqual(mockData);
    });

    it("should handle sync errors", () => {
      const errorMessage = "Validation error";
      const syncFn = jest.fn(() => {
        throw new Error(errorMessage);
      });

      const { result } = renderHook(() => useTryCallbackSync(syncFn));

      let callbackResult;
      act(() => {
        callbackResult = result.current();
      });

      expect(isTryError(callbackResult)).toBe(true);
      expect(callbackResult.message).toContain(errorMessage);
    });

    it("should call handlers for sync operations", () => {
      const mockData = "sync data";
      const syncFn = jest.fn().mockReturnValue(mockData);
      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        useTryCallbackSync(syncFn, { onSuccess })
      );

      act(() => {
        result.current();
      });

      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  describe("useFormSubmitCallback", () => {
    it("should prevent default form submission", async () => {
      const submitHandler = jest.fn().mockResolvedValue({ success: true });
      const preventDefault = jest.fn();

      const { result } = renderHook(() => useFormSubmitCallback(submitHandler));

      const mockEvent = {
        preventDefault,
        currentTarget: {
          // Mock form element
        },
      } as any;

      // Mock FormData globally
      const originalFormData = (globalThis as any).FormData;
      (globalThis as any).FormData = jest.fn(() => ({}));

      await act(async () => {
        await result.current(mockEvent);
      });

      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(submitHandler).toHaveBeenCalled();

      // Restore FormData
      (globalThis as any).FormData = originalFormData;
    });

    it("should create FormData from form and pass to handler", async () => {
      const submitHandler = jest.fn().mockResolvedValue({ success: true });
      const formElement = document.createElement("form");

      const { result } = renderHook(() => useFormSubmitCallback(submitHandler));

      const mockEvent = {
        preventDefault: jest.fn(),
        currentTarget: formElement,
      } as any;

      // Mock FormData
      const mockFormData = { mock: "formData" };
      const originalFormData = (globalThis as any).FormData;
      (globalThis as any).FormData = jest.fn(() => mockFormData);

      await act(async () => {
        await result.current(mockEvent);
      });

      expect((globalThis as any).FormData).toHaveBeenCalledWith(formElement);
      expect(submitHandler).toHaveBeenCalledWith(mockFormData);

      // Restore FormData
      (globalThis as any).FormData = originalFormData;
    });

    it("should handle form submission errors", async () => {
      const submitHandler = jest
        .fn()
        .mockRejectedValue(new Error("Submit failed"));
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useFormSubmitCallback(submitHandler, { onError })
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        currentTarget: document.createElement("form"),
      } as any;

      // Mock FormData
      const originalFormData = (globalThis as any).FormData;
      (globalThis as any).FormData = jest.fn(() => ({}));

      await act(async () => {
        await result.current(mockEvent);
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Submit failed"),
        })
      );

      // Restore FormData
      (globalThis as any).FormData = originalFormData;
    });

    it("should call onSuccess after successful form submission", async () => {
      const submitResult = { id: 123, status: "created" };
      const submitHandler = jest.fn().mockResolvedValue(submitResult);
      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        useFormSubmitCallback(submitHandler, { onSuccess })
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        currentTarget: document.createElement("form"),
      } as any;

      // Mock FormData
      const originalFormData = (globalThis as any).FormData;
      (globalThis as any).FormData = jest.fn(() => ({}));

      await act(async () => {
        await result.current(mockEvent);
      });

      expect(onSuccess).toHaveBeenCalledWith(submitResult);

      // Restore FormData
      (globalThis as any).FormData = originalFormData;
    });
  });

  describe("TypeScript type inference", () => {
    it("should infer correct types for async callbacks", async () => {
      interface User {
        id: number;
        name: string;
      }

      const fetchUser = jest
        .fn()
        .mockResolvedValue({ id: 1, name: "Test" } as User);

      const { result } = renderHook(() =>
        useTryCallback<[number], User>((id: number) => fetchUser(id))
      );

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current(123);
      });

      if (!isTryError(callbackResult)) {
        // TypeScript should know this is a User
        expect(callbackResult.id).toBe(1);
        expect(callbackResult.name).toBe("Test");
      }
    });
  });
});
