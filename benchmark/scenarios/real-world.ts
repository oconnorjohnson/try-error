import { trySync, tryAsync, createError, isTryError } from "../../src";
import {
  runBenchmarkWithStats,
  formatResult,
  compareResults,
} from "../utils/statistics";

// Simulate common real-world scenarios

interface ApiResponse {
  id: number;
  name: string;
  email: string;
  metadata?: Record<string, unknown>;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

// 1. API Response Parsing (common in web apps)
export async function benchmarkApiResponseParsing() {
  console.log("\n📡 API Response Parsing Scenario");
  console.log("Simulating parsing API responses with validation\n");

  const validResponses = Array(950).fill({
    id: 123,
    name: "John Doe",
    email: "john@example.com",
    metadata: { role: "user", verified: true },
  });

  const invalidResponses = Array(50).fill({
    id: "invalid",
    name: null,
    email: "not-an-email",
  });

  const responses = [...validResponses, ...invalidResponses].sort(
    () => Math.random() - 0.5
  );

  // Native approach
  const nativeResult = runBenchmarkWithStats(
    "Native try/catch",
    () => {
      for (const response of responses) {
        try {
          if (typeof response.id !== "number") throw new Error("Invalid ID");
          if (!response.name) throw new Error("Missing name");
          if (!response.email?.includes("@")) throw new Error("Invalid email");
          // Process valid response
          const processed = { ...response, processed: true };
        } catch (e) {
          // Log error and continue
          const error = e as Error;
          const logEntry = { error: error.message, data: response };
        }
      }
    },
    1,
    100
  );

  // try-error approach
  const tryErrorResult = runBenchmarkWithStats(
    "try-error",
    () => {
      for (const response of responses) {
        const result = trySync(() => {
          if (typeof response.id !== "number") {
            throw createError({
              type: "ValidationError",
              message: "Invalid ID",
              context: { field: "id", value: response.id },
            });
          }
          if (!response.name) {
            throw createError({
              type: "ValidationError",
              message: "Missing name",
              context: { field: "name" },
            });
          }
          if (!response.email?.includes("@")) {
            throw createError({
              type: "ValidationError",
              message: "Invalid email",
              context: { field: "email", value: response.email },
            });
          }
          return { ...response, processed: true };
        });

        if (isTryError(result)) {
          const logEntry = {
            error: result.type,
            message: result.message,
            context: result.context,
            timestamp: result.timestamp,
          };
        }
      }
    },
    1,
    100
  );

  console.log(formatResult(nativeResult));
  console.log(formatResult(tryErrorResult, nativeResult));

  const comparison = compareResults(nativeResult, tryErrorResult);
  console.log(
    `\n✨ ${comparison.faster} is ${comparison.speedup.toFixed(1)}% faster`
  );
  if (comparison.significant) {
    console.log("   This difference is statistically significant!");
  }
}

// 2. Nested Error Handling (common in complex operations)
export async function benchmarkNestedErrorHandling() {
  console.log("\n🔄 Nested Error Handling Scenario");
  console.log("Simulating operations with multiple error levels\n");

  // Native approach
  const nativeResult = runBenchmarkWithStats(
    "Native nested try/catch",
    () => {
      for (let i = 0; i < 1000; i++) {
        try {
          // Level 1: Database operation
          try {
            // Level 2: Data parsing
            try {
              // Level 3: Validation
              if (i % 50 === 0) throw new Error("Validation failed");
              const data = { id: i, valid: true };
            } catch (e) {
              throw new Error(`Parse error: ${(e as Error).message}`);
            }
          } catch (e) {
            throw new Error(`Database error: ${(e as Error).message}`);
          }
        } catch (e) {
          // Handle top-level error
          const error = e as Error;
          const log = { error: error.message, operation: "nested", id: i };
        }
      }
    },
    1,
    100
  );

  // try-error approach
  const tryErrorResult = runBenchmarkWithStats(
    "try-error nested",
    () => {
      for (let i = 0; i < 1000; i++) {
        const result = trySync(() => {
          const dbResult = trySync(() => {
            const parseResult = trySync(() => {
              if (i % 50 === 0) {
                throw createError({
                  type: "ValidationError",
                  message: "Validation failed",
                  context: { id: i, level: 3 },
                });
              }
              return { id: i, valid: true };
            });

            if (isTryError(parseResult)) {
              throw createError({
                type: "ParseError",
                message: "Parse error",
                cause: parseResult,
                context: { level: 2 },
              });
            }
            return parseResult;
          });

          if (isTryError(dbResult)) {
            throw createError({
              type: "DatabaseError",
              message: "Database error",
              cause: dbResult,
              context: { level: 1 },
            });
          }
          return dbResult;
        });

        if (isTryError(result)) {
          const log = {
            type: result.type,
            message: result.message,
            context: result.context,
            chain: [] as string[],
          };

          // Trace error chain
          let current = result;
          while (current.cause && isTryError(current.cause)) {
            log.chain.push(current.cause.type);
            current = current.cause as typeof result;
          }
        }
      }
    },
    1,
    100
  );

  console.log(formatResult(nativeResult));
  console.log(formatResult(tryErrorResult, nativeResult));
}

// 3. Async Operations with Timeouts
export async function benchmarkAsyncWithTimeouts() {
  console.log("\n⏱️  Async Operations with Timeouts");
  console.log("Simulating API calls with timeout handling\n");

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Native approach
  const nativeResult = await runBenchmarkWithStats(
    "Native async/await",
    async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const result = await Promise.race([
            delay(i % 10 === 0 ? 15 : 5).then(() => ({ data: "success" })),
            delay(10).then(() => {
              throw new Error("Timeout");
            }),
          ]);
        } catch (e) {
          const error = e as Error;
          if (error.message === "Timeout") {
            // Handle timeout
          }
        }
      }
    },
    1,
    30
  );

  // try-error approach
  const tryErrorResult = await runBenchmarkWithStats(
    "try-error async",
    async () => {
      for (let i = 0; i < 100; i++) {
        const result = await tryAsync(async () => {
          return Promise.race([
            delay(i % 10 === 0 ? 15 : 5).then(() => ({ data: "success" })),
            delay(10).then(() => {
              throw createError({
                type: "TimeoutError",
                message: "Operation timed out",
                context: { timeout: 10, operation: "api-call" },
              });
            }),
          ]);
        });

        if (isTryError(result) && result.type === "TimeoutError") {
          // Handle timeout with context
          const retryDelay = (result.context?.timeout as number) * 2;
        }
      }
    },
    1,
    30
  );

  console.log(formatResult(nativeResult));
  console.log(formatResult(tryErrorResult, nativeResult));
}

// 4. Form Validation (common in web apps)
export async function benchmarkFormValidation() {
  console.log("\n📝 Form Validation Scenario");
  console.log("Simulating complex form validation with multiple fields\n");

  interface FormData {
    username: string;
    email: string;
    password: string;
    age: number;
    terms: boolean;
  }

  const validForms: FormData[] = Array(900).fill({
    username: "johndoe",
    email: "john@example.com",
    password: "SecurePass123!",
    age: 25,
    terms: true,
  });

  const invalidForms: FormData[] = Array(100)
    .fill(null)
    .map((_, i) => ({
      username: i % 5 === 0 ? "" : "johndoe",
      email: i % 4 === 0 ? "invalid" : "john@example.com",
      password: i % 3 === 0 ? "weak" : "SecurePass123!",
      age: i % 6 === 0 ? -1 : 25,
      terms: i % 2 === 0 ? false : true,
    }));

  const forms = [...validForms, ...invalidForms].sort(
    () => Math.random() - 0.5
  );

  // Native approach
  const nativeResult = runBenchmarkWithStats(
    "Native validation",
    () => {
      for (const form of forms) {
        const errors: string[] = [];

        try {
          if (!form.username || form.username.length < 3) {
            errors.push("Username must be at least 3 characters");
          }
          if (!form.email.includes("@")) {
            errors.push("Invalid email format");
          }
          if (form.password.length < 8) {
            errors.push("Password must be at least 8 characters");
          }
          if (form.age < 0 || form.age > 150) {
            errors.push("Invalid age");
          }
          if (!form.terms) {
            errors.push("Must accept terms");
          }

          if (errors.length > 0) {
            throw new Error(errors.join(", "));
          }

          // Process valid form
          const processed = { ...form, validated: true };
        } catch (e) {
          const error = e as Error;
          const validationResult = {
            valid: false,
            errors: error.message.split(", "),
          };
        }
      }
    },
    1,
    100
  );

  // try-error approach
  const tryErrorResult = runBenchmarkWithStats(
    "try-error validation",
    () => {
      for (const form of forms) {
        const result = trySync(() => {
          const errors: Array<{ field: string; message: string }> = [];

          if (!form.username || form.username.length < 3) {
            errors.push({
              field: "username",
              message: "Username must be at least 3 characters",
            });
          }
          if (!form.email.includes("@")) {
            errors.push({
              field: "email",
              message: "Invalid email format",
            });
          }
          if (form.password.length < 8) {
            errors.push({
              field: "password",
              message: "Password must be at least 8 characters",
            });
          }
          if (form.age < 0 || form.age > 150) {
            errors.push({
              field: "age",
              message: "Invalid age",
            });
          }
          if (!form.terms) {
            errors.push({
              field: "terms",
              message: "Must accept terms",
            });
          }

          if (errors.length > 0) {
            throw createError({
              type: "ValidationError",
              message: "Form validation failed",
              context: {
                errors,
                fields: errors.map((e) => e.field),
                errorCount: errors.length,
              },
            });
          }

          return { ...form, validated: true };
        });

        if (isTryError(result)) {
          const validationResult = {
            valid: false,
            type: result.type,
            errors: result.context?.errors as Array<{
              field: string;
              message: string;
            }>,
            errorCount: result.context?.errorCount,
          };
        }
      }
    },
    1,
    100
  );

  console.log(formatResult(nativeResult));
  console.log(formatResult(tryErrorResult, nativeResult));
}

// Run all scenarios
export async function runRealWorldBenchmarks() {
  console.log("🌍 Real-World Benchmark Scenarios");
  console.log("=".repeat(50));

  await benchmarkApiResponseParsing();
  await benchmarkNestedErrorHandling();
  await benchmarkAsyncWithTimeouts();
  await benchmarkFormValidation();

  console.log("\n" + "=".repeat(50));
  console.log("✅ Real-world benchmarks complete!");
}

if (require.main === module) {
  runRealWorldBenchmarks().catch(console.error);
}
