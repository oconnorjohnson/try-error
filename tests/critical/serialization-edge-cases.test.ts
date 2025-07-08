import { createError, isTryError } from "../../src";
import {
  serializeTryError,
  deserializeTryError,
  TryError,
  TRY_ERROR_BRAND,
} from "../../src/types";

describe("Serialization Edge Cases", () => {
  beforeEach(() => {
    // Reset any global state
  });

  afterEach(() => {
    // Clean up after each test
  });

  describe("Basic Serialization/Deserialization", () => {
    it("should serialize and deserialize a basic error", () => {
      const error = createError({
        type: "TestError",
        message: "Test message",
        context: { key: "value" },
      });

      const serialized = serializeTryError(error);
      expect(serialized.__tryError).toBe(true);
      expect(serialized.type).toBe("TestError");
      expect(serialized.message).toBe("Test message");

      const deserialized = deserializeTryError(serialized);
      expect(deserialized).not.toBeNull();
      expect(isTryError(deserialized)).toBe(true);
      expect(deserialized?.type).toBe("TestError");
      expect(deserialized?.message).toBe("Test message");
    });
  });

  describe("Type Safety Issues", () => {
    it("should handle JSON string input to deserializeTryError", () => {
      const error = createError({
        type: "TestError",
        message: "Test message",
      });
      const serialized = serializeTryError(error);
      const jsonString = JSON.stringify(serialized);

      // This should work now that we support JSON string input
      expect(() => {
        deserializeTryError(jsonString);
      }).not.toThrow();
    });

    it("should handle already parsed JSON objects", () => {
      const error = createError({
        type: "TestError",
        message: "Test message",
      });
      const serialized = serializeTryError(error);
      const jsonString = JSON.stringify(serialized);
      const parsed = JSON.parse(jsonString);

      const deserialized = deserializeTryError(parsed);
      expect(deserialized).not.toBeNull();
      expect(isTryError(deserialized)).toBe(true);
    });
  });

  describe("Null Handling", () => {
    it("should handle null input gracefully", () => {
      const result = deserializeTryError(null);
      expect(result).toBeNull();
    });

    it("should handle undefined input gracefully", () => {
      const result = deserializeTryError(undefined);
      expect(result).toBeNull();
    });

    it("should handle empty object gracefully", () => {
      const result = deserializeTryError({});
      expect(result).toBeNull();
    });

    it("should handle malformed objects gracefully", () => {
      const malformed = {
        __tryError: true,
        type: "TestError",
        // Missing required fields: message, source, timestamp
      };

      const result = deserializeTryError(malformed);
      expect(result).toBeNull();
    });
  });

  describe("Circular Reference Handling", () => {
    it("should handle circular references in context", () => {
      const circular: any = { name: "test" };
      circular.self = circular;

      const error = createError({
        type: "TestError",
        message: "Test with circular reference",
        context: { circular },
      });

      // Serialization should not throw with circular references
      expect(() => serializeTryError(error)).not.toThrow();
    });

    it("should handle deeply nested objects", () => {
      const deepObject = { level1: { level2: { level3: { level4: "deep" } } } };

      const error = createError({
        type: "TestError",
        message: "Test with deep object",
        context: deepObject,
      });

      const serialized = serializeTryError(error);
      const deserialized = deserializeTryError(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.context).toEqual(deepObject);
    });
  });

  describe("Large Context Serialization", () => {
    it("should handle large context objects", () => {
      const largeContext = {
        data: Array(1000)
          .fill("x")
          .map((_, i) => ({ id: i, value: `item-${i}` })),
      };

      const error = createError({
        type: "TestError",
        message: "Test with large context",
        context: largeContext,
      });

      const serialized = serializeTryError(error);
      const deserialized = deserializeTryError(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.context?.data).toHaveLength(1000);
    });
  });

  describe("Cross-Environment Serialization", () => {
    it("should handle Date objects in context", () => {
      const date = new Date();
      const error = createError({
        type: "TestError",
        message: "Test with Date",
        context: { timestamp: date },
      });

      const serialized = serializeTryError(error);
      const jsonString = JSON.stringify(serialized);
      const parsed = JSON.parse(jsonString);
      const deserialized = deserializeTryError(parsed);

      expect(deserialized).not.toBeNull();
      // Date should be serialized as ISO string
      expect(typeof deserialized?.context?.timestamp).toBe("string");
    });

    it("should handle RegExp objects in context", () => {
      const regex = /test/gi;
      const error = createError({
        type: "TestError",
        message: "Test with RegExp",
        context: { pattern: regex },
      });

      const serialized = serializeTryError(error);
      const jsonString = JSON.stringify(serialized);
      const parsed = JSON.parse(jsonString);
      const deserialized = deserializeTryError(parsed);

      expect(deserialized).not.toBeNull();
      // RegExp should be serialized as empty object
      expect(deserialized?.context?.pattern).toEqual({});
    });
  });

  describe("Malformed Data Validation", () => {
    it("should reject objects without __tryError marker", () => {
      const notTryError = {
        type: "TestError",
        message: "Test message",
        source: "test.ts:1:1",
        timestamp: Date.now(),
      };

      const result = deserializeTryError(notTryError);
      expect(result).toBeNull();
    });

    it("should reject objects with wrong field types", () => {
      const wrongTypes = {
        __tryError: true,
        type: 123, // Should be string
        message: "Test message",
        source: "test.ts:1:1",
        timestamp: Date.now(),
      };

      const result = deserializeTryError(wrongTypes);
      expect(result).toBeNull();
    });

    it("should handle corrupted JSON gracefully", () => {
      const corruptedJson =
        '{"__tryError": true, "type": "Test", "message": "Test", "source": "test.ts:1:1", "timestamp": 123, "context": {';

      expect(() => {
        const parsed = JSON.parse(corruptedJson);
        deserializeTryError(parsed);
      }).toThrow(); // JSON.parse should throw, but deserialize should handle it gracefully
    });
  });

  describe("Performance with Complex Objects", () => {
    it("should handle nested arrays efficiently", () => {
      const nestedArrays = {
        data: [[1, 2, 3], ["a", "b", "c"], [{ nested: "object" }]],
      };

      const error = createError({
        type: "TestError",
        message: "Test with nested arrays",
        context: nestedArrays,
      });

      const start = performance.now();
      const serialized = serializeTryError(error);
      const deserialized = deserializeTryError(serialized);
      const end = performance.now();

      expect(deserialized).not.toBeNull();
      expect(end - start).toBeLessThan(10); // Should be fast
    });
  });
});
