import { PlaygroundAdvanced } from "@/components/PlaygroundAdvanced";
import { SandboxPlayground } from "@/components/SandboxPlayground";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const basicExample = `import { trySync } from 'tryError';

// Basic synchronous example
const divide = (a: number, b: number) => {
  const result = trySync(() => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  });
  
  if (result.error) {
    console.error('Error:', result.error.message);
    return 0; // default value
  }
  
  console.log('Result:', result.data);
  return result.data;
};

// Test the function
console.log('10 / 2 =', divide(10, 2));
console.log('10 / 0 =', divide(10, 0));`;

const asyncExample = `import { tryAsync } from 'tryError';

// Simulated API call
const fetchUserData = async (userId: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (userId === 'invalid') {
    throw new Error('User not found');
  }
  
  return { id: userId, name: 'John Doe', email: 'john@example.com' };
};

// Using tryAsync
const getUser = async (userId: string) => {
  console.log(\`Fetching user \${userId}...\`);
  
  const result = await tryAsync(() => fetchUserData(userId));
  
  if (result.error) {
    console.error('Failed to fetch user:', result.error.message);
    return null;
  }
  
  console.log('User data:', result.data);
  return result.data;
};

// Test with valid and invalid user IDs
(async () => {
  await getUser('123');
  await getUser('invalid');
})();`;

const errorHandlingExample = `import { trySync, createError, isTryError } from 'tryError';

// Custom error types
const ValidationError = createError('ValidationError');
const NetworkError = createError('NetworkError');

// Function that validates input
const validateEmail = (email: string) => {
  const result = trySync(() => {
    if (!email) {
      throw ValidationError('Email is required');
    }
    
    if (!email.includes('@')) {
      throw ValidationError('Invalid email format');
    }
    
    return email.toLowerCase();
  });
  
  if (result.error) {
    // Check error type
    if (isTryError(result.error) && result.error.code === 'ValidationError') {
      console.error('Validation failed:', result.error.message);
    } else {
      console.error('Unexpected error:', result.error);
    }
    return null;
  }
  
  console.log('Valid email:', result.data);
  return result.data;
};

// Test validation
validateEmail('');
validateEmail('invalid-email');
validateEmail('user@example.com');`;

const reactExample = `// React Hook Example (conceptual - won't run in playground)
import { useTry } from 'tryError/react';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, error, loading } = useTry(
    async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    [userId] // Dependencies
  );
  
  if (loading) {
    console.log('Loading user data...');
    return 'Loading...';
  }
  
  if (error) {
    console.error('Error loading user:', error.message);
    return 'Error: ' + error.message;
  }
  
  console.log('User loaded:', user);
  return \`Welcome, \${user.name}!\`;
}

// Simulated render
console.log('Component would render:', UserProfile({ userId: '123' }));`;

export default function PlaygroundPage() {
  // Check if we're in development or have sandbox credentials
  const hasSandboxAuth =
    process.env.VERCEL_OIDC_TOKEN ||
    (process.env.VERCEL_TEAM_ID &&
      process.env.VERCEL_PROJECT_ID &&
      process.env.VERCEL_TOKEN);

  // For now, always use the mock playground until sandbox is properly configured
  const useSandbox = false; // Set to true when sandbox is configured

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Interactive Playground</h1>
        <p className="text-muted-foreground">
          Experiment with tryError in a live environment. Edit the code and
          click "Run" to see the results.
        </p>
      </div>

      {useSandbox && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> The live playground requires Vercel Sandbox
            authentication. For local development, run{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              vercel env pull
            </code>{" "}
            to authenticate. The mock playground below demonstrates the API but
            doesn't execute real code.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Try it yourself</h2>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="async">Async</TabsTrigger>
            <TabsTrigger value="errors">Error Handling</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Basic Synchronous Operations
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to handle synchronous operations with trySync.
                </p>
              </div>
              <PlaygroundAdvanced
                defaultCode={basicExample}
                height="500px"
                title="Basic Example"
                description="Try modifying the code and running it to see how trySync works"
              />
            </div>
          </TabsContent>

          <TabsContent value="async" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Asynchronous Operations
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Handle promises and async functions with tryAsync.
                </p>
              </div>
              <PlaygroundAdvanced
                defaultCode={asyncExample}
                height="500px"
                title="Async Example"
                description="See how tryAsync handles asynchronous operations and errors"
              />
            </div>
          </TabsContent>

          <TabsContent value="errors" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Custom Error Handling
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create custom error types and handle them appropriately.
                </p>
              </div>
              <PlaygroundAdvanced
                defaultCode={errorHandlingExample}
                height="500px"
                title="Error Handling Example"
                description="Learn how to create and handle custom error types"
              />
            </div>
          </TabsContent>

          <TabsContent value="react" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">React Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See how tryError integrates with React hooks (conceptual
                  example).
                </p>
              </div>
              <PlaygroundAdvanced
                defaultCode={reactExample}
                height="500px"
                title="React Example"
                description="Conceptual example of using tryError with React hooks"
                language="javascript"
              />
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">💡 Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• The playground runs in a sandboxed environment for safety</li>
          <li>• Console output is captured and displayed in the Console tab</li>
          <li>• You can modify the code and run it multiple times</li>
          <li>
            • Use the toolbar buttons to reset, share, or download your code
          </li>
          <li>• Network requests won't work in this environment</li>
          <li>• For real projects, install tryError via npm/pnpm/yarn</li>
        </ul>
      </Card>
    </div>
  );
}
