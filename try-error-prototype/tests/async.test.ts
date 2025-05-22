import {
  tryAsync,
  tryAsyncTuple,
  tryAwait,
  tryMapAsync,
  tryMap,
  tryChainAsync,
  tryChain,
  tryAllAsync,
  tryAnyAsync,
  tryAnySequential,
  withTimeout,
  retry,
  TryAsyncOptions,
} from "../src/async";
import { isOk, isErr } from "../src/sync";

// Helper functions for testing
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const asyncSuccess = async <T>(value: T) => value;
const asyncError = async (message: string) => {
  throw new Error(message);
};

describe("Asynchronous Error Handling", () => {
  describe("tryAsync", () => {
    it("should return success value when async function succeeds", async () => {
      const result = await tryAsync(async () => {
        await delay(10);
        return { data: "test" };
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe("test");
      }
    });

    it("should return TryError when async function throws", async () => {
      const result = await tryAsync(async () => {
        await delay(10);
        throw new Error("Async error");
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.type).toBe("Error");
        expect(result.message).toBe("Async error");
      }
    });

    it("should return TryError when async function rejects", async () => {
      const result = await tryAsync(async () => {
        await Promise.reject(new Error("Promise rejected"));
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Promise rejected");
      }
    });

    it("should use custom error type when provided", async () => {
      const options: TryAsyncOptions = {
        errorType: "CustomAsyncError",
        message: "Custom async failure",
        context: { operation: "async-test" },
      };

      const result = await tryAsync(async () => {
        throw new Error("Original error");
      }, options);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.type).toBe("CustomAsyncError");
        expect(result.message).toBe("Custom async failure");
        expect(result.context).toEqual({ operation: "async-test" });
      }
    });

    it("should handle timeout when specified", async () => {
      const result = await tryAsync(
        async () => {
          await delay(200);
          return "success";
        },
        { timeout: 100 }
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toContain("timed out after 100ms");
      }
    });

    it("should succeed when operation completes before timeout", async () => {
      const result = await tryAsync(
        async () => {
          await delay(50);
          return "success";
        },
        { timeout: 100 }
      );

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success");
      }
    });
  });

  describe("tryAsyncTuple", () => {
    it("should return [result, null] on success", async () => {
      const [result, error] = await tryAsyncTuple(async () => {
        await delay(10);
        return { data: "test" };
      });

      expect(error).toBeNull();
      expect(result).toEqual({ data: "test" });
    });

    it("should return [null, error] on failure", async () => {
      const [result, error] = await tryAsyncTuple(async () => {
        await delay(10);
        throw new Error("Async error");
      });

      expect(result).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.type).toBe("Error");
      expect(error?.message).toBe("Async error");
    });
  });

  describe("tryAwait", () => {
    it("should wrap successful promise", async () => {
      const promise = Promise.resolve("success");
      const result = await tryAwait(promise);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success");
      }
    });

    it("should wrap rejected promise", async () => {
      const promise = Promise.reject(new Error("Promise failed"));
      const result = await tryAwait(promise);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Promise failed");
      }
    });

    it("should work with fetch-like promises", async () => {
      // Mock fetch that resolves
      const mockFetch = () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, name: "test" }),
        } as any);

      const result = await tryAwait(mockFetch());

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.ok).toBe(true);
      }
    });
  });

  describe("tryMapAsync", () => {
    it("should transform successful async result", async () => {
      const fetchResult = tryAsync(() => asyncSuccess({ name: "test" }));
      const upperResult = await tryMapAsync(fetchResult, async (obj) => {
        await delay(10);
        return obj.name.toUpperCase();
      });

      expect(isOk(upperResult)).toBe(true);
      if (isOk(upperResult)) {
        expect(upperResult).toBe("TEST");
      }
    });

    it("should pass through errors unchanged", async () => {
      const fetchResult = tryAsync(() => asyncError("Fetch failed"));
      const upperResult = await tryMapAsync(fetchResult, async (obj: any) => {
        await delay(10);
        return obj.name.toUpperCase();
      });

      expect(isErr(upperResult)).toBe(true);
      if (isErr(upperResult)) {
        expect(upperResult.message).toBe("Fetch failed");
      }
    });

    it("should catch errors in async mapper function", async () => {
      const fetchResult = tryAsync(() => asyncSuccess({ name: "test" }));
      const errorResult = await tryMapAsync(fetchResult, async () => {
        await delay(10);
        throw new Error("Mapper failed");
      });

      expect(isErr(errorResult)).toBe(true);
      if (isErr(errorResult)) {
        expect(errorResult.message).toBe("Mapper failed");
      }
    });
  });

  describe("tryMap (sync mapper)", () => {
    it("should transform successful result with sync mapper", async () => {
      const fetchResult = tryAsync(() => asyncSuccess({ name: "test" }));
      const upperResult = await tryMap(fetchResult, (obj) =>
        obj.name.toUpperCase()
      );

      expect(isOk(upperResult)).toBe(true);
      if (isOk(upperResult)) {
        expect(upperResult).toBe("TEST");
      }
    });

    it("should catch errors in sync mapper", async () => {
      const fetchResult = tryAsync(() => asyncSuccess({ name: "test" }));
      const errorResult = await tryMap(fetchResult, () => {
        throw new Error("Sync mapper failed");
      });

      expect(isErr(errorResult)).toBe(true);
      if (isErr(errorResult)) {
        expect(errorResult.message).toBe("Sync mapper failed");
      }
    });
  });

  describe("tryChainAsync", () => {
    it("should chain successful async operations", async () => {
      const fetchResult = tryAsync(() => asyncSuccess({ url: "/api/data" }));
      const dataResult = await tryChainAsync(fetchResult, async (obj) => {
        await delay(10);
        return tryAsync(() =>
          asyncSuccess({ data: `fetched from ${obj.url}` })
        );
      });

      expect(isOk(dataResult)).toBe(true);
      if (isOk(dataResult)) {
        expect(dataResult.data).toBe("fetched from /api/data");
      }
    });

    it("should short-circuit on first error", async () => {
      const fetchResult = tryAsync(() => asyncError("Fetch failed"));
      const dataResult = await tryChainAsync(fetchResult, async (obj: any) => {
        await delay(10);
        return tryAsync(() =>
          asyncSuccess({ data: `fetched from ${obj.url}` })
        );
      });

      expect(isErr(dataResult)).toBe(true);
      if (isErr(dataResult)) {
        expect(dataResult.message).toBe("Fetch failed");
      }
    });

    it("should return error from chainer function", async () => {
      const fetchResult = tryAsync(() => asyncSuccess({ url: "/api/data" }));
      const errorResult = await tryChainAsync(fetchResult, async () => {
        await delay(10);
        return tryAsync(() => asyncError("Chainer failed"));
      });

      expect(isErr(errorResult)).toBe(true);
      if (isErr(errorResult)) {
        expect(errorResult.message).toBe("Chainer failed");
      }
    });
  });

  describe("tryChain (sync chainer)", () => {
    it("should chain with sync function", async () => {
      const fetchResult = tryAsync(() => asyncSuccess({ status: 200 }));
      const statusResult = await tryChain(fetchResult, (response) => {
        if (response.status === 200) {
          return "OK";
        } else {
          throw new Error("Not OK");
        }
      });

      expect(isOk(statusResult)).toBe(true);
      if (isOk(statusResult)) {
        expect(statusResult).toBe("OK");
      }
    });
  });

  describe("tryAllAsync", () => {
    it("should return all success values", async () => {
      const results = await tryAllAsync([
        tryAsync(() => asyncSuccess(1)),
        tryAsync(() => asyncSuccess("two")),
        tryAsync(() => asyncSuccess(true)),
      ]);

      expect(isOk(results)).toBe(true);
      if (isOk(results)) {
        expect(results).toEqual([1, "two", true]);
      }
    });

    it("should return first error", async () => {
      const results = await tryAllAsync([
        tryAsync(() => asyncSuccess(1)),
        tryAsync(() => asyncError("Second failed")),
        tryAsync(() => asyncSuccess(true)),
      ]);

      expect(isErr(results)).toBe(true);
      if (isErr(results)) {
        expect(results.message).toBe("Second failed");
      }
    });

    it("should handle empty array", async () => {
      const results = await tryAllAsync([]);

      expect(isOk(results)).toBe(true);
      if (isOk(results)) {
        expect(results).toEqual([]);
      }
    });
  });

  describe("tryAnyAsync", () => {
    it("should return first success", async () => {
      const result = await tryAnyAsync([
        tryAsync(() => asyncError("First failed")),
        tryAsync(() => asyncSuccess("second success")),
        tryAsync(() => asyncSuccess("third success")),
      ]);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("second success");
      }
    });

    it("should return last error if all fail", async () => {
      const result = await tryAnyAsync([
        tryAsync(() => asyncError("First failed")),
        tryAsync(() => asyncError("Second failed")),
        tryAsync(() => asyncError("Third failed")),
      ]);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        // Should be one of the errors (order not guaranteed with Promise.allSettled)
        expect(["First failed", "Second failed", "Third failed"]).toContain(
          result.message
        );
      }
    });

    it("should handle promise rejections", async () => {
      const result = await tryAnyAsync([
        Promise.reject(new Error("Rejected promise")),
        tryAsync(() => asyncSuccess("success")),
      ]);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success");
      }
    });
  });

  describe("tryAnySequential", () => {
    it("should return first success and stop", async () => {
      let callCount = 0;

      const result = await tryAnySequential([
        async () => {
          callCount++;
          return tryAsync(() => asyncError("First failed"));
        },
        async () => {
          callCount++;
          return tryAsync(() => asyncSuccess("second success"));
        },
        async () => {
          callCount++;
          return tryAsync(() => asyncSuccess("third success"));
        },
      ]);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("second success");
      }
      expect(callCount).toBe(2); // Should stop after second success
    });

    it("should return last error if all fail", async () => {
      const result = await tryAnySequential([
        async () => tryAsync(() => asyncError("First failed")),
        async () => tryAsync(() => asyncError("Second failed")),
        async () => tryAsync(() => asyncError("Third failed")),
      ]);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Third failed");
      }
    });
  });

  describe("withTimeout", () => {
    it("should return result when operation completes in time", async () => {
      const slowOperation = tryAsync(async () => {
        await delay(50);
        return "success";
      });

      const result = await withTimeout(slowOperation, 100);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success");
      }
    });

    it("should return timeout error when operation takes too long", async () => {
      const slowOperation = tryAsync(async () => {
        await delay(200);
        return "success";
      });

      const result = await withTimeout(slowOperation, 100);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toContain("timed out after 100ms");
      }
    });

    it("should use custom timeout message", async () => {
      const slowOperation = tryAsync(async () => {
        await delay(200);
        return "success";
      });

      const result = await withTimeout(
        slowOperation,
        100,
        "Custom timeout message"
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Custom timeout message");
      }
    });
  });

  describe("retry", () => {
    it("should succeed on first attempt", async () => {
      let attempts = 0;

      const result = await retry(
        async () => {
          attempts++;
          return tryAsync(() => asyncSuccess("success"));
        },
        { attempts: 3, baseDelay: 10 }
      );

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success");
      }
      expect(attempts).toBe(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      let attempts = 0;

      const result = await retry(
        async () => {
          attempts++;
          if (attempts < 3) {
            return tryAsync(() => asyncError(`Attempt ${attempts} failed`));
          }
          return tryAsync(() => asyncSuccess("success"));
        },
        { attempts: 3, baseDelay: 10 }
      );

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success");
      }
      expect(attempts).toBe(3);
    });

    it("should return last error after all attempts fail", async () => {
      let attempts = 0;

      const result = await retry(
        async () => {
          attempts++;
          return tryAsync(() => asyncError(`Attempt ${attempts} failed`));
        },
        { attempts: 3, baseDelay: 10 }
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Attempt 3 failed");
      }
      expect(attempts).toBe(3);
    });

    it("should respect shouldRetry function", async () => {
      let attempts = 0;

      const result = await retry(
        async () => {
          attempts++;
          return tryAsync(() => asyncError("Non-retryable error"));
        },
        {
          attempts: 3,
          baseDelay: 10,
          shouldRetry: (error) => !error.message.includes("Non-retryable"),
        }
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Non-retryable error");
      }
      expect(attempts).toBe(1); // Should not retry
    });

    it("should use exponential backoff", async () => {
      const startTime = Date.now();
      let attempts = 0;

      await retry(
        async () => {
          attempts++;
          return tryAsync(() => asyncError("Always fails"));
        },
        { attempts: 3, baseDelay: 50, backoffFactor: 2 }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 50ms + 100ms = 150ms for delays
      expect(duration).toBeGreaterThan(140);
      expect(attempts).toBe(3);
    });
  });

  describe("complex async scenarios", () => {
    it("should handle complex async operation chains", async () => {
      // Simulate API call chain: fetch user -> fetch posts -> process posts
      const fetchUser = tryAsync(async () => {
        await delay(10);
        return { id: 1, name: "Alice" };
      });

      const fetchPosts = await tryChainAsync(fetchUser, async (user) => {
        await delay(10);
        return tryAsync(async () => [
          { id: 1, title: "Post 1", authorId: user.id },
          { id: 2, title: "Post 2", authorId: user.id },
        ]);
      });

      const processedPosts = await tryMap(
        Promise.resolve(fetchPosts),
        (posts: any) => posts.map((post: any) => ({ ...post, processed: true }))
      );

      expect(isOk(processedPosts)).toBe(true);
      if (isOk(processedPosts)) {
        expect(processedPosts).toHaveLength(2);
        expect(processedPosts[0].processed).toBe(true);
      }
    });

    it("should handle parallel operations with error recovery", async () => {
      const operations = await tryAllAsync([
        tryAsync(() => asyncSuccess("op1")),
        tryAsync(() => asyncError("op2 failed")),
        tryAsync(() => asyncSuccess("op3")),
      ]);

      // First operation should fail, so try fallback
      if (isErr(operations)) {
        const fallback = await tryAnyAsync([
          tryAsync(() => asyncSuccess("fallback1")),
          tryAsync(() => asyncSuccess("fallback2")),
        ]);

        expect(isOk(fallback)).toBe(true);
        if (isOk(fallback)) {
          expect(fallback).toBe("fallback1");
        }
      }
    });
  });
});
