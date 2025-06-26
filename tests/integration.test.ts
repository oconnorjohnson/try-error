import {
  trySync,
  tryAsync,
  tryMapAsync,
  tryChain,
  tryChainAsync,
  tryAllAsync,
  tryAnyAsync,
  unwrapOr,
  isOk,
  isErr,
  createError,
  wrapError,
  withTimeout,
  retry,
  try$,
  try$$,
  TryError,
} from "../src/index";

// Mock APIs for testing
const mockApiClient = {
  async fetchUser(
    id: number
  ): Promise<{ id: number; name: string; email: string }> {
    if (id === 404) {
      throw new Error("User not found");
    }
    if (id === 500) {
      throw new Error("Internal server error");
    }
    return {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
    };
  },

  async fetchPosts(
    userId: number
  ): Promise<Array<{ id: number; title: string; content: string }>> {
    if (userId === 404) {
      throw new Error("User not found");
    }
    return [
      { id: 1, title: "Post 1", content: "Content 1" },
      { id: 2, title: "Post 2", content: "Content 2" },
    ];
  },

  parseJson(jsonString: string): any {
    return JSON.parse(jsonString);
  },

  validateEmail(email: string): boolean {
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }
    return true;
  },
};

describe("Integration Tests", () => {
  describe("API Client Scenario", () => {
    it("should handle successful API call chain", async () => {
      // Simulate: fetch user -> validate email -> fetch posts -> transform data
      const userId = 1;

      const userResult = await tryAsync(() => mockApiClient.fetchUser(userId));
      const emailValidation = tryChain(userResult, (user: any) =>
        trySync(() => mockApiClient.validateEmail(user.email))
      );
      const postsResult = await tryChainAsync(
        Promise.resolve(emailValidation),
        async (isValid: any) => {
          if (!isValid) throw new Error("Email validation failed");
          return tryAsync(() => mockApiClient.fetchPosts(userId));
        }
      );
      const transformedData = await tryMapAsync(
        Promise.resolve(postsResult),
        async (posts: any) => ({
          userId,
          postCount: posts.length,
          titles: posts.map((p: any) => p.title),
        })
      );

      expect(isOk(transformedData)).toBe(true);
      if (isOk(transformedData)) {
        expect((transformedData as any).userId).toBe(1);
        expect((transformedData as any).postCount).toBe(2);
        expect((transformedData as any).titles).toEqual(["Post 1", "Post 2"]);
      }
    });

    it("should handle API error propagation", async () => {
      const userId = 404;

      const userResult = await tryAsync(() => mockApiClient.fetchUser(userId));
      const postsResult = await tryChainAsync(
        Promise.resolve(userResult),
        async (user: any) => tryAsync(() => mockApiClient.fetchPosts(user.id))
      );

      expect(isErr(postsResult)).toBe(true);
      if (isErr(postsResult)) {
        expect(postsResult.message).toBe("User not found");
      }
    });

    it("should handle mixed sync/async error recovery", async () => {
      const invalidJson = '{"invalid": json}';
      const fallbackData = { fallback: true };

      // Try to parse JSON, fall back to default data
      const parseResult = trySync(() => mockApiClient.parseJson(invalidJson));
      const finalResult = unwrapOr(parseResult, fallbackData);

      expect(finalResult).toEqual(fallbackData);
    });
  });

  describe("File Processing Scenario", () => {
    it("should handle file-like operations with error recovery", async () => {
      // Simulate: read config -> parse JSON -> validate -> apply defaults
      const mockFileContent =
        '{"apiUrl": "https://api.example.com", "timeout": 5000}';
      const invalidFileContent = '{"invalid": json}';

      const readFile = async (content: string) => {
        if (content.includes("invalid")) {
          throw new Error("File read error");
        }
        return content;
      };

      // Try primary config, fall back to default
      const configResults = await tryAnyAsync([
        tryAsync(() => readFile(invalidFileContent)),
        tryAsync(() => readFile(mockFileContent)),
      ]);

      const finalConfig = isOk(configResults)
        ? configResults
        : '{"apiUrl": "https://default.api.com", "timeout": 3000}';

      const parsedConfig = await tryMapAsync(
        Promise.resolve(finalConfig),
        async (content: any) => {
          if (typeof content === "string") {
            return JSON.parse(content);
          }
          return content;
        }
      );

      expect(isOk(parsedConfig)).toBe(true);
      if (isOk(parsedConfig)) {
        expect(parsedConfig.apiUrl).toBe("https://api.example.com");
        expect(parsedConfig.timeout).toBe(5000);
      }
    });
  });

  describe("Batch Operations", () => {
    it("should handle parallel operations with partial failures", async () => {
      const userIds = [1, 2, 404, 3];

      // Fetch all users in parallel, collect successes and failures
      const userPromises = userIds.map((id) =>
        tryAsync(() => mockApiClient.fetchUser(id))
      );

      const results = await Promise.all(userPromises);
      const successes = results.filter(isOk);
      const failures = results.filter(isErr);

      expect(successes).toHaveLength(3);
      expect(failures).toHaveLength(1);

      if (isErr(failures[0])) {
        expect(failures[0].message).toBe("User not found");
      }
    });

    it("should handle all-or-nothing operations", async () => {
      const userIds = [1, 2, 3];

      const allUsersResult = await tryAllAsync(
        userIds.map((id) => tryAsync(() => mockApiClient.fetchUser(id)))
      );

      expect(isOk(allUsersResult)).toBe(true);
      if (isOk(allUsersResult)) {
        expect(allUsersResult).toHaveLength(3);
        expect((allUsersResult as any)[0].name).toBe("User 1");
      }
    });

    it("should fail fast on first error in all-or-nothing", async () => {
      const userIds = [1, 404, 3];

      const allUsersResult = await tryAllAsync(
        userIds.map((id) => tryAsync(() => mockApiClient.fetchUser(id)))
      );

      expect(isErr(allUsersResult)).toBe(true);
      if (isErr(allUsersResult)) {
        expect(allUsersResult.message).toBe("User not found");
      }
    });
  });

  describe("Timeout and Retry Scenarios", () => {
    it("should handle timeout scenarios", async () => {
      const slowOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return "slow result";
      };

      const result = await withTimeout(
        tryAsync(slowOperation),
        100,
        "Operation took too long"
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toBe("Operation took too long");
      }
    });

    it("should handle retry with eventual success", async () => {
      let attempts = 0;
      const unreliableOperation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error(`Attempt ${attempts} failed`);
        }
        return "success after retries";
      };

      const result = await retry(() => tryAsync(unreliableOperation), {
        attempts: 3,
        baseDelay: 10,
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result).toBe("success after retries");
      }
      expect(attempts).toBe(3);
    });
  });

  describe("Error Context and Debugging", () => {
    it("should preserve error context through chains", async () => {
      const context = { operation: "user-fetch", requestId: "req-123" };

      const result = await tryAsync(() => mockApiClient.fetchUser(404), {
        context,
        errorType: "UserFetchError",
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.type).toBe("UserFetchError");
        expect(result.context).toEqual(context);
        expect(result.cause).toBeInstanceOf(Error);
      }
    });

    it("should create rich error information", () => {
      const customError = createError({
        type: "ValidationError",
        message: "Email validation failed",
        context: { email: "invalid-email", field: "email" },
      });

      expect(customError.type).toBe("ValidationError");
      expect(customError.message).toBe("Email validation failed");
      expect(customError.context).toEqual({
        email: "invalid-email",
        field: "email",
      });
      expect(customError.timestamp).toBeGreaterThan(0);
      expect(customError.source).toMatch(/integration\.test\.ts:\d+:\d+/);
    });

    it("should wrap existing errors with additional context", () => {
      const originalError = new TypeError(
        "Cannot read property 'name' of undefined"
      );
      const wrappedError = wrapError(
        "DataProcessingError",
        originalError,
        "Failed to process user data",
        { userId: 123, step: "name-extraction" }
      );

      expect(wrappedError.type).toBe("DataProcessingError");
      expect(wrappedError.message).toBe("Failed to process user data");
      expect(wrappedError.cause).toBe(originalError);
      expect(wrappedError.context).toEqual({
        userId: 123,
        step: "name-extraction",
      });
    });
  });

  describe("Type Safety and Inference", () => {
    it("should maintain type safety through transformations", async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      interface UserProfile {
        userId: number;
        displayName: string;
        isValidEmail: boolean;
      }

      const userResult = await tryAsync(
        (): Promise<User> => mockApiClient.fetchUser(1)
      );
      const profileResult = await tryMapAsync(
        Promise.resolve(userResult),
        async (user: User): Promise<UserProfile> => ({
          userId: user.id,
          displayName: user.name.toUpperCase(),
          isValidEmail: user.email.includes("@"),
        })
      );

      expect(isOk(profileResult)).toBe(true);
      if (isOk(profileResult)) {
        // TypeScript should infer the correct type here
        expect((profileResult as any).userId).toBe(1);
        expect((profileResult as any).displayName).toBe("USER 1");
        expect((profileResult as any).isValidEmail).toBe(true);
      }
    });

    it("should work with discriminated union error types", async () => {
      type NetworkError = TryError<"NetworkError">;
      type ValidationError = TryError<"ValidationError">;
      type AppError = NetworkError | ValidationError;

      const networkError: NetworkError = createError({
        type: "NetworkError",
        message: "Connection failed",
      });

      const validationError: ValidationError = createError({
        type: "ValidationError",
        message: "Invalid input",
      });

      const handleError = (error: AppError) => {
        switch (error.type) {
          case "NetworkError":
            return "Please check your connection";
          case "ValidationError":
            return "Please check your input";
          default:
            // TypeScript should ensure this is never reached
            return "Unknown error";
        }
      };

      expect(handleError(networkError)).toBe("Please check your connection");
      expect(handleError(validationError)).toBe("Please check your input");
    });
  });

  describe("Convenience Aliases", () => {
    it("should work with short aliases", async () => {
      // Test try$ (sync alias)
      const syncResult = try$(() => JSON.parse('{"test": true}'));
      expect(isOk(syncResult)).toBe(true);

      // Test try$$ (async alias)
      const asyncResult = await try$$(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "async success";
      });
      expect(isOk(asyncResult)).toBe(true);
      if (isOk(asyncResult)) {
        expect(asyncResult).toBe("async success");
      }
    });
  });

  describe("Real-world Complex Scenario", () => {
    it("should handle a complete user onboarding flow", async () => {
      // Simulate: validate input -> create user -> send email -> log success
      interface CreateUserRequest {
        name: string;
        email: string;
      }

      interface User {
        id: number;
        name: string;
        email: string;
        createdAt: Date;
      }

      const mockServices = {
        validateInput: (input: CreateUserRequest) => {
          if (!input.name) throw new Error("Name is required");
          if (!input.email.includes("@")) throw new Error("Invalid email");
          return true;
        },

        createUser: async (input: CreateUserRequest): Promise<User> => {
          await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate DB call
          return {
            id: Math.floor(Math.random() * 1000),
            name: input.name,
            email: input.email,
            createdAt: new Date(),
          };
        },

        sendWelcomeEmail: async (user: User): Promise<boolean> => {
          await new Promise((resolve) => setTimeout(resolve, 30)); // Simulate email service
          if (user.email.includes("invalid")) {
            throw new Error("Email service unavailable");
          }
          return true;
        },

        logUserCreation: (user: User) => {
          console.log(`User created: ${user.id}`);
          return { logged: true, userId: user.id };
        },
      };

      const userInput: CreateUserRequest = {
        name: "John Doe",
        email: "john@example.com",
      };

      // Complete flow with error handling at each step
      const validationResult = trySync(() =>
        mockServices.validateInput(userInput)
      );

      const userCreationResult = await tryChainAsync(
        Promise.resolve(validationResult),
        async () => tryAsync(() => mockServices.createUser(userInput))
      );

      const emailResult = await tryChainAsync(
        Promise.resolve(userCreationResult),
        async (user: any) => tryAsync(() => mockServices.sendWelcomeEmail(user))
      );

      const logResult = await tryChainAsync(
        Promise.resolve(userCreationResult), // Log regardless of email success
        async (user: any) =>
          Promise.resolve(trySync(() => mockServices.logUserCreation(user)))
      );

      // Verify the flow completed successfully
      expect(isOk(userCreationResult)).toBe(true);
      expect(isOk(emailResult)).toBe(true);
      expect(isOk(logResult)).toBe(true);

      if (isOk(userCreationResult) && isOk(logResult)) {
        expect(userCreationResult.name).toBe("John Doe");
        expect(logResult.logged).toBe(true);
        expect(logResult.userId).toBe(userCreationResult.id);
      }
    });
  });
});
