import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function ReactHooksPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">React Hooks</h1>
        <p className="text-xl text-slate-600">
          Powerful hooks for integrating try-error with React components
        </p>
      </div>

      <div className="space-y-8">
        {/* useTryAsync Hook */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            useTryAsync
          </h2>

          <CodeBlock
            language="typescript"
            title="useTryAsync Hook Signature"
            className="mb-4"
          >
            {`function useTryAsync<T>(
  asyncFn: () => Promise<T>,
  deps?: React.DependencyList
): {
  data: T | null;
  error: TryError | null;
  loading: boolean;
  refetch: () => void;
}`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Hook for handling asynchronous operations with automatic loading
            states and error handling.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="useTryAsync Example"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { useTryAsync } from '@try-error/react';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, error, loading, refetch } = useTryAsync(
    async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    [userId]
  );

  if (loading) {
    return <div className="animate-pulse">Loading user...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Error: {error.message}</p>
        <button onClick={refetch} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <div>No user found</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Parameters
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <ul className="space-y-2">
              <li>
                <code className="bg-slate-200 px-2 py-1 rounded">asyncFn</code>{" "}
                - The async function to execute
              </li>
              <li>
                <code className="bg-slate-200 px-2 py-1 rounded">deps</code> -
                Dependency array (optional)
              </li>
            </ul>
          </div>
        </section>

        {/* useTrySync Hook */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            useTrySync
          </h2>

          <CodeBlock
            language="typescript"
            title="useTrySync Hook Signature"
            className="mb-4"
          >
            {`function useTrySync<T>(
  syncFn: () => T,
  deps?: React.DependencyList
): {
  data: T | null;
  error: TryError | null;
  execute: () => void;
}`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Hook for handling synchronous operations that might throw errors.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="useTrySync Example"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { useTrySync } from '@try-error/react';

function ConfigDisplay({ configString }: { configString: string }) {
  const { data: config, error, execute } = useTrySync(
    () => JSON.parse(configString),
    [configString]
  );

  if (error) {
    return (
      <div className="text-red-600">
        <p>Invalid JSON: {error.message}</p>
        <button onClick={execute}>Try Again</button>
      </div>
    );
  }

  return (
    <pre className="bg-gray-100 p-4 rounded">
      {JSON.stringify(config, null, 2)}
    </pre>
  );
}`}
          </CodeBlock>
        </section>

        {/* useTryMutation Hook */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            useTryMutation
          </h2>

          <CodeBlock
            language="typescript"
            title="useTryMutation Hook Signature"
            className="mb-4"
          >
            {`function useTryMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<T>
): {
  mutate: (variables: TVariables) => Promise<void>;
  data: T | null;
  error: TryError | null;
  loading: boolean;
  reset: () => void;
}`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Hook for handling mutations (create, update, delete operations) with
            loading and error states.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="useTryMutation Example"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { useTryMutation } from '@try-error/react';

function CreateUserForm() {
  const { mutate: createUser, loading, error, data } = useTryMutation(
    async (userData: { name: string; email: string }) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createUser({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  if (data) {
    return <div className="text-green-600">User created successfully!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </form>
  );
}`}
          </CodeBlock>
        </section>

        {/* useTryCallback Hook */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            useTryCallback
          </h2>

          <CodeBlock
            language="typescript"
            title="useTryCallback Hook Signature"
            className="mb-4"
          >
            {`function useTryCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T & {
  error: TryError | null;
  clearError: () => void;
}`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Hook that wraps a callback function with error handling, similar to
            useCallback but with try-error integration.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Example</h3>

          <CodeBlock
            language="tsx"
            title="useTryCallback Example"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { useTryCallback } from '@try-error/react';

function FileUploader() {
  const handleFileUpload = useTryCallback(
    async (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large (max 10MB)');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    []
  );

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      {handleFileUpload.error && (
        <div className="text-red-600">
          <p>Upload error: {handleFileUpload.error.message}</p>
          <button onClick={handleFileUpload.clearError}>Clear Error</button>
        </div>
      )}
    </div>
  );
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
                <li>• Use dependency arrays to control when effects re-run</li>
                <li>• Handle loading states for better user experience</li>
                <li>• Provide retry mechanisms for failed operations</li>
                <li>• Use useTryMutation for state-changing operations</li>
                <li>• Clear errors when appropriate</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Forget to handle error states in your UI</li>
                <li>
                  • Use useTryAsync for mutations (use useTryMutation instead)
                </li>
                <li>• Ignore loading states</li>
                <li>
                  • Create new functions on every render without memoization
                </li>
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
              <h3 className="font-semibold text-slate-900 mb-2">
                React Components
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Pre-built components for common patterns
              </p>
              <a
                href="/docs/react/components"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Components →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                React Examples
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Real-world usage examples
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
