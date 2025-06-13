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

export default function TroubleshootingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">TypeScript Troubleshooting</h1>
        <p className="text-xl text-muted-foreground">
          Common TypeScript issues and their solutions when using try-error.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Most TypeScript issues with try-error stem from union type inference
          challenges. This guide provides practical solutions to common
          problems.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              Union Type Inference Issues
            </CardTitle>
            <CardDescription>
              Property 'message' does not exist on type 'never' errors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Common Problem
              </h4>
              <CodeBlock
                language="typescript"
                title="Problem: Direct property access"
              >
                {`const result = await tryAsync(() => fetchData());
if (!isOk(result)) {
  // ❌ TypeScript Error: Property 'message' does not exist on type 'never'
  console.log(result.message);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Solution 1: Use Type Guards
              </h4>
              <CodeBlock
                language="typescript"
                title="Solution: Proper type guards"
              >
                {`const result = await tryAsync(() => fetchData());
if (isTryError(result)) {
  // ✅ Type-safe access to error properties
  console.log(result.message);
  console.log(result.type);
  console.log(result.source);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Solution 2: Destructured Pattern
              </h4>
              <CodeBlock
                language="typescript"
                title="Solution: Destructure with fallback"
              >
                {`const result = await tryAsync(() => fetchData());
if (!isOk(result)) {
  const errorMsg = isTryError(result) ? result.message : String(result);
  const errorType = isTryError(result) ? result.type : 'UnknownError';
  console.log(\`Error (\${errorType}): \${errorMsg}\`);
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              Generic Type Parameter Issues
            </CardTitle>
            <CardDescription>
              When TypeScript can't infer the correct error type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Problem: Ambiguous return types
              </h4>
              <CodeBlock
                language="typescript"
                title="Problem: Generic inference failure"
              >
                {`// TypeScript can't determine if this is T or TryError
function processData<T>(data: T): TryResult<ProcessedData, ValidationError> {
  const result = trySync(() => validate(data));
  // ❌ Type issues here
  return result;
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Solution: Explicit Type Annotations
              </h4>
              <CodeBlock
                language="typescript"
                title="Solution: Explicit error types"
              >
                {`interface ValidationError extends TryError<'ValidationError'> {
  field: string;
  rule: string;
}

function processData<T>(data: T): TryResult<ProcessedData, ValidationError> {
  const result = trySync<ProcessedData, ValidationError>(() => {
    const validation = validate(data);
    if (!validation.valid) {
      throw createError({
        type: 'ValidationError' as const,
        message: validation.message,
        context: { field: validation.field, rule: validation.rule }
      });
    }
    return process(validation.data);
  });
  
  return result;
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              Error Context Access Issues
            </CardTitle>
            <CardDescription>
              Property does not exist on type 'unknown' when accessing error
              context
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Common Problem
              </h4>
              <CodeBlock
                language="typescript"
                title="Problem: Direct context property access"
              >
                {`const result = await tryAsync(() => validateForm(data));
if (isTryError(result)) {
  // ❌ TypeScript Error: Property 'field' does not exist on type 'unknown'
  console.log(result.context.field);
  console.log(result.context.rule);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Solution 1: Type Guards
              </h4>
              <CodeBlock
                language="typescript"
                title="Solution: Create type guards for context"
              >
                {`interface ValidationContext {
  field: string;
  rule: string;
  value: unknown;
}

function isValidationContext(context: unknown): context is ValidationContext {
  return typeof context === 'object' && 
         context !== null && 
         'field' in context &&
         'rule' in context;
}

const result = await tryAsync(() => validateForm(data));
if (isTryError(result) && isValidationContext(result.context)) {
  // ✅ Type-safe access to context properties
  console.log(\`Field: \${result.context.field}\`);
  console.log(\`Rule: \${result.context.rule}\`);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Solution 2: Safe Type Assertion
              </h4>
              <CodeBlock
                language="typescript"
                title="Solution: Type assertion with validation"
              >
                {`const result = await tryAsync(() => validateForm(data));
if (isTryError(result)) {
  // ✅ Safe assertion with optional properties
  const context = result.context as { field?: string; rule?: string } | undefined;
  
  if (context?.field && context?.rule) {
    console.log(\`Validation failed: \${context.field} (\${context.rule})\`);
  } else {
    console.log(\`Validation failed: \${result.message}\`);
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Solution 3: Context Helper Utility
              </h4>
              <CodeBlock
                language="typescript"
                title="Solution: Reusable context extraction"
              >
                {`function getContextValue<T>(
  error: TryError, 
  key: string, 
  defaultValue: T
): T {
  if (typeof error.context === 'object' && 
      error.context !== null && 
      key in error.context) {
    return (error.context as any)[key] ?? defaultValue;
  }
  return defaultValue;
}

const result = await tryAsync(() => validateForm(data));
if (isTryError(result)) {
  const field = getContextValue(result, 'field', 'unknown');
  const rule = getContextValue(result, 'rule', 'general');
  
  console.log(\`Validation failed for \${field} (rule: \${rule})\`);
}`}
              </CodeBlock>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Why this happens:</strong> Error context is typed as{" "}
                <code>unknown</code> by design to enforce type safety. Since
                errors can originate from anywhere with different context
                structures, TypeScript requires you to validate the shape before
                accessing properties.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Common</Badge>
              React Component Type Issues
            </CardTitle>
            <CardDescription>
              TypeScript issues when using try-error in React components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Problem: State type inference
              </h4>
              <CodeBlock
                language="typescript"
                title="Problem: useState with TryResult"
              >
                {`function UserProfile({ userId }: { userId: string }) {
  // ❌ TypeScript can't infer the correct type
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const result = await tryAsync(() => api.getUser(userId));
      setUserData(result); // ❌ Type error
    };
    fetchUser();
  }, [userId]);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Solution: Explicit state typing
              </h4>
              <CodeBlock
                language="typescript"
                title="Solution: Proper state types"
              >
                {`interface User {
  id: string;
  name: string;
  email: string;
}

type UserState = {
  data: User | null;
  error: TryError | null;
  loading: boolean;
};

function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = useState<UserState>({
    data: null,
    error: null,
    loading: true
  });
  
  useEffect(() => {
    const fetchUser = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await tryAsync<User>(() => api.getUser(userId));
      
      if (isOk(result)) {
        setState({ data: result, error: null, loading: false });
      } else {
        setState({ data: null, error: result, loading: false });
      }
    };
    fetchUser();
  }, [userId]);
  
  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorDisplay error={state.error} />;
  if (!state.data) return <NotFound />;
  
  return <UserData user={state.data} />;
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TypeScript Configuration</CardTitle>
            <CardDescription>
              Recommended TypeScript settings for optimal try-error experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="json" title="tsconfig.json recommendations">
              {`{
  "compilerOptions": {
    "strict": true,                    // Enable all strict checks
    "strictNullChecks": true,          // Critical for proper type inference
    "noImplicitReturns": true,         // Catch missing return statements
    "noImplicitAny": false,            // Allow some flexibility
    "exactOptionalPropertyTypes": true // Better optional property handling
  }
}`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Reference: Type Guards</CardTitle>
            <CardDescription>
              Essential type guards for working with try-error results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="typescript" title="Essential type guards">
              {`// ✅ Check if operation succeeded
if (isOk(result)) {
  // result is T (success value)
  console.log(result); // Type-safe access
}

// ✅ Check if operation failed
if (isErr(result)) {
  // result is TryError
  console.log(result.message);
}

// ✅ Check if it's a TryError specifically
if (isTryError(result)) {
  // result is TryError with all properties
  console.log(result.type, result.message, result.source);
}

// ✅ Type-safe unwrapping with fallback
const value = unwrapOr(result, 'default value');

// ✅ Pattern matching style
const message = isOk(result) 
  ? \`Success: \${result}\`
  : \`Error: \${result.message}\`;`}
            </CodeBlock>
          </CardContent>
        </Card>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            ✅ Fixed: TypeScript Union Type Issues
          </h3>
          <p className="text-green-700 mb-3">
            We've added improved type guards and utilities to solve the most
            common TypeScript inference problems:
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">
                1. Use isTryFailure() for Error Narrowing
              </h4>
              <CodeBlock language="typescript" className="mb-2">
                {`// ✅ RECOMMENDED: Use isTryFailure for perfect error narrowing
const result = await tryAsync(() => fetchData());

if (isTryFailure(result)) {
  // TypeScript knows this is TryError - perfect inference!
  console.log(result.message);
  console.log(result.type);
  console.log(result.source);
}

// ✅ Or use isTrySuccess for success narrowing
if (isTrySuccess(result)) {
  // TypeScript knows this is your success type
  console.log(result.data);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-800 mb-2">
                2. Use matchTryResult() for Perfect Type Safety
              </h4>
              <CodeBlock language="typescript" className="mb-2">
                {`// ✅ BEST: Use matchTryResult for 100% type-safe handling
const message = matchTryResult(result, {
  success: (data) => \`Success: \${data.name}\`,  // data is properly typed
  error: (error) => \`Error: \${error.message}\`   // error is TryError
});

// No type inference issues, no manual checking needed!`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-800 mb-2">
                3. Use unwrapTryResult() for Structured Access
              </h4>
              <CodeBlock language="typescript" className="mb-2">
                {`// ✅ GOOD: Use unwrapTryResult for clear success/error structure
const unwrapped = unwrapTryResult(result);

if (unwrapped.success) {
  console.log('Data:', unwrapped.data.name);
} else {
  console.log('Error:', unwrapped.error.message);
}

// Perfect TypeScript inference with clear intent`}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
