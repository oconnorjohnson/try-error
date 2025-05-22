import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useTry } from "../../src/hooks/useTry";

describe("useTry", () => {
  it("should fetch data successfully", async () => {
    const mockData = { id: 1, name: "Test User" };
    const mockFetch = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useTry(mockFetch));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(result.current.status).toBe("success");
  });

  it("should handle errors", async () => {
    const mockError = new Error("Test error");
    const mockFetch = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useTry(mockFetch));

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeTruthy();
    expect(result.current.status).toBe("error");
  });

  it("should not fetch when disabled", () => {
    const mockFetch = jest.fn();

    renderHook(() => useTry(mockFetch, { enabled: false }));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should refetch when dependencies change", async () => {
    const mockFetch = jest.fn().mockResolvedValue({ id: 1 });
    let userId = "1";

    const { rerender } = renderHook(() =>
      useTry(() => mockFetch(userId), { deps: [userId] })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("1");
    });

    // Change dependency
    userId = "2";
    rerender();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("2");
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
