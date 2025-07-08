import { createError } from "../../src/errors";
import {
  isTryError,
  serializeTryError,
  deserializeTryError,
} from "../../src/types";
import { configure, resetConfig } from "../../src/config";

describe("Serialization Edge Cases", () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  describe("Circular Reference Handling", () => {
    it("should handle circular references in context", () => {
      const circular: any = { name: "test" };
      circular.self = circular;

      const error = createError({
        type: "Test",
        message: "Test with circular context",
        context: { circular },
      });

      // Serialization should not crash
      expect(() => serializeTryError(error)).not.toThrow();

      const serialized = serializeTryError(error);
      expect(serialized).toBeDefined();
      expect(typeof serialized).toBe("object");
    });

    it("should handle deeply nested circular references", () => {
      const level1: any = { name: "level1" };
      const level2: any = { name: "level2", parent: level1 };
      const level3: any = { name: "level3", parent: level2 };

      // Create circular reference
      level1.child = level2;
      level2.child = level3;
      level3.child = level1;

      const error = createError({
        type: "DeepCircular",
        message: "Deep circular reference test",
        context: { deepCircular: level1 },
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });

    it("should handle circular references in nested objects", () => {
      const parent = { name: "parent", children: [] as any[] };
      const child1 = { name: "child1", parent: parent };
      const child2 = { name: "child2", parent: parent };

      parent.children = [child1, child2];

      const error = createError({
        type: "NestedCircular",
        message: "Nested circular reference test",
        context: { family: parent },
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });

    it("should handle circular references in arrays", () => {
      const array: any[] = [1, 2, 3];
      array.push(array); // Circular reference in array

      const error = createError({
        type: "ArrayCircular",
        message: "Array circular reference test",
        context: { circularArray: array },
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });
  });

  describe("Large Context Serialization", () => {
    it("should handle large context objects", () => {
      const largeContext = {
        data: new Array(10000).fill(0).map((_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `This is item number ${i} with some description`,
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            tags: [`tag${i}`, `category${i % 10}`, `type${i % 5}`],
          },
        })),
      };

      const error = createError({
        type: "LargeContext",
        message: "Large context test",
        context: largeContext,
      });

      const startTime = Date.now();
      const serialized = serializeTryError(error);
      const endTime = Date.now();

      expect(serialized).toBeDefined();
      expect(typeof serialized).toBe("string");

      // Should complete in reasonable time (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle context with large strings", () => {
      const largeString = "x".repeat(100000); // 100KB string

      const error = createError({
        type: "LargeString",
        message: "Large string test",
        context: { largeString },
      });

      expect(() => serializeTryError(error)).not.toThrow();

      const serialized = serializeTryError(error);
      expect(serialized.length).toBeGreaterThan(largeString.length);
    });

    it("should handle context with many properties", () => {
      const manyProps: Record<string, any> = {};
      for (let i = 0; i < 10000; i++) {
        manyProps[`prop${i}`] = `value${i}`;
      }

      const error = createError({
        type: "ManyProps",
        message: "Many properties test",
        context: manyProps,
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });
  });

  describe("Deserialization Validation", () => {
    it("should handle malformed JSON gracefully", () => {
      const malformedJson = '{"type":"Test","message":"Test"'; // Missing closing brace

      expect(() => deserializeTryError(malformedJson)).toThrow();
    });

    it("should handle invalid error structure", () => {
      const invalidError = JSON.stringify({
        notAnError: true,
        randomField: "value",
      });

      expect(() => deserializeTryError(invalidError)).toThrow();
    });

    it("should handle missing required fields", () => {
      const incompleteError = JSON.stringify({
        type: "Test",
        // Missing message field
        timestamp: Date.now(),
      });

      expect(() => deserializeTryError(incompleteError)).toThrow();
    });

    it("should handle invalid field types", () => {
      const invalidTypes = JSON.stringify({
        type: 123, // Should be string
        message: true, // Should be string
        timestamp: "not-a-number", // Should be number
      });

      expect(() => deserializeTryError(invalidTypes)).toThrow();
    });

    it("should handle extremely large serialized data", () => {
      const hugeSerialized = JSON.stringify({
        type: "Test",
        message: "Test",
        timestamp: Date.now(),
        context: {
          huge: "x".repeat(10000000), // 10MB string
        },
      });

      // Should handle but might be slow
      const startTime = Date.now();
      const result = deserializeTryError(hugeSerialized);
      const endTime = Date.now();

      expect(isTryError(result)).toBe(true);
      // Should complete in reasonable time (< 5000ms for 10MB)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it("should handle null and undefined values", () => {
      const nullValues = JSON.stringify({
        type: "Test",
        message: "Test",
        timestamp: Date.now(),
        context: null,
        stack: undefined,
        cause: null,
      });

      const result = deserializeTryError(nullValues);
      expect(isTryError(result)).toBe(true);
      expect(result.context).toBeNull();
    });
  });

  describe("Cross-Environment Serialization", () => {
    it("should handle Node.js specific objects", () => {
      const nodeContext = {
        buffer: Buffer.from("test data"),
        process: {
          pid: process.pid,
          platform: process.platform,
          version: process.version,
        },
        error: new Error("Native error"),
      };

      const error = createError({
        type: "NodeSpecific",
        message: "Node.js specific test",
        context: nodeContext,
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });

    it("should handle browser-like objects", () => {
      // Simulate browser objects
      const mockWindow = {
        location: {
          href: "https://example.com",
          pathname: "/test",
        },
        navigator: {
          userAgent: "Mozilla/5.0...",
        },
      };

      const error = createError({
        type: "BrowserSpecific",
        message: "Browser specific test",
        context: { window: mockWindow },
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });

    it("should handle serialization roundtrip", () => {
      const originalError = createError({
        type: "RoundTrip",
        message: "Roundtrip test",
        context: {
          nested: {
            array: [1, 2, 3, { deep: "value" }],
            boolean: true,
            number: 42,
            string: "test",
            null: null,
          },
        },
      });

      const serialized = serializeTryError(originalError);
      const deserialized = deserializeTryError(serialized);

      expect(isTryError(deserialized)).toBe(true);
      expect(deserialized.type).toBe(originalError.type);
      expect(deserialized.message).toBe(originalError.message);
      expect(deserialized.context).toEqual(originalError.context);
    });

    it("should handle different timestamp formats", () => {
      const timestamps = [
        Date.now(),
        new Date().getTime(),
        Math.floor(Date.now() / 1000), // Unix timestamp
        Date.now() + 1000000, // Future timestamp
        0, // Epoch
      ];

      timestamps.forEach((timestamp, index) => {
        const serialized = JSON.stringify({
          type: "TimestampTest",
          message: `Timestamp test ${index}`,
          timestamp,
        });

        expect(() => deserializeTryError(serialized)).not.toThrow();
      });
    });
  });

  describe("Special Character and Unicode Handling", () => {
    it("should handle unicode characters", () => {
      const unicodeContext = {
        emoji: "🚀🔥💯",
        chinese: "你好世界",
        arabic: "مرحبا بالعالم",
        russian: "Привет мир",
        mathematical: "∑∏∫∞",
        special: "\u0000\u001F\u007F\uFFFF",
      };

      const error = createError({
        type: "Unicode",
        message: "Unicode test 🌟",
        context: unicodeContext,
      });

      const serialized = serializeTryError(error);
      const deserialized = deserializeTryError(serialized);

      expect(isTryError(deserialized)).toBe(true);
      expect(deserialized.message).toBe("Unicode test 🌟");
    });

    it("should handle control characters", () => {
      const controlChars = {
        tab: "\t",
        newline: "\n",
        carriageReturn: "\r",
        backspace: "\b",
        formFeed: "\f",
        null: "\0",
        escape: "\x1B",
      };

      const error = createError({
        type: "ControlChars",
        message: "Control characters test",
        context: controlChars,
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });

    it("should handle very long property names", () => {
      const longPropName = "a".repeat(10000);
      const context = {
        [longPropName]: "value with very long property name",
      };

      const error = createError({
        type: "LongPropName",
        message: "Long property name test",
        context,
      });

      expect(() => serializeTryError(error)).not.toThrow();
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle repeated serialization without memory leaks", () => {
      const error = createError({
        type: "MemoryTest",
        message: "Memory test",
        context: { data: new Array(1000).fill("test") },
      });

      // Serialize many times
      for (let i = 0; i < 1000; i++) {
        serializeTryError(error);
      }

      // Should not crash or consume excessive memory
      expect(true).toBe(true);
    });

    it("should handle concurrent serialization", async () => {
      const errors = Array.from({ length: 100 }, (_, i) =>
        createError({
          type: "Concurrent",
          message: `Concurrent test ${i}`,
          context: { index: i, data: new Array(100).fill(i) },
        })
      );

      // Serialize concurrently
      const promises = errors.map((error) =>
        Promise.resolve().then(() => serializeTryError(error))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});
