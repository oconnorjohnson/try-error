import React, { useState } from "react";
import { trySyncTuple, createError } from "../../../../src";

// Example demonstrating tuple-style error handling (Go-style)
export function TupleExample() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseNumber = () => {
    const [value, err] = trySyncTuple(() => {
      const trimmed = input.trim();

      if (!trimmed) {
        throw createError({
          type: "EMPTY_INPUT",
          message: "Input cannot be empty",
        });
      }

      const parsed = parseFloat(trimmed);

      if (isNaN(parsed)) {
        throw createError({
          type: "INVALID_NUMBER",
          message: `"${trimmed}" is not a valid number`,
        });
      }

      if (parsed < 0) {
        throw createError({
          type: "NEGATIVE_NUMBER",
          message: "Number must be positive",
        });
      }

      return parsed;
    });

    if (err) {
      setError(err.message);
      setResult(null);
    } else {
      setResult(value);
      setError(null);
    }
  };

  const clear = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Tuple-Style Error Handling</h2>

      <div className="mb-4">
        <label
          htmlFor="number-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter a positive number:
        </label>
        <input
          id="number-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 42.5"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={parseNumber}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Parse Number
        </button>
        <button
          onClick={clear}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result !== null && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success:</strong> Parsed number is {result}
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>This example demonstrates:</p>
        <ul className="list-disc list-inside mt-2">
          <li>
            Tuple-style error handling with{" "}
            <code className="bg-gray-100 px-1 rounded">trySyncTuple</code>
          </li>
          <li>
            Go-style{" "}
            <code className="bg-gray-100 px-1 rounded">[value, err]</code>{" "}
            destructuring
          </li>
          <li>Multiple validation steps</li>
          <li>Custom error types and messages</li>
        </ul>
      </div>
    </div>
  );
}
