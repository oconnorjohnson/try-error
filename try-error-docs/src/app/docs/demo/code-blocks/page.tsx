import {
  InstallCommand,
  CodeBlock,
} from "../../../../components/EnhancedCodeBlock";

export default function CodeBlockDemoPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Enhanced Code Blocks Demo
        </h1>
        <p className="text-xl text-slate-600">
          Showcase of syntax highlighting, copy functionality, and package
          manager selection
        </p>
      </div>

      <div className="space-y-8">
        {/* Installation Commands */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Installation Commands
          </h2>
          <p className="text-slate-600 mb-4">
            Interactive package manager selection with copy functionality:
          </p>

          <div className="space-y-4">
            <InstallCommand packageName="@try-error/core" />
            <InstallCommand packageName="@try-error/react" />
            <InstallCommand packageName="typescript" devDependency={true} />
          </div>
        </section>

        {/* TypeScript Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TypeScript Code Blocks
          </h2>

          <CodeBlock
            language="typescript"
            title="Advanced Error Handling"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { tryAsync, isTryError, createTryError } from '@try-error/core';

interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUserWithRetry(userId: string, maxRetries = 3): Promise<User | TryError> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await tryAsync(async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
      
      if (!response.ok) {
        throw createTryError('NetworkError', \`HTTP \${response.status}: \${response.statusText}\`, {
          status: response.status,
          url: response.url,
          attempt
        });
      }
      
      return response.json() as Promise<User>;
    });

    if (!isTryError(result)) {
      return result; // Success!
    }

    if (attempt === maxRetries) {
      return result; // Final attempt failed
    }

    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
  }

  // This should never be reached, but TypeScript requires it
  return createTryError('UnexpectedError', 'Retry loop completed unexpectedly');
}`}
          </CodeBlock>
        </section>

        {/* React Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            React Integration
          </h2>

          <CodeBlock
            language="tsx"
            title="UserDashboard.tsx"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import React from 'react';
import { useTryAsync } from '@try-error/react';
import { isTryError } from '@try-error/core';

interface UserDashboardProps {
  userId: string;
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const { 
    data: user, 
    error, 
    loading, 
    retry 
  } = useTryAsync(
    () => fetchUserWithRetry(userId),
    [userId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading user data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error Loading User</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        {error.context && (
          <pre className="text-xs text-red-500 mt-2 overflow-auto">
            {JSON.stringify(error.context, null, 2)}
          </pre>
        )}
        <button 
          onClick={retry}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return <div>No user found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}`}
          </CodeBlock>
        </section>

        {/* JSON Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Configuration Files
          </h2>

          <CodeBlock language="json" title="package.json" className="mb-4">
            {`{
  "name": "my-tryError-app",
  "version": "1.0.0",
  "description": "Example app using tryError",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest"
  },
  "dependencies": {
    "@try-error/core": "^1.0.0",
    "@try-error/react": "^1.0.0",
    "react": "^18.0.0",
    "next": "^14.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}`}
          </CodeBlock>
        </section>

        {/* Shell Commands */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Shell Commands
          </h2>

          <CodeBlock language="bash" title="Development Setup" className="mb-4">
            {`# Clone the repository
git clone https://github.com/your-org/tryError-example.git
cd tryError-example

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build`}
          </CodeBlock>
        </section>

        {/* CSS Styling */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            CSS Styling
          </h2>

          <CodeBlock
            language="css"
            title="error-styles.css"
            showLineNumbers={true}
            className="mb-4"
          >
            {`.error-container {
  @apply bg-red-50 border border-red-200 rounded-lg p-4;
}

.error-title {
  @apply text-red-800 font-semibold text-lg mb-2;
}

.error-message {
  @apply text-red-600 text-sm mb-3;
}

.error-context {
  @apply bg-red-100 border border-red-200 rounded p-2 text-xs font-mono overflow-auto;
}

.retry-button {
  @apply px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors;
}

.loading-spinner {
  @apply animate-spin rounded-full border-2 border-blue-600 border-t-transparent;
  width: 1.5rem;
  height: 1.5rem;
}`}
          </CodeBlock>
        </section>

        {/* Features Summary */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Features Summary
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3">
                Code Block Features
              </h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>✅ Syntax highlighting with react-syntax-highlighter</li>
                <li>✅ Copy to clipboard functionality</li>
                <li>✅ Line numbers (optional)</li>
                <li>✅ File titles and language indicators</li>
                <li>✅ Dark theme optimized</li>
                <li>✅ Hover effects and animations</li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3">
                Installation Command Features
              </h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>✅ Package manager selection (pnpm/npm/yarn)</li>
                <li>✅ Auto-detection of dev dependencies</li>
                <li>✅ Copy to clipboard functionality</li>
                <li>✅ Terminal-style appearance</li>
                <li>✅ Dropdown with smooth animations</li>
                <li>✅ Click outside to close</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
