import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function ReactTypesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">React Types</h1>
        <p className="text-xl text-slate-600">
          TypeScript types and interfaces for React integration with tryError
        </p>
      </div>

      <div className="space-y-8">
        {/* Hook Return Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Hook Return Types
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            UseTryAsyncResult
          </h3>

          <CodeBlock
            language="typescript"
            title="UseTryAsyncResult Interface"
            className="mb-4"
          >
            {`interface UseTryAsyncResult<T> {
  data: T | null;
  error: TryError | null;
  loading: boolean;
  refetch: () => void;
}`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Return type for the useTryAsync hook, providing data, error state,
            loading indicator, and refetch function.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            UseTrySyncResult
          </h3>

          <CodeBlock
            language="typescript"
            title="UseTrySyncResult Interface"
            className="mb-4"
          >
            {`interface UseTrySyncResult<T> {
  data: T | null;
  error: TryError | null;
  execute: () => void;
}`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Return type for the useTrySync hook, providing data, error state,
            and execute function.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            UseTryMutationResult
          </h3>

          <CodeBlock
            language="typescript"
            title="UseTryMutationResult Interface"
            className="mb-4"
          >
            {`interface UseTryMutationResult<T, TVariables = void> {
  mutate: (variables: TVariables) => Promise<void>;
  data: T | null;
  error: TryError | null;
  loading: boolean;
  reset: () => void;
}`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Return type for the useTryMutation hook, providing mutation
            function, data, error state, loading indicator, and reset function.
          </p>
        </section>

        {/* Component Props Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Component Props Types
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            TryErrorBoundaryProps
          </h3>

          <CodeBlock
            language="typescript"
            title="TryErrorBoundary Props Interfaces"
            className="mb-4"
          >
            {`interface TryErrorBoundaryProps {
  fallback: React.ComponentType<TryErrorFallbackProps>;
  onError?: (error: TryError, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

interface TryErrorFallbackProps {
  error: TryError;
  resetError: () => void;
  retry: () => void;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            AsyncComponentProps
          </h3>

          <CodeBlock
            language="typescript"
            title="AsyncComponent Props Interfaces"
            className="mb-4"
          >
            {`interface AsyncComponentProps<T> {
  asyncFn: () => Promise<T>;
  deps?: React.DependencyList;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<AsyncErrorProps>;
  children: (data: T) => React.ReactNode;
}

interface AsyncErrorProps {
  error: TryError;
  retry: () => void;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            TryFormProps
          </h3>

          <CodeBlock
            language="typescript"
            title="TryForm Props Interfaces"
            className="mb-4"
          >
            {`interface TryFormProps<T> {
  onSubmit: (data: FormData) => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: TryError) => void;
  children: (state: TryFormState) => React.ReactNode;
}

interface TryFormState {
  loading: boolean;
  error: TryError | null;
  submit: (e: React.FormEvent) => void;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            ErrorDisplayProps
          </h3>

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
        </section>

        {/* Utility Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Utility Types
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            ReactTryResult
          </h3>

          <CodeBlock
            language="typescript"
            title="ReactTryResult Utility Type"
            className="mb-4"
          >
            {`type ReactTryResult<T> = {
  data: T | null;
  error: TryError | null;
  loading: boolean;
};`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            A utility type representing the common pattern of data, error, and
            loading state in React components.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            AsyncFunction
          </h3>

          <CodeBlock
            language="typescript"
            title="AsyncFunction Type"
            className="mb-4"
          >
            {`type AsyncFunction<T> = () => Promise<T>;`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            SyncFunction
          </h3>

          <CodeBlock
            language="typescript"
            title="SyncFunction Type"
            className="mb-4"
          >
            {`type SyncFunction<T> = () => T;`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            MutationFunction
          </h3>

          <CodeBlock
            language="typescript"
            title="MutationFunction Type"
            className="mb-4"
          >
            {`type MutationFunction<T, TVariables = void> = (variables: TVariables) => Promise<T>;`}
          </CodeBlock>
        </section>

        {/* Generic Constraints */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Generic Constraints
          </h2>

          <p className="text-slate-600 mb-4">
            Understanding the generic constraints used in tryError React types:
          </p>

          <CodeBlock
            language="typescript"
            title="Generic Constraints Examples"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// T represents the success data type
function useTryAsync<T>(
  asyncFn: () => Promise<T>,
  deps?: React.DependencyList
): UseTryAsyncResult<T>

// T is the return type, TVariables is the input type
function useTryMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<T>
): UseTryMutationResult<T, TVariables>

// T extends function type for callback wrapping
function useTryCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T & { error: TryError | null; clearError: () => void }`}
          </CodeBlock>
        </section>

        {/* Type Guards */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Type Guards for React
          </h2>

          <p className="text-slate-600 mb-4">
            Additional type guards specifically for React patterns:
          </p>

          <CodeBlock
            language="typescript"
            title="React Type Guards"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Check if a React component result has data
function hasData<T>(result: ReactTryResult<T>): result is ReactTryResult<T> & { data: T } {
  return result.data !== null && !result.error;
}

// Check if a React component result has an error
function hasError<T>(result: ReactTryResult<T>): result is ReactTryResult<T> & { error: TryError } {
  return result.error !== null;
}

// Check if a React component result is loading
function isLoading<T>(result: ReactTryResult<T>): boolean {
  return result.loading;
}

// Usage example
function UserProfile({ userId }: { userId: string }) {
  const result = useTryAsync(() => fetchUser(userId), [userId]);
  
  if (isLoading(result)) {
    return <LoadingSpinner />;
  }
  
  if (hasError(result)) {
    // TypeScript knows result.error is TryError
    return <ErrorDisplay error={result.error} />;
  }
  
  if (hasData(result)) {
    // TypeScript knows result.data is User (not null)
    return <UserDetails user={result.data} />;
  }
  
  return null;
}`}
          </CodeBlock>
        </section>

        {/* Advanced Patterns */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Advanced Type Patterns
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Conditional Types for Hooks
          </h3>

          <CodeBlock
            language="typescript"
            title="Conditional Types Example"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Conditional return type based on whether deps are provided
type UseTryAsyncReturn<T, HasDeps extends boolean> = HasDeps extends true
  ? UseTryAsyncResult<T>
  : UseTryAsyncResult<T> & { execute: () => void };

// Hook that changes behavior based on deps
function useTryAsync<T, HasDeps extends boolean = true>(
  asyncFn: () => Promise<T>,
  deps?: HasDeps extends true ? React.DependencyList : never
): UseTryAsyncReturn<T, HasDeps>`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Discriminated Unions for State
          </h3>

          <CodeBlock
            language="typescript"
            title="Discriminated Union State"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// More precise state representation
type AsyncState<T> =
  | { status: 'idle'; data: null; error: null; loading: false }
  | { status: 'loading'; data: null; error: null; loading: true }
  | { status: 'success'; data: T; error: null; loading: false }
  | { status: 'error'; data: null; error: TryError; loading: false };

// Usage in components
function useTypedTryAsync<T>(asyncFn: () => Promise<T>): AsyncState<T> {
  // Implementation would return the discriminated union
}`}
          </CodeBlock>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TypeScript Best Practices
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Do</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Use specific types for your data instead of `any`</li>
                <li>• Leverage type guards for better type narrowing</li>
                <li>• Use generic constraints to ensure type safety</li>
                <li>• Define interfaces for complex prop types</li>
                <li>• Use discriminated unions for complex state</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Use `any` type unless absolutely necessary</li>
                <li>• Ignore TypeScript errors in React components</li>
                <li>• Forget to type your async functions properly</li>
                <li>• Use overly complex generic constraints</li>
                <li>• Skip type annotations for public APIs</li>
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
              <h3 className="font-semibold text-slate-900 mb-2">Core Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about the core tryError types
              </p>
              <a
                href="/docs/concepts/error-types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Core Types →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">React Hooks</h3>
              <p className="text-slate-600 text-sm mb-3">
                See these types in action with hooks
              </p>
              <a
                href="/docs/react/hooks"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Hooks →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
