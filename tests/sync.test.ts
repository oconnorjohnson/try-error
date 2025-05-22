import {
  trySync,
  trySyncTuple,
  tryCall,
  tryMap,
  tryChain,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  isOk,
  isErr,
  tryAll,
  tryAny,
  TrySyncOptions,
} from "../src/sync";

describe("Synchronous Error Handling", () => {
  describe("trySync", () => {
    it("should return success value when function succeeds", () => {
      const result = trySync(() => JSON.parse('{"name": "test"}'));

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.name).toBe("test");
      }
    });

    it("should return TryError when function throws", () => {
      const result = trySync(() => JSON.parse("invalid json"));

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.type).toBe("SyntaxError");
        expect(result.message).toContain("Unexpected token");
      }
    });

    it("should use custom error type when provided", () => {
      const options: TrySyncOptions = {
        errorType: "CustomParseError",
        message: "Custom parse failure",
        context: { input: "invalid" },
      };

      const result = trySync(() => JSON.parse("invalid json"), options);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.type).toBe("CustomParseError");
        expect(result.message).toBe("Custom parse failure");
        expect(result.context).toEqual({ input: "invalid" });
      }
    });

    it("should include context in error", () => {
      const context = { operation: "parse", attempt: 1 };
      const result = trySync(
        () => {
          throw new Error("Test error");
        },
        { context }
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.context).toEqual(context);
      }
    });
  });

  describe("trySyncTuple", () => {
    it("should return [result, null] on success", () => {
      const [result, error] = trySyncTuple(() =>
        JSON.parse('{"name": "test"}')
      );

      expect(error).toBeNull();
      expect(result).toEqual({ name: "test" });
    });

    it("should return [null, error] on failure", () => {
      const [result, error] = trySyncTuple(() => JSON.parse("invalid json"));

      expect(result).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.type).toBe("SyntaxError");
    });
  });

  describe("tryCall", () => {
    it("should call function with arguments", () => {
      const result = tryCall(parseInt, "123", 10);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe(123);
      }
    });

    it("should handle function that throws", () => {
      const throwingFn = (message: string) => {
        throw new Error(message);
      };

      const result = tryCall(throwingFn, "test error");

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("test error");
      }
    });

    it("should accept options as first argument", () => {
      const options: TrySyncOptions = {
        errorType: "CustomError",
        context: { fn: "parseInt" },
      };

      const throwingFn = () => {
        throw new Error("Parse failed");
      };

      const result = tryCall(throwingFn, options);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.type).toBe("CustomError");
        expect(result.context).toEqual({ fn: "parseInt" });
      }
    });

    it("should handle zero-argument functions", () => {
      const result = tryCall(() => "success");

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success");
      }
    });
  });

  describe("tryMap", () => {
    it("should transform successful result", () => {
      const parseResult = trySync(() => JSON.parse('{"name": "test"}'));
      const upperResult = tryMap(parseResult, (obj: any) =>
        obj.name.toUpperCase()
      );

      expect(isOk(upperResult)).toBe(true);
      if (isOk(upperResult)) {
        expect(upperResult).toBe("TEST");
      }
    });

    it("should pass through errors unchanged", () => {
      const parseResult = trySync(() => JSON.parse("invalid json"));
      const upperResult = tryMap(parseResult, (obj: any) =>
        obj.name.toUpperCase()
      );

      expect(isErr(upperResult)).toBe(true);
      if (isErr(upperResult)) {
        expect(upperResult.type).toBe("SyntaxError");
      }
    });

    it("should catch errors in mapper function", () => {
      const parseResult = trySync(() => JSON.parse('{"name": "test"}'));
      const errorResult = tryMap(parseResult, () => {
        throw new Error("Mapper failed");
      });

      expect(isErr(errorResult)).toBe(true);
      if (isErr(errorResult)) {
        expect(errorResult.message).toBe("Mapper failed");
      }
    });
  });

  describe("tryChain", () => {
    it("should chain successful operations", () => {
      const parseResult = trySync(() => JSON.parse('{"value": 42}'));
      const doubleResult = tryChain(parseResult, (obj: any) =>
        trySync(() => obj.value * 2)
      );

      expect(isOk(doubleResult)).toBe(true);
      if (isOk(doubleResult)) {
        expect(doubleResult).toBe(84);
      }
    });

    it("should short-circuit on first error", () => {
      const parseResult = trySync(() => JSON.parse("invalid json"));
      const doubleResult = tryChain(parseResult, (obj: any) =>
        trySync(() => obj.value * 2)
      );

      expect(isErr(doubleResult)).toBe(true);
      if (isErr(doubleResult)) {
        expect(doubleResult.type).toBe("SyntaxError");
      }
    });

    it("should return error from chainer function", () => {
      const parseResult = trySync(() => JSON.parse('{"value": 42}'));
      const errorResult = tryChain(parseResult, () =>
        trySync(() => {
          throw new Error("Chainer failed");
        })
      );

      expect(isErr(errorResult)).toBe(true);
      if (isErr(errorResult)) {
        expect(errorResult.message).toBe("Chainer failed");
      }
    });
  });

  describe("unwrap", () => {
    it("should return success value", () => {
      const result = trySync(() => "success");
      const unwrapped = unwrap(result);

      expect(unwrapped).toBe("success");
    });

    it("should throw on error", () => {
      const result = trySync(() => {
        throw new Error("Test error");
      });

      expect(() => unwrap(result)).toThrow("Test error");
    });

    it("should throw with custom message", () => {
      const result = trySync(() => {
        throw new Error("Original error");
      });

      expect(() => unwrap(result, "Custom error message")).toThrow(
        "Custom error message"
      );
    });
  });

  describe("unwrapOr", () => {
    it("should return success value", () => {
      const result = trySync(() => "success");
      const unwrapped = unwrapOr(result, "default");

      expect(unwrapped).toBe("success");
    });

    it("should return default on error", () => {
      const result = trySync(() => {
        throw new Error("Test error");
      });
      const unwrapped = unwrapOr(result, "default");

      expect(unwrapped).toBe("default");
    });
  });

  describe("unwrapOrElse", () => {
    it("should return success value", () => {
      const result = trySync(() => "success");
      const unwrapped = unwrapOrElse(result, () => "default");

      expect(unwrapped).toBe("success");
    });

    it("should compute default on error", () => {
      const result = trySync(() => {
        throw new Error("Test error");
      });
      const unwrapped = unwrapOrElse(
        result,
        (error) => `Error: ${error.message}`
      );

      expect(unwrapped).toBe("Error: Test error");
    });
  });

  describe("isOk and isErr", () => {
    it("should correctly identify success", () => {
      const result = trySync(() => "success");

      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);
    });

    it("should correctly identify error", () => {
      const result = trySync(() => {
        throw new Error("Test error");
      });

      expect(isOk(result)).toBe(false);
      expect(isErr(result)).toBe(true);
    });
  });

  describe("tryAll", () => {
    it("should return all success values", () => {
      const results = tryAll([
        trySync(() => 1),
        trySync(() => "two"),
        trySync(() => true),
      ]);

      expect(isOk(results)).toBe(true);
      if (isOk(results)) {
        expect(results).toEqual([1, "two", true]);
      }
    });

    it("should return first error", () => {
      const results = tryAll([
        trySync(() => 1),
        trySync(() => {
          throw new Error("Second failed");
        }),
        trySync(() => true),
      ]);

      expect(isErr(results)).toBe(true);
      if (isErr(results)) {
        expect(results.message).toBe("Second failed");
      }
    });

    it("should handle empty array", () => {
      const results = tryAll([]);

      expect(isOk(results)).toBe(true);
      if (isOk(results)) {
        expect(results).toEqual([]);
      }
    });
  });

  describe("tryAny", () => {
    it("should return first success", () => {
      const result = tryAny([
        () =>
          trySync(() => {
            throw new Error("First failed");
          }),
        () => trySync(() => "second success"),
        () => trySync(() => "third success"),
      ]);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("second success");
      }
    });

    it("should return last error if all fail", () => {
      const result = tryAny([
        () =>
          trySync(() => {
            throw new Error("First failed");
          }),
        () =>
          trySync(() => {
            throw new Error("Second failed");
          }),
        () =>
          trySync(() => {
            throw new Error("Third failed");
          }),
      ]);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Third failed");
      }
    });

    it("should handle empty array", () => {
      const result = tryAny([]);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("All attempts failed");
      }
    });
  });

  describe("complex chaining scenarios", () => {
    it("should handle complex operation chains", () => {
      const jsonString =
        '{"users": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]}';

      const parseResult = trySync(() => JSON.parse(jsonString));
      const usersResult = tryChain(parseResult, (data: any) =>
        trySync(() => data.users)
      );
      const userResult = tryMap(usersResult, (users: any[]) =>
        users.find((u) => u.id === 1)
      );
      const nameResult = tryMap(userResult, (user: any) =>
        user.name.toUpperCase()
      );

      expect(isOk(nameResult)).toBe(true);
      if (isOk(nameResult)) {
        expect(nameResult).toBe("ALICE");
      }
    });

    it("should short-circuit on any error in chain", () => {
      const parseResult = trySync(() => JSON.parse("invalid json"));
      const usersResult = tryChain(parseResult, (data: any) =>
        trySync(() => data.users)
      );
      const userResult = tryMap(usersResult, (users: any[]) =>
        users.find((u) => u.id === 1)
      );
      const nameResult = tryMap(userResult, (user: any) =>
        user.name.toUpperCase()
      );

      expect(isErr(nameResult)).toBe(true);
      if (isErr(nameResult)) {
        expect(nameResult.type).toBe("SyntaxError");
      }
    });
  });
});
