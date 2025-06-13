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

export default function CommonPitfallsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Common Pitfalls</h1>
        <p className="text-xl text-muted-foreground">
          Learn from common mistakes and avoid gotchas when using try-error.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          These are the most frequent issues developers encounter when adopting
          try-error. Understanding these patterns will save you debugging time
          and improve code quality.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              Accessing Error Properties Directly
            </CardTitle>
            <CardDescription>
              Most common TypeScript error when working with try-error
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Wrong Approach
              </h4>
              <CodeBlock language="typescript" title="Direct property access">
                {`const result = await tryAsync(() => fetchUserData());

if (!isOk(result)) {
  // ❌ TypeScript Error: Property 'message' does not exist on type 'never'
  console.log(result.message);
  console.log(result.type);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Correct Approach
              </h4>
              <CodeBlock language="typescript" title="Use proper type guards">
                {`const result = await tryAsync(() => fetchUserData());

if (isTryError(result)) {
  // ✅ Type-safe access to error properties
  console.log(result.message);
  console.log(result.type);
  console.log(result.source);
}

// Alternative pattern
if (isErr(result)) {
  // result is guaranteed to be TryError
  handleError(result);
}`}
              </CodeBlock>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Why this happens:</strong> TypeScript sees{" "}
                <code>TryResult&lt;T, E&gt;</code> as a union type. When you
                check <code>!isOk(result)</code>, TypeScript can't narrow the
                type to just the error case. Use <code>isTryError(result)</code>{" "}
                or <code>isErr(result)</code> for proper type narrowing.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              Wrapping Every Function Call
            </CardTitle>
            <CardDescription>
              Over-engineering with try-error leads to performance issues and
              code bloat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Over-wrapping Functions
              </h4>
              <CodeBlock language="typescript" title="Unnecessary wrapping">
                {`// ❌ Don't wrap every operation
function processUser(user: User) {
  const nameResult = trySync(() => user.name.toUpperCase());
  const emailResult = trySync(() => user.email.toLowerCase());
  const ageResult = trySync(() => user.age + 1);
  
  // This adds unnecessary overhead for simple operations
  if (isOk(nameResult) && isOk(emailResult) && isOk(ageResult)) {
    return { name: nameResult, email: emailResult, age: ageResult };
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Strategic Use of try-error
              </h4>
              <CodeBlock
                language="typescript"
                title="Wrap risky operations only"
              >
                {`// ✅ Only wrap operations that can actually fail
function processUser(user: User) {
  // Simple operations that won't throw - no wrapping needed
  const name = user.name.toUpperCase();
  const email = user.email.toLowerCase();
  const age = user.age + 1;
  
  // Wrap the risky validation step
  const validationResult = trySync(() => validateUserData({ name, email, age }));
  
  if (isTryError(validationResult)) {
    return validationResult; // Return error
  }
  
  return { name, email, age }; // Return success
}

// ✅ Or wrap the entire operation
function processUserSafely(user: User) {
  return trySync(() => {
    const validation = validateUserData(user);
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    
    return {
      name: user.name.toUpperCase(),
      email: user.email.toLowerCase(),
      age: user.age + 1
    };
  });
}`}
              </CodeBlock>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Performance tip:</strong> try-error has zero overhead
                for the success path, but each wrapper function call still has
                JavaScript function call overhead. Use it strategically for
                operations that can actually fail.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Common</Badge>
              Mixing Error Handling Paradigms
            </CardTitle>
            <CardDescription>
              Inconsistent error handling creates confusion and bugs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Inconsistent Error Handling
              </h4>
              <CodeBlock language="typescript" title="Mixed paradigms">
                {`// ❌ Mixing try/catch with try-error
async function fetchAndProcess(id: string) {
  try {
    const userData = await tryAsync(() => fetchUser(id));
    
    if (isTryError(userData)) {
      throw new Error(userData.message); // Converting back to exception
    }
    
    // Now mixing with regular try/catch
    const processed = await processUserData(userData);
    return processed;
  } catch (error) {
    // This catches both thrown errors and any unhandled exceptions
    console.error(error);
    return null;
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Consistent Error-as-Values
              </h4>
              <CodeBlock language="typescript" title="Pure try-error approach">
                {`// ✅ Pure try-error approach
async function fetchAndProcess(id: string): Promise<TryResult<ProcessedUser>> {
  const userData = await tryAsync(() => fetchUser(id));
  
  if (isTryError(userData)) {
    return userData; // Propagate error
  }
  
  const processedData = await tryAsync(() => processUserData(userData));
  
  if (isTryError(processedData)) {
    return processedData; // Propagate error
  }
  
  return processedData; // Return success
}

// ✅ Or use chaining for cleaner code
async function fetchAndProcessChained(id: string): Promise<TryResult<ProcessedUser>> {
  return tryChainAsync(
    await tryAsync(() => fetchUser(id)),
    (userData) => tryAsync(() => processUserData(userData))
  );
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Common</Badge>
              Ignoring Loading States in React
            </CardTitle>
            <CardDescription>
              Poor user experience from missing loading indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ No Loading States
              </h4>
              <CodeBlock
                language="typescript"
                title="Missing loading indicators"
              >
                {`function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await tryAsync(() => api.getUser(userId));
      
      if (isTryError(result)) {
        setError(result.message);
      } else {
        setUser(result);
      }
    };
    
    fetchUser();
  }, [userId]);

  // ❌ No loading state - user sees blank screen during fetch
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>; // This shows before loading
  
  return <UserDisplay user={user} />;
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Proper Loading States
              </h4>
              <CodeBlock
                language="typescript"
                title="Complete state management"
              >
                {`function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = useState<{
    user: User | null;
    loading: boolean;
    error: TryError | null;
  }>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchUser = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await tryAsync(() => api.getUser(userId));
      
      if (isTryError(result)) {
        setState({ user: null, loading: false, error: result });
      } else {
        setState({ user: result, loading: false, error: null });
      }
    };
    
    fetchUser();
  }, [userId]);

  // ✅ Clear loading states and error handling
  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorDisplay error={state.error} />;
  if (!state.user) return <NotFound />;
  
  return <UserDisplay user={state.user} />;
}

// ✅ Even better: use the useTry hook
function UserProfileWithHook({ userId }: { userId: string }) {
  const { data: user, error, loading } = useTry(
    () => api.getUser(userId),
    [userId]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!user) return <NotFound />;
  
  return <UserDisplay user={user} />;
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Common</Badge>
              Not Handling Partial Failures
            </CardTitle>
            <CardDescription>
              All-or-nothing error handling misses nuanced failure scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ All-or-Nothing Approach
              </h4>
              <CodeBlock language="typescript" title="Binary failure handling">
                {`// ❌ Fails completely if any part fails
async function loadDashboardData() {
  const userResult = await tryAsync(() => fetchUser());
  const postsResult = await tryAsync(() => fetchUserPosts());
  const settingsResult = await tryAsync(() => fetchUserSettings());
  
  // If any fails, the whole operation fails
  if (isTryError(userResult) || isTryError(postsResult) || isTryError(settingsResult)) {
    return createError({ type: 'DashboardError', message: 'Failed to load dashboard' });
  }
  
  return { user: userResult, posts: postsResult, settings: settingsResult };
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Graceful Partial Failures
              </h4>
              <CodeBlock
                language="typescript"
                title="Handle partial failures gracefully"
              >
                {`// ✅ Handle partial failures gracefully
async function loadDashboardData() {
  const [userResult, postsResult, settingsResult] = await Promise.all([
    tryAsync(() => fetchUser()),
    tryAsync(() => fetchUserPosts()),
    tryAsync(() => fetchUserSettings())
  ]);
  
  // User data is critical - fail if missing
  if (isTryError(userResult)) {
    return userResult;
  }
  
  // Posts and settings are optional - provide defaults
  const posts = isTryError(postsResult) ? [] : postsResult;
  const settings = isTryError(settingsResult) ? getDefaultSettings() : settingsResult;
  
  return {
    user: userResult,
    posts,
    settings,
    errors: {
      posts: isTryError(postsResult) ? postsResult : null,
      settings: isTryError(settingsResult) ? settingsResult : null
    }
  };
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Common</Badge>
              Forgetting Error Context
            </CardTitle>
            <CardDescription>
              Generic error messages make debugging difficult
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">
                ❌ Generic Error Messages
              </h4>
              <CodeBlock language="typescript" title="Unhelpful error context">
                {`// ❌ Generic, unhelpful errors
async function updateUserProfile(userId: string, data: UserUpdate) {
  const result = await tryAsync(() => 
    fetch(\`/api/users/\${userId}\`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  );
  
  if (isTryError(result)) {
    // Generic error - hard to debug
    return createError({ type: 'UpdateError', message: 'Update failed' });
  }
  
  return result.json();
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                ✅ Rich Error Context
              </h4>
              <CodeBlock
                language="typescript"
                title="Detailed error information"
              >
                {`// ✅ Rich error context for better debugging
async function updateUserProfile(userId: string, data: UserUpdate) {
  const result = await tryAsync(() => 
    fetch(\`/api/users/\${userId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  );
  
  if (isTryError(result)) {
    return createError({
      type: 'NetworkError',
      message: \`Failed to update user profile: \${result.message}\`,
      context: {
        userId,
        operation: 'updateProfile',
        endpoint: \`/api/users/\${userId}\`,
        requestData: data,
        originalError: result
      }
    });
  }
  
  if (!result.ok) {
    const errorData = await result.text();
    return createError({
      type: 'ApiError',
      message: \`Server error: \${result.status} \${result.statusText}\`,
      context: {
        userId,
        status: result.status,
        statusText: result.statusText,
        responseBody: errorData,
        endpoint: \`/api/users/\${userId}\`
      }
    });
  }
  
  return result.json();
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Checklist</CardTitle>
            <CardDescription>
              Avoid these common mistakes for better try-error usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">
                  ✅ Best Practices
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • Use <code>isTryError()</code> or <code>isErr()</code> for
                    type narrowing
                  </li>
                  <li>• Only wrap operations that can actually fail</li>
                  <li>
                    • Maintain consistent error handling throughout your app
                  </li>
                  <li>• Always show loading states in UI components</li>
                  <li>• Handle partial failures gracefully when possible</li>
                  <li>• Include rich context in error objects</li>
                  <li>• Use error boundaries for unexpected errors</li>
                  <li>• Provide retry mechanisms for transient failures</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-3">
                  ❌ Common Mistakes
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Accessing error properties without type guards</li>
                  <li>• Wrapping every single function call</li>
                  <li>• Mixing try/catch with try-error paradigms</li>
                  <li>• Forgetting to handle loading states</li>
                  <li>• Using all-or-nothing error handling</li>
                  <li>• Creating generic, unhelpful error messages</li>
                  <li>• Not testing error paths in your code</li>
                  <li>• Ignoring TypeScript strict mode warnings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
