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
      </div>
    </div>
  );
}
