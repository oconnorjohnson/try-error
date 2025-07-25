import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function APIFrameworksGuidePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          API Framework Integration
        </h1>
        <p className="text-xl text-slate-600">
          Learn how to integrate tryError with modern API frameworks for
          type-safe error handling across client and server
        </p>
      </div>

      <div className="space-y-12">
        {/* tRPC Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            tRPC Integration
          </h2>

          <p className="text-slate-600 mb-6">
            tRPC provides end-to-end type safety, but tryError can enhance error
            handling for non-tRPC operations and provide consistent error
            patterns.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Server-side Integration
              </h3>
              <CodeBlock
                language="typescript"
                title="tRPC with tryError on the server"
                showLineNumbers={true}
              >
                {`import { initTRPC, TRPCError } from '@trpc/server';
import { tryAsync, isTryError, createError } from '@try-error/core';
import { z } from 'zod';

const t = initTRPC.create();

// Custom error transformer
function tryErrorToTRPCError(error: TryError): TRPCError {
  const errorMap: Record<string, any> = {
    'ValidationError': 'BAD_REQUEST',
    'AuthenticationError': 'UNAUTHORIZED',
    'AuthorizationError': 'FORBIDDEN',
    'NotFoundError': 'NOT_FOUND',
    'ConflictError': 'CONFLICT',
    'RateLimitError': 'TOO_MANY_REQUESTS',
  };

  return new TRPCError({
    code: errorMap[error.type] || 'INTERNAL_SERVER_ERROR',
    message: error.message,
    cause: error,
  });
}

// Helper to convert tryError results to tRPC responses
const handleTryResult = <T>(result: T | TryError): T => {
  if (isTryError(result)) {
    throw tryErrorToTRPCError(result);
  }
  return result;
};

// Create base procedure
const publicProcedure = t.procedure;

// Example router
export const userRouter = t.router({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Use tryAsync for database operations
      const userResult = await tryAsync(async () => {
        const user = await db.user.findUnique({
          where: { id: input.id }
        });
        
        if (!user) {
          throw createError({
            type: 'NotFoundError',
            message: \`User \${input.id} not found\`
          });
        }
        
        return user;
      });

      return handleTryResult(userResult);
    }),

  createUser: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const result = await tryAsync(async () => {
        // Check for existing user
        const existing = await db.user.findUnique({
          where: { email: input.email }
        });
        
        if (existing) {
          throw createError({
            type: 'ConflictError',
            message: 'User with this email already exists'
          });
        }

        return await db.user.create({ data: input });
      });

      return handleTryResult(result);
    }),
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Client-side Integration
              </h3>
              <CodeBlock
                language="typescript"
                title="tRPC client with tryError"
                showLineNumbers={true}
              >
                {`import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { tryAsync, isTryError } from '@try-error/core';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// Wrap tRPC calls with tryAsync for consistent error handling
export async function fetchUser(userId: string) {
  const result = await tryAsync(async () => {
    return await trpc.user.getUser.query({ id: userId });
  });

  if (isTryError(result)) {
    // Handle both tRPC errors and network errors consistently
    console.error('Failed to fetch user:', result);
    return null;
  }

  return result;
}

// React component using the wrapped function
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(user => {
      setUser(user);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* GraphQL Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            GraphQL Integration
          </h2>

          <p className="text-slate-600 mb-6">
            Use tryError with GraphQL resolvers for consistent error handling
            and type-safe error responses.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Apollo Server Integration
              </h3>
              <CodeBlock
                language="typescript"
                title="GraphQL resolvers with tryError"
                showLineNumbers={true}
              >
                {`import { ApolloServer, gql, ApolloError } from 'apollo-server';
import { tryAsync, isTryError, createError } from '@try-error/core';

// Type definitions
const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    user(id: ID!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }
\`;

// Convert tryError to ApolloError
function tryErrorToApolloError(error: TryError): ApolloError {
  const errorMap: Record<string, string> = {
    'ValidationError': 'BAD_USER_INPUT',
    'AuthenticationError': 'UNAUTHENTICATED',
    'AuthorizationError': 'FORBIDDEN',
    'NotFoundError': 'NOT_FOUND',
  };

  return new ApolloError(
    error.message,
    errorMap[error.type] || 'INTERNAL_SERVER_ERROR',
    error.context
  );
}

// Resolvers with tryError
const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      const result = await tryAsync(async () => {
        const user = await db.user.findUnique({ where: { id } });
        
        if (!user) {
          throw createError({
            type: 'NotFoundError',
            message: \`User with id \${id} not found\`,
            context: { userId: id }
          });
        }
        
        return user;
      });

      if (isTryError(result)) {
        throw tryErrorToApolloError(result);
      }

      return result;
    },
  },

  Mutation: {
    createUser: async (_: any, { input }: { input: any }) => {
      const result = await tryAsync(async () => {
        // Validate email uniqueness
        const existing = await db.user.findUnique({
          where: { email: input.email }
        });
        
        if (existing) {
          throw createError({
            type: 'ValidationError',
            message: 'Email already in use',
            context: { field: 'email', value: input.email }
          });
        }

        return await db.user.create({ data: input });
      });

      if (isTryError(result)) {
        throw tryErrorToApolloError(result);
      }

      return result;
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    // Log errors for monitoring
    console.error('GraphQL Error:', err);
    
    // Return formatted error to client
    return {
      message: err.message,
      code: err.extensions?.code,
      ...(process.env.NODE_ENV === 'development' && {
        extensions: err.extensions
      })
    };
  },
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                GraphQL Client with tryError
              </h3>
              <CodeBlock
                language="typescript"
                title="Apollo Client with tryError"
                showLineNumbers={true}
              >
                {`import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { tryAsync, isTryError, createError } from '@try-error/core';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

// Wrap GraphQL queries with tryError
export async function getUser(userId: string) {
  const result = await tryAsync(async () => {
    const { data } = await client.query({
      query: gql\`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
            email
          }
        }
      \`,
      variables: { id: userId },
    });

    if (!data.user) {
      throw createError({
        type: 'NotFoundError',
        message: 'User not found'
      });
    }

    return data.user;
  });

  return result;
}

// React hook with tryError
export function useUser(userId: string) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState<TryError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser(userId).then(result => {
      if (isTryError(result)) {
        setError(result);
      } else {
        setUser(result);
      }
      setLoading(false);
    });
  }, [userId]);

  return { user, error, loading };
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* OpenAPI/REST Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            OpenAPI / REST API Integration
          </h2>

          <p className="text-slate-600 mb-6">
            Integrate tryError with OpenAPI-generated clients or custom REST API
            clients for consistent error handling.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                OpenAPI Client Wrapper
              </h3>
              <CodeBlock
                language="typescript"
                title="Wrapping OpenAPI-generated clients"
                showLineNumbers={true}
              >
                {`import { tryAsync, createError, TryResult } from '@try-error/core';
import { UserApi, Configuration } from './generated-api-client';

// Create a wrapper for OpenAPI-generated clients
export class ApiClient {
  private userApi: UserApi;

  constructor(baseUrl: string, token?: string) {
    const config = new Configuration({
      basePath: baseUrl,
      headers: token ? { Authorization: \`Bearer \${token}\` } : {},
    });
    
    this.userApi = new UserApi(config);
  }

  async getUser(userId: string): Promise<TryResult<User, ApiError>> {
    const response = await tryAsync(() => this.userApi.getUser(userId));
    
    if (isTryError(response)) {
      // The generated client threw an error - map it to our domain errors
      const error = response.cause as any;
      
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            return createError({
              type: 'ValidationError',
              message: data.message || 'Invalid request',
              context: { errors: data.errors }
            });
          case 401:
            return createError({
              type: 'AuthenticationError',
              message: 'Authentication required'
            });
          case 403:
            return createError({
              type: 'AuthorizationError',
              message: 'Insufficient permissions'
            });
          case 404:
            return createError({
              type: 'NotFoundError',
              message: \`User \${userId} not found\`
            });
          case 429:
            return createError({
              type: 'RateLimitError',
              message: 'Too many requests',
              context: { retryAfter: error.response.headers['retry-after'] }
            });
          default:
            return createError({
              type: 'ServerError',
              message: data.message || \`Server error: \${status}\`,
              context: { status, data }
            });
        }
      }
      
      // Network errors
      if (error?.request) {
        return createError({
          type: 'NetworkError',
          message: 'Network request failed',
          context: { originalError: response }
        });
      }
      
      return response; // Return original error if we can't map it
    }
    
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<TryResult<User, ApiError>> {
    const response = await tryAsync(() => this.userApi.createUser(userData));
    
    if (isTryError(response)) {
      // Similar error mapping as getUser
      return this.mapApiError(response);
    }
    
    return response.data;
  }
  
  private mapApiError(error: TryError): TryError {
    // Reusable error mapping logic
    const cause = error.cause as any;
    if (cause?.response?.status === 409) {
      return createError({
        type: 'ConflictError',
        message: 'Resource already exists',
        cause: error
      });
    }
    return error;
  }
}

// Usage
const api = new ApiClient('https://api.example.com', authToken);

const userResult = await api.getUser('123');
if (isTryError(userResult)) {
  switch (userResult.type) {
    case 'NotFoundError':
      // Handle 404
      break;
    case 'AuthenticationError':
      // Redirect to login
      break;
    default:
      // Handle other errors
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Custom REST Client with tryError
              </h3>
              <CodeBlock
                language="typescript"
                title="Building a REST client with tryError"
                showLineNumbers={true}
              >
                {`import { tryAsync, createError, TryResult, TryError } from '@try-error/core';

// Define API-specific error types
type ApiErrorType = 
  | 'NetworkError'
  | 'ValidationError'
  | 'AuthenticationError'
  | 'AuthorizationError'
  | 'NotFoundError'
  | 'RateLimitError'
  | 'ServerError';

interface ApiError extends TryError<ApiErrorType> {
  statusCode?: number;
  endpoint?: string;
  requestId?: string;
}

// REST client with built-in tryError support
export class RestClient {
  constructor(
    private baseUrl: string,
    private defaultHeaders: Record<string, string> = {}
  ) {}

  private async request<T>(
    method: string,
    path: string,
    options: RequestInit = {}
  ): Promise<TryResult<T, ApiError>> {
    return tryAsync(async () => {
      const url = \`\${this.baseUrl}\${path}\`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...options.headers,
        },
        ...options,
      });

      const requestId = response.headers.get('x-request-id') || undefined;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const errorMap: Record<number, ApiErrorType> = {
          400: 'ValidationError',
          401: 'AuthenticationError',
          403: 'AuthorizationError',
          404: 'NotFoundError',
          429: 'RateLimitError',
        };

        throw createError({
          type: errorMap[response.status] || 'ServerError',
          message: errorData.message || \`HTTP \${response.status}\`,
          context: {
            statusCode: response.status,
            endpoint: url,
            requestId,
            details: errorData,
          }
        }) as ApiError;
      }

      return response.json();
    });
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, data?: any, options?: RequestInit) {
    return this.request<T>('POST', path, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(path: string, data?: any, options?: RequestInit) {
    return this.request<T>('PUT', path, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(path: string, options?: RequestInit) {
    return this.request<T>('DELETE', path, options);
  }
}

// Create typed API client
export class UserApiClient extends RestClient {
  async getUser(userId: string) {
    return this.get<User>(\`/users/\${userId}\`);
  }

  async createUser(userData: CreateUserRequest) {
    return this.post<User>('/users', userData);
  }

  async updateUser(userId: string, updates: Partial<User>) {
    return this.put<User>(\`/users/\${userId}\`, updates);
  }

  async deleteUser(userId: string) {
    return this.delete<void>(\`/users/\${userId}\`);
  }
}

// Usage with React
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const api = new UserApiClient('https://api.example.com');
    
    api.getUser(userId).then(result => {
      if (isTryError(result)) {
        setError(result);
        
        // Type-safe error handling
        if (result.type === 'NotFoundError') {
          console.log('User not found');
        } else if (result.type === 'AuthenticationError') {
          // Redirect to login
        }
      } else {
        setUser(result);
      }
    });
  }, [userId]);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return <div>{user.name}</div>;
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Best Practices for API Integration
          </h2>

          <div className="bg-slate-50 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                1. Consistent Error Types
              </h3>
              <p className="text-slate-600">
                Define a standard set of error types that map to HTTP status
                codes. This makes error handling predictable across your entire
                application.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                2. Error Context
              </h3>
              <p className="text-slate-600">
                Include relevant context in errors (request IDs, endpoints,
                status codes) to aid in debugging and monitoring.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                3. Type Safety
              </h3>
              <p className="text-slate-600">
                Use TypeScript discriminated unions with tryError to get
                compile-time guarantees about error handling.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                4. Retry Logic
              </h3>
              <p className="text-slate-600">
                Implement retry logic for transient errors (network issues, rate
                limits) using tryError's middleware system.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                5. Error Monitoring
              </h3>
              <p className="text-slate-600">
                Use tryError's onError hook to send API errors to monitoring
                services like Sentry or DataDog.
              </p>
            </div>
          </div>
        </section>

        {/* Migration Guide */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Migrating Existing APIs
          </h2>

          <CodeBlock
            language="typescript"
            title="Gradual migration strategy"
            showLineNumbers={true}
          >
            {`// Step 1: Wrap existing API calls with tryAsync
// Before: API client that throws errors
class LegacyApiClient {
  async getUser(id: string) {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    return response.json();
  }
}

// Step 2: Create a wrapper that uses tryAsync
class ApiWrapper {
  constructor(private client: LegacyApiClient) {}
  
  async getUser(id: string): Promise<TryResult<User, TryError>> {
    const result = await tryAsync(() => this.client.getUser(id));
    
    // If the legacy client threw, enhance the error
    if (isTryError(result)) {
      const message = result.message;
      
      // Map common HTTP errors to domain errors
      if (message.includes('HTTP 404')) {
        return createError({
          type: 'NotFoundError',
          message: \`User \${id} not found\`,
          cause: result
        });
      }
      
      if (message.includes('HTTP 401')) {
        return createError({
          type: 'AuthenticationError',
          message: 'Authentication required',
          cause: result
        });
      }
      
      // Return enhanced error for other cases
      return createError({
        type: 'ApiError',
        message: result.message,
        cause: result
      });
    }
    
    return result;
  }
}

// Step 3: Use the wrapped API
const api = new ApiWrapper(new LegacyApiClient());

// Now all consumers get TryResult instead of exceptions
const userResult = await api.getUser('123');
if (isTryError(userResult)) {
  console.error('Failed to get user:', userResult.message);
  // No try-catch needed!
} else {
  console.log('User:', userResult.name);
}`}
          </CodeBlock>
        </section>
      </div>
    </div>
  );
}
