import {
  InstallCommand,
  CodeBlock,
} from "../../../../components/EnhancedCodeBlock";

export default function ReactInstallationPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          React Integration
        </h1>
        <p className="text-xl text-slate-600">
          Install and set up tryError with React for enhanced error handling in
          your components
        </p>
      </div>

      <div className="space-y-8">
        {/* Package Installation */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Package Installation
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Core Library
              </h3>
              <InstallCommand packageName="tryError" className="mb-4" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                React Integration (Optional)
              </h3>
              <InstallCommand packageName="@tryError/react" className="mb-4" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Note:</strong> The React integration package provides
              hooks and utilities specifically designed for React applications.
            </p>
          </div>
        </section>

        {/* Setup */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Basic Setup
          </h2>

          <p className="text-slate-600 mb-4">
            The React integration works seamlessly with the core tryError
            library:
          </p>

          <CodeBlock
            language="tsx"
            title="UserProfile.tsx"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { useTryAsync, useTrySync } from '@tryError/react';
import { tryAsync, isTryError } from 'tryError';

function UserProfile({ userId }: { userId: string }) {
  // Using the React hook
  const { data: user, error, loading } = useTryAsync(
    () => fetchUser(userId),
    [userId]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`}
          </CodeBlock>
        </section>

        {/* TypeScript Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TypeScript Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            For the best TypeScript experience with React, ensure your{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">
              tsconfig.json
            </code>{" "}
            includes:
          </p>

          <CodeBlock language="json" title="tsconfig.json" className="mb-4">
            {`{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  },
  "include": [
    "src/**/*"
  ]
}`}
          </CodeBlock>
        </section>

        {/* Error Boundary Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Boundary Integration
          </h2>

          <p className="text-slate-600 mb-4">
            tryError works well with React Error Boundaries for comprehensive
            error handling:
          </p>

          <CodeBlock
            language="tsx"
            title="App.tsx"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { ErrorBoundary } from 'react-error-boundary';
import { TryErrorBoundary } from '@tryError/react';

function App() {
  return (
    <TryErrorBoundary
      fallback={({ error, resetError }) => (
        <div>
          <h2>Something went wrong:</h2>
          <pre>{error.message}</pre>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
    >
      <UserProfile userId="123" />
    </TryErrorBoundary>
  );
}`}
          </CodeBlock>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">React Hooks</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about useTryAsync, useTrySync, and other hooks
              </p>
              <a
                href="/docs/react/hooks"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Explore Hooks →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Components</h3>
              <p className="text-slate-600 text-sm mb-3">
                Pre-built components for common error handling patterns
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
                Real-world React patterns and examples
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
