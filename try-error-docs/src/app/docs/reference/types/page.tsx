export default function TypeScriptTypesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          TypeScript Types Reference
        </h1>
        <p className="text-xl text-slate-600">
          Complete reference for all TypeScript types, interfaces, and utilities
          in try-error
        </p>
      </div>

      <div className="space-y-8">
        {/* Core Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Core Types
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryError&lt;T&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                The main error interface that extends the standard Error with
                additional context and metadata.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`interface TryError<T = any> extends Error {
  readonly type: string;
  readonly message: string;
  readonly stack?: string;
  readonly source: string;
  readonly timestamp: number;
  readonly context?: T;
  readonly cause?: Error | TryError;
}`}</code>
                </pre>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">
                  Properties
                </h4>
                <ul className="space-y-1 text-slate-600 text-sm">
                  <li>
                    • <code>type</code> - Error classification (e.g.,
                    'ValidationError', 'NetworkError')
                  </li>
                  <li>
                    • <code>message</code> - Human-readable error description
                  </li>
                  <li>
                    • <code>stack</code> - Stack trace (optional)
                  </li>
                  <li>
                    • <code>source</code> - Source location where error was
                    created
                  </li>
                  <li>
                    • <code>timestamp</code> - Unix timestamp when error
                    occurred
                  </li>
                  <li>
                    • <code>context</code> - Additional error context data
                  </li>
                  <li>
                    • <code>cause</code> - Original error that caused this error
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryResult&lt;T, E&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Union type representing either a successful result or an error.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`type TryResult<T, E extends TryError = TryError> = T | E;`}</code>
                </pre>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">
                  Type Parameters
                </h4>
                <ul className="space-y-1 text-slate-600 text-sm">
                  <li>
                    • <code>T</code> - The success value type
                  </li>
                  <li>
                    • <code>E</code> - The error type (defaults to TryError)
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryTuple&lt;T, E&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Go-style tuple return type for functions that prefer tuple
                destructuring.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`type TryTuple<T, E extends TryError = TryError> = [T, null] | [null, E];`}</code>
                </pre>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">
                  Usage Example
                </h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded text-sm">
                  <pre>
                    <code>{`const [user, error] = await tryAsyncTuple(() => fetchUser('123'));
if (error) {
  console.error('Failed:', error.message);
} else {
  console.log('Success:', user.name);
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Utility Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Utility Types
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TrySuccess&lt;T&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Type alias for successful results, excluding error types.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`type TrySuccess<T> = T extends TryError ? never : T;`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryFailure&lt;E&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Type alias for error results, excluding success types.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`type TryFailure<E extends TryError = TryError> = E;`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                UnwrapTry&lt;T&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Extracts the success type from a TryResult, useful for type
                inference.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`type UnwrapTry<T> = T extends TryResult<infer U, any> ? U : T;`}</code>
                </pre>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">Example</h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded text-sm">
                  <pre>
                    <code>{`type UserResult = TryResult<User, TryError>;
type UserType = UnwrapTry<UserResult>; // User`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                UnwrapTryError&lt;T&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Extracts the error type from a TryResult.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`type UnwrapTryError<T> = T extends TryResult<any, infer E> ? E : never;`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Function Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Function Types
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryFunction&lt;T&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Type for synchronous functions that may throw errors.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`type TryFunction<T> = () => T;`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryAsyncFunction&lt;T&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Type for asynchronous functions that may throw errors.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`type TryAsyncFunction<T> = () => Promise<T>;`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryErrorFactory&lt;T&gt;
              </h3>
              <p className="text-slate-600 mb-3">
                Type for functions that create TryError instances.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`type TryErrorFactory<T = any> = (
  type: string,
  message: string,
  context?: T,
  cause?: Error | TryError
) => TryError<T>;`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Type Guards */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Type Guards
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                isTryError
              </h3>
              <p className="text-slate-600 mb-3">
                Type guard function to check if a value is a TryError.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`function isTryError<T = any>(value: unknown): value is TryError<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'message' in value &&
    'source' in value &&
    'timestamp' in value
  );
}`}</code>
                </pre>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">Usage</h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded text-sm">
                  <pre>
                    <code>{`const result = await tryAsync(() => fetchUser('123'));
if (isTryError(result)) {
  // TypeScript knows result is TryError
  console.error(result.message);
} else {
  // TypeScript knows result is User
  console.log(result.name);
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                isTrySuccess
              </h3>
              <p className="text-slate-600 mb-3">
                Type predicate to check if a TryResult is successful.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`function isTrySuccess<T, E extends TryError>(
  result: TryResult<T, E>
): result is TrySuccess<T> {
  return !isTryError(result);
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Advanced Types
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Conditional Error Types
              </h3>
              <p className="text-slate-600 mb-3">
                Advanced conditional types for complex error handling scenarios.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// Extract error type based on condition
type ExtractError<T, K extends string> = T extends TryError
  ? T['type'] extends K
    ? T
    : never
  : never;

// Map multiple error types
type ErrorMap<T extends Record<string, any>> = {
  [K in keyof T]: TryError<T[K]> & { type: K };
}[keyof T];

// Combine multiple TryResults
type CombineTryResults<T extends readonly TryResult<any, any>[]> = {
  [K in keyof T]: T[K] extends TryResult<infer U, any> ? U : never;
};`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Generic Constraints
              </h3>
              <p className="text-slate-600 mb-3">
                Common generic constraints used throughout the library.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// Ensure T is not a TryError
type NonError<T> = T extends TryError ? never : T;

// Ensure T extends TryError
type ErrorOnly<T> = T extends TryError ? T : never;

// Ensure T is serializable
type Serializable = string | number | boolean | null | undefined | 
  { [key: string]: Serializable } | Serializable[];

// Context constraint
type ErrorContext = Record<string, Serializable> | Serializable;`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Module Declarations */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Module Declarations
          </h2>

          <p className="text-slate-600 mb-4">
            Type declarations for extending try-error functionality.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Extend global Error interface
declare global {
  interface Error {
    toTryError?(): TryError;
  }
}

// Module augmentation for custom error types
declare module 'try-error' {
  interface TryErrorTypeMap {
    ValidationError: { field: string; value: unknown };
    NetworkError: { url: string; status?: number };
    AuthenticationError: { userId?: string };
    AuthorizationError: { resource: string; action: string };
    NotFoundError: { id: string; type: string };
    ConflictError: { field: string; value: unknown };
    RateLimitError: { limit: number; window: number };
  }
}

// Utility type for mapped error types
type MappedTryError<K extends keyof TryErrorTypeMap> = TryError<TryErrorTypeMap[K]> & {
  type: K;
};`}</code>
            </pre>
          </div>
        </section>

        {/* Type Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Practical Examples
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                API Response Types
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// Define API response types
interface User {
  id: string;
  name: string;
  email: string;
}

interface ApiError {
  code: string;
  details?: Record<string, unknown>;
}

// Function return types
type FetchUserResult = TryResult<User, TryError<ApiError>>;
type CreateUserResult = TryResult<User, TryError<ApiError>>;

// Usage
async function fetchUser(id: string): Promise<FetchUserResult> {
  return tryAsync(async () => {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      throw createTryError('ApiError', 'Failed to fetch user', {
        code: 'FETCH_FAILED',
        details: { userId: id, status: response.status }
      });
    }
    return response.json();
  });
}`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Service Layer Types
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// Service interface with try-error
interface UserService {
  findById(id: string): Promise<TryResult<User, TryError>>;
  create(data: CreateUserData): Promise<TryResult<User, TryError>>;
  update(id: string, data: UpdateUserData): Promise<TryResult<User, TryError>>;
  delete(id: string): Promise<TryResult<void, TryError>>;
}

// Implementation with specific error types
class UserServiceImpl implements UserService {
  async findById(id: string): Promise<TryResult<User, TryError>> {
    return tryAsync(async () => {
      const user = await this.repository.findById(id);
      if (!user) {
        throw createTryError('NotFoundError', \`User \${id} not found\`, {
          id,
          type: 'user'
        });
      }
      return user;
    });
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Error Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about the core error type concepts
              </p>
              <a
                href="/docs/concepts/error-types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error Types →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                API Reference
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Complete API documentation
              </p>
              <a
                href="/docs/api/sync"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View API Reference →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">React Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                TypeScript types for React integration
              </p>
              <a
                href="/docs/react/types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View React Types →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
