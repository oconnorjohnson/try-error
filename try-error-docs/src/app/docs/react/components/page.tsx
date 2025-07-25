import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function ReactComponentsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          React Components
        </h1>
        <p className="text-xl text-slate-600">
          Pre-built components for common error handling patterns in React
          applications
        </p>
      </div>

      <div className="space-y-8">
        {/* TryErrorBoundary Component */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TryErrorBoundary
          </h2>

          <p className="text-slate-600 mb-4">
            A React Error Boundary specifically designed to work with tryError,
            providing enhanced error information and recovery options.
          </p>

          <CodeBlock
            language="typescript"
            title="TryErrorBoundary Props Interface"
            className="mb-4"
          >
            {`interface TryErrorBoundaryProps {
  fallback: React.ComponentType<{
    error: TryError;
    resetError: () => void;
    retry: () => void;
  }>;
  onError?: (error: TryError, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="TryErrorBoundary Usage"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { TryErrorBoundary } from '@try-error/react';

function ErrorFallback({ error, resetError, retry }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      
      {error.context && (
        <details className="mb-4">
          <summary className="cursor-pointer text-red-700">
            Error Details
          </summary>
          <pre className="mt-2 text-sm bg-red-100 p-2 rounded">
            {JSON.stringify(error.context, null, 2)}
          </pre>
        </details>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <TryErrorBoundary
      fallback={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error);
        // Send to error reporting service
      }}
    >
      <UserDashboard />
    </TryErrorBoundary>
  );
}`}
          </CodeBlock>
        </section>

        {/* AsyncComponent */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            AsyncComponent
          </h2>

          <p className="text-slate-600 mb-4">
            A component that handles async operations with built-in loading,
            error, and success states.
          </p>

          <CodeBlock
            language="typescript"
            title="AsyncComponent Props Interface"
            className="mb-4"
          >
            {`interface AsyncComponentProps<T> {
  asyncFn: () => Promise<T>;
  deps?: React.DependencyList;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: TryError; retry: () => void }>;
  children: (data: T) => React.ReactNode;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="AsyncComponent Usage"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { AsyncComponent } from '@try-error/react';

function UserProfile({ userId }: { userId: string }) {
  return (
    <AsyncComponent
      asyncFn={() => fetchUser(userId)}
      deps={[userId]}
      loadingComponent={() => (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}
      errorComponent={({ error, retry }) => (
        <div className="text-red-600">
          <p>Failed to load user: {error.message}</p>
          <button onClick={retry} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
            Retry
          </button>
        </div>
      )}
    >
      {(user) => (
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
        </div>
      )}
    </AsyncComponent>
  );
}`}
          </CodeBlock>
        </section>

        {/* TryForm Component */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TryForm
          </h2>

          <p className="text-slate-600 mb-4">
            A form component that handles submission with tryError, providing
            automatic loading states and error handling.
          </p>

          <CodeBlock
            language="typescript"
            title="TryForm Props Interface"
            className="mb-4"
          >
            {`interface TryFormProps<T> {
  onSubmit: (data: FormData) => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: TryError) => void;
  children: (state: {
    loading: boolean;
    error: TryError | null;
    submit: (e: React.FormEvent) => void;
  }) => React.ReactNode;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="TryForm Usage"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { TryForm } from '@try-error/react';

function CreateUserForm() {
  return (
    <TryForm
      onSubmit={async (formData) => {
        const response = await fetch('/api/users', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
      }}
      onSuccess={(user) => {
        alert(\`User \${user.name} created successfully!\`);
      }}
    >
      {({ loading, error, submit }) => (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error.message}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}
    </TryForm>
  );
}`}
          </CodeBlock>
        </section>

        {/* RetryButton Component */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            RetryButton
          </h2>

          <p className="text-slate-600 mb-4">
            A button component that handles retry logic with exponential backoff
            and loading states.
          </p>

          <CodeBlock
            language="typescript"
            title="RetryButton Props Interface"
            className="mb-4"
          >
            {`interface RetryButtonProps {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  backoffMs?: number;
  children?: React.ReactNode;
  className?: string;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="RetryButton Usage"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { RetryButton } from '@try-error/react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    const result = await tryAsync(() => fetch('/api/data'));
    if (isTryError(result)) {
      setError(result);
      throw result; // RetryButton will catch this
    }
    setData(result);
    setError(null);
  };

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">Failed to load data: {error.message}</p>
        <RetryButton
          onRetry={fetchData}
          maxRetries={3}
          backoffMs={1000}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry Loading Data
        </RetryButton>
      </div>
    );
  }

  return data ? <DataDisplay data={data} /> : <LoadingSpinner />;
}`}
          </CodeBlock>
        </section>

        {/* ErrorDisplay Component */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            ErrorDisplay
          </h2>

          <p className="text-slate-600 mb-4">
            A component for displaying TryError objects with rich formatting and
            debugging information.
          </p>

          <CodeBlock
            language="typescript"
            title="ErrorDisplay Props Interface"
            className="mb-4"
          >
            {`interface ErrorDisplayProps {
  error: TryError;
  showStack?: boolean;
  showContext?: boolean;
  showTimestamp?: boolean;
  onDismiss?: () => void;
  className?: string;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="ErrorDisplay Usage"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { ErrorDisplay } from '@try-error/react';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, error } = useTryAsync(
    () => fetchUser(userId),
    [userId]
  );

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        showContext={process.env.NODE_ENV === 'development'}
        showStack={process.env.NODE_ENV === 'development'}
        showTimestamp
        onDismiss={() => window.location.reload()}
        className="max-w-md mx-auto"
      />
    );
  }

  return user ? <UserDetails user={user} /> : <LoadingSpinner />;
}`}
          </CodeBlock>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Best Practices
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Do</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Use TryErrorBoundary at the top level of your app</li>
                <li>• Provide meaningful fallback UIs for error states</li>
                <li>• Include retry mechanisms where appropriate</li>
                <li>
                  • Show different error details in development vs production
                </li>
                <li>• Use loading states to improve user experience</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Ignore error states in your components</li>
                <li>• Show technical error details to end users</li>
                <li>
                  • Forget to provide retry mechanisms for transient errors
                </li>
                <li>• Use generic error messages without context</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">React Hooks</h3>
              <p className="text-slate-600 text-sm mb-3">
                Powerful hooks for async operations and error handling
              </p>
              <a
                href="/docs/react/hooks"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Hooks →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                React Examples
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Real-world usage examples and patterns
              </p>
              <a
                href="/docs/examples/react"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                See Examples →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
