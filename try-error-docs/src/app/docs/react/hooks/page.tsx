import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/docs/code-block";

export default function ReactHooksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">React Hooks</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to using try-error hooks in React applications.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          The @try-error/react package provides hooks that integrate seamlessly
          with React's state management and lifecycle, making error handling
          declarative and type-safe.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>useTry</Badge>
              Async Operation Hook
            </CardTitle>
            <CardDescription>
              Handle async operations with loading states and error handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Usage</h4>
              <CodeBlock language="typescript" title="useTry basic example">
                {`import { useTry } from '@try-error/react';

function UserProfile({ userId }: { userId: string }) {
  const { data, error, loading, execute, reset } = useTry(
    async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    [userId] // Dependencies - will re-execute when userId changes
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No user found</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={reset}>Refresh</button>
    </div>
  );
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">API Reference</h4>
              <CodeBlock language="typescript" title="useTry type signature">
                {`function useTry<T>(
  operation: () => Promise<T>,
  deps?: React.DependencyList,
  options?: UseTryOptions
): UseTryResult<T>

interface UseTryOptions {
  immediate?: boolean;        // Execute immediately on mount (default: true)
  resetOnDepsChange?: boolean; // Reset state when deps change (default: true)
  retryCount?: number;        // Number of automatic retries (default: 0)
  retryDelay?: number;        // Delay between retries in ms (default: 1000)
}

interface UseTryResult<T> {
  data: T | null;            // Success result
  error: TryError | null;    // Error result
  loading: boolean;          // Loading state
  execute: () => Promise<void>; // Manual execution function
  reset: () => void;         // Reset state function
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Advanced Configuration</h4>
              <CodeBlock language="typescript" title="useTry with options">
                {`function DataFetcher() {
  const { data, error, loading, execute } = useTry(
    async () => {
      const result = await tryAsync(() => fetchCriticalData());
      if (isTryError(result)) {
        throw result; // Re-throw to trigger retry logic
      }
      return result;
    },
    [], // No dependencies - manual execution only
    {
      immediate: false,    // Don't execute on mount
      retryCount: 3,       // Retry up to 3 times
      retryDelay: 2000,    // Wait 2 seconds between retries
    }
  );

  return (
    <div>
      <button onClick={execute} disabled={loading}>
        {loading ? 'Fetching...' : 'Fetch Data'}
      </button>
      {error && <ErrorDisplay error={error} />}
      {data && <DataDisplay data={data} />}
    </div>
  );
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>useTryCallback</Badge>
              Event Handler Hook
            </CardTitle>
            <CardDescription>
              Create error-safe event handlers with loading states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Usage</h4>
              <CodeBlock language="typescript" title="useTryCallback example">
                {`import { useTryCallback } from '@try-error/react';

function CreateUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const { execute: createUser, loading, error } = useTryCallback(
    async (formData: { name: string; email: string }) => {
      const result = await tryAsync(() => 
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      );

      if (isTryError(result)) {
        throw result;
      }

      if (!result.ok) {
        throw createError({
          type: 'ValidationError',
          message: 'Failed to create user',
          context: { status: result.status }
        });
      }

      return result.json();
    },
    {
      onSuccess: (user) => {
        console.log('User created:', user);
        setName('');
        setEmail('');
      },
      onError: (error) => {
        console.error('Failed to create user:', error);
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        disabled={loading}
      />
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">API Reference</h4>
              <CodeBlock
                language="typescript"
                title="useTryCallback type signature"
              >
                {`function useTryCallback<TArgs extends any[], TResult>(
  callback: (...args: TArgs) => Promise<TResult>,
  options?: UseTryCallbackOptions<TResult>
): UseTryCallbackResult<TArgs>

interface UseTryCallbackOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: TryError) => void;
  onSettled?: () => void;
}

interface UseTryCallbackResult<TArgs extends any[]> {
  execute: (...args: TArgs) => Promise<void>;
  loading: boolean;
  error: TryError | null;
  reset: () => void;
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>useTryState</Badge>
              State Management Hook
            </CardTitle>
            <CardDescription>
              Manage async state with built-in error handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Usage</h4>
              <CodeBlock language="typescript" title="useTryState example">
                {`import { useTryState } from '@try-error/react';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserManager() {
  const [users, setUsers, { loading, error, reset }] = useTryState<User[]>([]);

  const loadUsers = async () => {
    const result = await tryAsync(() => fetch('/api/users').then(r => r.json()));
    setUsers(result); // Automatically handles success/error states
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    const result = await tryAsync(async () => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      return response.json();
    });

    if (isOk(result)) {
      setUsers(prev => isOk(prev) ? [...prev, result] : [result]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <ErrorDisplay error={error} onRetry={reset} />;
  if (!isOk(users)) return <div>No users</div>;

  return (
    <div>
      <UserList users={users} />
      <AddUserForm onAdd={addUser} />
    </div>
  );
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">API Reference</h4>
              <CodeBlock
                language="typescript"
                title="useTryState type signature"
              >
                {`function useTryState<T>(
  initialValue: T
): [
  TryResult<T>,
  (value: TryResult<T> | ((prev: TryResult<T>) => TryResult<T>)) => void,
  {
    loading: boolean;
    error: TryError | null;
    reset: () => void;
  }
]`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>useTryMutation</Badge>
              Mutation Hook
            </CardTitle>
            <CardDescription>
              Handle mutations with optimistic updates and rollback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Optimistic Updates</h4>
              <CodeBlock
                language="typescript"
                title="useTryMutation with optimistic updates"
              >
                {`import { useTryMutation } from '@try-error/react';

function TodoList({ todos, setTodos }: { 
  todos: Todo[], 
  setTodos: (todos: Todo[]) => void 
}) {
  const { mutate: toggleTodo, loading } = useTryMutation({
    mutationFn: async (todoId: string) => {
      const result = await tryAsync(() => 
        fetch(\`/api/todos/\${todoId}/toggle\`, { method: 'PUT' })
      );
      
      if (isTryError(result)) throw result;
      return result.json();
    },
    onMutate: async (todoId) => {
      // Optimistic update
      const previousTodos = todos;
      setTodos(todos.map(todo => 
        todo.id === todoId 
          ? { ...todo, completed: !todo.completed }
          : todo
      ));
      return { previousTodos };
    },
    onError: (error, todoId, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        setTodos(context.previousTodos);
      }
    },
    onSuccess: (data, todoId) => {
      // Sync with server response
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? data : todo
      ));
    }
  });

  return (
    <div>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          onToggle={() => toggleTodo(todo.id)}
          disabled={loading}
        />
      ))}
    </div>
  );
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
            <CardDescription>
              Recommended patterns for using try-error hooks effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">
                1. Error Boundaries Integration
              </h4>
              <CodeBlock
                language="typescript"
                title="Combining hooks with error boundaries"
              >
                {`import { TryErrorBoundary } from '@try-error/react';

function App() {
  return (
    <TryErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <ErrorPage 
          error={error} 
          onRetry={retry}
          details={errorInfo}
        />
      )}
    >
      <Router>
        <Routes>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </TryErrorBoundary>
  );
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Custom Hook Composition</h4>
              <CodeBlock
                language="typescript"
                title="Creating reusable custom hooks"
              >
                {`// Custom hook for API operations
function useApi<T>(endpoint: string) {
  return useTry(
    async () => {
      const result = await tryAsync(() => 
        fetch(endpoint).then(r => {
          if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
          return r.json();
        })
      );
      
      if (isTryError(result)) throw result;
      return result;
    },
    [endpoint],
    { retryCount: 2, retryDelay: 1000 }
  );
}

// Usage
function UsersList() {
  const { data: users, error, loading } = useApi<User[]>('/api/users');
  
  // Component logic...
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Form Validation Pattern</h4>
              <CodeBlock
                language="typescript"
                title="Form handling with try-error"
              >
                {`function useFormValidation<T>(validationSchema: (data: T) => TryResult<T>) {
  const [data, setData] = useState<T>({} as T);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { execute: validate, loading } = useTryCallback(
    async (formData: T) => {
      const result = validationSchema(formData);
      
      if (isTryError(result)) {
        setErrors({ general: result.message });
        throw result;
      }
      
      setErrors({});
      return result;
    },
    {
      onError: (error) => {
        if (error.context && typeof error.context === 'object') {
          setErrors(error.context as Record<string, string>);
        }
      }
    }
  );

  return { data, setData, errors, validate, loading };
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
