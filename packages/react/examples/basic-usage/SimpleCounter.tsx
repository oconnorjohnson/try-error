import React, { useState } from "react";
import { trySync, isTryError, createError } from "../../../../src";

// Simple counter with validation that demonstrates basic try-error usage
export function SimpleCounter() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const increment = () => {
    const result = trySync(() => {
      if (count >= 10) {
        throw createError("LIMIT_EXCEEDED", "Counter cannot exceed 10");
      }
      return count + 1;
    });

    if (isTryError(result)) {
      setError(result.message);
    } else {
      setCount(result);
      setError(null);
    }
  };

  const decrement = () => {
    const result = trySync(() => {
      if (count <= 0) {
        throw createError("LIMIT_EXCEEDED", "Counter cannot go below 0");
      }
      return count - 1;
    });

    if (isTryError(result)) {
      setError(result.message);
    } else {
      setCount(result);
      setError(null);
    }
  };

  const reset = () => {
    setCount(0);
    setError(null);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Simple Counter</h2>

      <div className="text-center mb-4">
        <span className="text-4xl font-mono">{count}</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          onClick={decrement}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          disabled={count <= 0}
        >
          -
        </button>

        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>

        <button
          onClick={increment}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={count >= 10}
        >
          +
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>This counter demonstrates basic try-error usage:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Range validation (0-10)</li>
          <li>Error handling with trySync</li>
          <li>Type-safe error checking</li>
        </ul>
      </div>
    </div>
  );
}
