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

export default function RealWorldExamplesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Real-World Examples</h1>
        <p className="text-xl text-muted-foreground">
          Production-ready patterns and complete application examples using
          try-error.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          These examples demonstrate how to use try-error in real applications,
          including Next.js apps, API routes, and complex error handling
          scenarios.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>Next.js</Badge>
              Complete Server Component Example
            </CardTitle>
            <CardDescription>
              Full implementation of server components with error handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock language="typescript" title="app/users/[id]/page.tsx">
              {`import { tryAsync, isOk, isTryError } from 'try-error';
import { UserProfile } from '@/components/UserProfile';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { NotFound } from '@/components/NotFound';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

// API functions with proper error handling
async function fetchUser(id: string) {
  return tryAsync(async () => {
    const response = await fetch(\`\${process.env.API_URL}/users/\${id}\`, {
      headers: { 'Authorization': \`Bearer \${process.env.API_TOKEN}\` }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw createError({
          type: 'UserNotFoundError',
          message: 'User not found',
          context: { userId: id, status: response.status }
        });
      }
      throw createError({
        type: 'ApiError',
        message: \`Failed to fetch user: \${response.status}\`,
        context: { userId: id, status: response.status }
      });
    }

    return response.json() as User;
  });
}

async function fetchUserPreferences(id: string) {
  return tryAsync(async () => {
    const response = await fetch(\`\${process.env.API_URL}/users/\${id}/preferences\`);
    
    if (!response.ok) {
      // Preferences are optional - don't fail the whole page
      throw createError({
        type: 'PreferencesError',
        message: 'Could not load user preferences',
        context: { userId: id, status: response.status }
      });
    }

    return response.json() as UserPreferences;
  });
}

// Server Component with graceful error handling
export default async function UserPage({ params }: { params: { id: string } }) {
  // Fetch user data and preferences in parallel
  const [userResult, preferencesResult] = await Promise.all([
    fetchUser(params.id),
    fetchUserPreferences(params.id)
  ]);

  // Handle critical error (user not found)
  if (isTryError(userResult)) {
    if (userResult.type === 'UserNotFoundError') {
      return <NotFound message="User not found" />;
    }
    return <ErrorDisplay error={userResult} />;
  }

  // Handle optional error (preferences) gracefully
  const preferences = isOk(preferencesResult) 
    ? preferencesResult 
    : { theme: 'light' as const, notifications: true, language: 'en' };

  const preferencesError = isTryError(preferencesResult) ? preferencesResult : null;

  return (
    <div>
      <UserProfile 
        user={userResult} 
        preferences={preferences}
      />
      {preferencesError && (
        <div className="mt-4">
          <Alert variant="warning">
            <AlertDescription>
              Could not load user preferences: {preferencesError.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>API Routes</Badge>
              Next.js API Error Handling
            </CardTitle>
            <CardDescription>
              Comprehensive API route error handling with validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="typescript" title="app/api/users/route.ts">
              {`import { NextRequest, NextResponse } from 'next/server';
import { tryAsync, trySync, isOk, isTryError } from 'try-error';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().min(18).max(120).optional()
});

// Database operations
async function createUser(data: z.infer<typeof createUserSchema>) {
  return tryAsync(async () => {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw createError({
        type: 'UserAlreadyExistsError',
        message: 'User with this email already exists',
        context: { email: data.email }
      });
    }

    // Create new user
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        age: data.age
      }
    });

    return user;
  });
}

// Validation helper
function validateUserData(body: unknown) {
  return trySync(() => {
    const result = createUserSchema.safeParse(body);
    
    if (!result.success) {
      throw createError({
        type: 'ValidationError',
        message: 'Invalid user data',
        context: {
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            value: err.code
          }))
        }
      });
    }

    return result.data;
  });
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const bodyResult = await tryAsync(() => request.json());
    
    if (isTryError(bodyResult)) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          type: 'ParseError',
          details: bodyResult.message 
        },
        { status: 400 }
      );
    }

    // Validate data
    const validationResult = validateUserData(bodyResult);
    
    if (isTryError(validationResult)) {
      return NextResponse.json(
        {
          error: validationResult.message,
          type: validationResult.type,
          details: validationResult.context
        },
        { status: 400 }
      );
    }

    // Create user
    const userResult = await createUser(validationResult);
    
    if (isTryError(userResult)) {
      const statusCode = userResult.type === 'UserAlreadyExistsError' ? 409 : 500;
      
      return NextResponse.json(
        {
          error: userResult.message,
          type: userResult.type,
          details: userResult.context
        },
        { status: statusCode }
      );
    }

    // Success response
    return NextResponse.json(
      { 
        user: userResult,
        message: 'User created successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    // Catch any unexpected errors
    const unexpectedError = fromThrown(error, {
      endpoint: '/api/users',
      method: 'POST'
    });

    console.error('Unexpected error in POST /api/users:', unexpectedError);

    return NextResponse.json(
      {
        error: 'Internal server error',
        type: 'InternalError',
        requestId: crypto.randomUUID()
      },
      { status: 500 }
    );
  }
}`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>React</Badge>
              Form Validation Pattern
            </CardTitle>
            <CardDescription>
              Complete form handling with validation and error states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="typescript" title="components/UserForm.tsx">
              {`import { useState } from 'react';
import { trySync, tryAsync, isOk, isTryError } from 'try-error';
import { useTryCallback } from '@try-error/react';

interface FormData {
  name: string;
  email: string;
  age: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// Validation functions
function validateName(name: string) {
  return trySync(() => {
    if (!name.trim()) {
      throw createError({
        type: 'RequiredFieldError',
        message: 'Name is required',
        context: { field: 'name' }
      });
    }
    
    if (name.length < 2) {
      throw createError({
        type: 'ValidationError',
        message: 'Name must be at least 2 characters',
        context: { field: 'name', minLength: 2 }
      });
    }
    
    return name.trim();
  });
}

function validateEmail(email: string) {
  return trySync(() => {
    if (!email.trim()) {
      throw createError({
        type: 'RequiredFieldError',
        message: 'Email is required',
        context: { field: 'email' }
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        type: 'ValidationError',
        message: 'Please enter a valid email address',
        context: { field: 'email', format: 'email' }
      });
    }
    
    return email.trim().toLowerCase();
  });
}

function validateAge(ageStr: string) {
  return trySync(() => {
    if (!ageStr.trim()) return undefined; // Optional field
    
    const age = parseInt(ageStr, 10);
    
    if (isNaN(age)) {
      throw createError({
        type: 'ValidationError',
        message: 'Age must be a number',
        context: { field: 'age', type: 'number' }
      });
    }
    
    if (age < 18 || age > 120) {
      throw createError({
        type: 'ValidationError',
        message: 'Age must be between 18 and 120',
        context: { field: 'age', min: 18, max: 120 }
      });
    }
    
    return age;
  });
}

// Form validation
function validateForm(data: FormData) {
  return trySync(() => {
    const nameResult = validateName(data.name);
    const emailResult = validateEmail(data.email);
    const ageResult = validateAge(data.age);

    const errors: ValidationErrors = {};

    if (isTryError(nameResult)) {
      errors.name = nameResult.message;
    }
    
    if (isTryError(emailResult)) {
      errors.email = emailResult.message;
    }
    
    if (isTryError(ageResult)) {
      errors.age = ageResult.message;
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        type: 'FormValidationError',
        message: 'Form validation failed',
        context: { errors }
      });
    }

    return {
      name: nameResult,
      email: emailResult,
      age: ageResult
    };
  });
}

// API submission
async function submitUser(userData: { name: string; email: string; age?: number }) {
  return tryAsync(async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw createError({
        type: errorData.type || 'ApiError',
        message: errorData.error || 'Failed to create user',
        context: { 
          status: response.status,
          details: errorData.details 
        }
      });
    }

    return response.json();
  });
}

// Component
export default function UserForm({ onSuccess }: { onSuccess?: (user: any) => void }) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: ''
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { execute: handleSubmit, loading, error } = useTryCallback(
    async (data: FormData) => {
      // Clear previous errors
      setErrors({});

      // Validate form
      const validationResult = validateForm(data);
      
      if (isTryError(validationResult)) {
        if (validationResult.context?.errors) {
          setErrors(validationResult.context.errors as ValidationErrors);
        }
        throw validationResult;
      }

      // Submit to API
      const submitResult = await submitUser(validationResult);
      
      if (isTryError(submitResult)) {
        throw submitResult;
      }

      // Reset form on success
      setFormData({ name: '', email: '', age: '' });
      onSuccess?.(submitResult);
      
      return submitResult;
    },
    {
      onError: (error) => {
        // Handle API errors differently from validation errors
        if (error.type !== 'FormValidationError') {
          console.error('Submission error:', error);
        }
      }
    }
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={\`mt-1 block w-full rounded-md border \${errors.name ? 'border-red-500' : 'border-gray-300'}\`}
          disabled={loading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={\`mt-1 block w-full rounded-md border \${errors.email ? 'border-red-500' : 'border-gray-300'}\`}
          disabled={loading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium">
          Age (optional)
        </label>
        <input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
          className={\`mt-1 block w-full rounded-md border \${errors.age ? 'border-red-500' : 'border-gray-300'}\`}
          disabled={loading}
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-600">{errors.age}</p>
        )}
      </div>

      {error && error.type !== 'FormValidationError' && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error.message}
            {error.context?.details && (
              <span className="block mt-1 text-xs">
                Details: {JSON.stringify(error.context.details)}
              </span>
            )}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>Error Boundary</Badge>
              React Error Boundary Integration
            </CardTitle>
            <CardDescription>
              Complete error boundary setup with try-error integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              language="typescript"
              title="components/AppErrorBoundary.tsx"
            >
              {`import React from 'react';
import { TryErrorBoundary } from '@try-error/react';
import { fromThrown, createError } from 'try-error';

interface ErrorDisplayProps {
  error: TryError;
  errorInfo?: React.ErrorInfo;
  retry?: () => void;
}

function ErrorDisplay({ error, errorInfo, retry }: ErrorDisplayProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Categorize errors for better UX
  const getErrorCategory = (error: TryError) => {
    if (error.type.includes('Network') || error.type.includes('Api')) {
      return 'network';
    }
    if (error.type.includes('Validation') || error.type.includes('Input')) {
      return 'validation';
    }
    if (error.type.includes('Permission') || error.type.includes('Auth')) {
      return 'permission';
    }
    return 'unknown';
  };

  const category = getErrorCategory(error);

  const errorMessages = {
    network: {
      title: 'Connection Problem',
      message: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
      action: 'Retry'
    },
    validation: {
      title: 'Invalid Input',
      message: 'There was a problem with the information you provided. Please check your input and try again.',
      action: 'Go Back'
    },
    permission: {
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource. Please contact support if you believe this is an error.',
      action: 'Go Home'
    },
    unknown: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Our team has been notified and we\'re working on a fix.',
      action: 'Try Again'
    }
  };

  const errorConfig = errorMessages[category];

  // Report error to monitoring service
  React.useEffect(() => {
    // In a real app, you'd send this to your error monitoring service
    console.error('Error boundary caught error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Example: Send to error monitoring
    // errorMonitoring.captureException(error, {
    //   tags: { component: 'ErrorBoundary', category },
    //   extra: { errorInfo, context: error.context }
    // });
  }, [error, errorInfo, category]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="ml-3 text-lg font-medium text-gray-900">
            {errorConfig.title}
          </h1>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          {errorConfig.message}
        </p>

        {isDevelopment && (
          <details className="mb-6 p-3 bg-gray-100 rounded-md">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Debug Information
            </summary>
            <div className="text-xs space-y-2">
              <div>
                <strong>Type:</strong> {error.type}
              </div>
              <div>
                <strong>Message:</strong> {error.message}
              </div>
              {error.source && (
                <div>
                  <strong>Source:</strong> {error.source}
                </div>
              )}
              {error.context && (
                <div>
                  <strong>Context:</strong>
                  <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-auto">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </div>
              )}
              {errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-auto">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex space-x-3">
          {retry && (
            <button
              onClick={retry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {errorConfig.action}
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Main error boundary wrapper
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <TryErrorBoundary
      fallback={(error, errorInfo, retry) => {
        // Convert any non-TryError to TryError
        const tryError = error instanceof Error && 'type' in error
          ? error as TryError
          : fromThrown(error, { 
              boundary: 'AppErrorBoundary',
              componentStack: errorInfo?.componentStack 
            });

        return (
          <ErrorDisplay 
            error={tryError} 
            errorInfo={errorInfo} 
            retry={retry}
          />
        );
      }}
      onError={(error, errorInfo) => {
        // Global error handler
        console.error('Uncaught error in app:', error, errorInfo);
      }}
    >
      {children}
    </TryErrorBoundary>
  );
}`}
            </CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
