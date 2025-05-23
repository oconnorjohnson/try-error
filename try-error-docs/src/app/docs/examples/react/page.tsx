export default function ReactExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          React Examples
        </h1>
        <p className="text-xl text-slate-600">
          Real-world examples of using try-error in React applications
        </p>
      </div>

      <div className="space-y-8">
        {/* User Dashboard Example */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            User Dashboard with Multiple Data Sources
          </h2>

          <p className="text-slate-600 mb-4">
            A complete example showing how to handle multiple async operations
            with different error handling strategies.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { useTryAsync, TryErrorBoundary } from '@try-error/react';
import { tryAsync, isTryError } from 'try-error';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

function UserDashboard({ userId }: { userId: string }) {
  // Critical data - must succeed
  const { data: user, error: userError, loading: userLoading } = useTryAsync(
    async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json() as Promise<User>;
    },
    [userId]
  );

  // Optional data - can fail gracefully
  const { data: stats, error: statsError } = useTryAsync(
    async () => {
      const response = await fetch(\`/api/users/\${userId}/stats\`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json() as Promise<UserStats>;
    },
    [userId]
  );

  const { data: notifications, error: notificationsError } = useTryAsync(
    async () => {
      const response = await fetch(\`/api/users/\${userId}/notifications\`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json() as Promise<Notification[]>;
    },
    [userId]
  );

  if (userLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <h2 className="text-xl font-semibold">Failed to load user</h2>
          <p>{userError.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats ? (
          <>
            <StatCard title="Posts" value={stats.postsCount} />
            <StatCard title="Followers" value={stats.followersCount} />
            <StatCard title="Following" value={stats.followingCount} />
          </>
        ) : statsError ? (
          <div className="col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ Stats unavailable: {statsError.message}
            </p>
          </div>
        ) : (
          <div className="col-span-3 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        )}
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="p-6">
          {notifications ? (
            notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No notifications</p>
            )
          ) : notificationsError ? (
            <div className="text-yellow-600">
              ⚠️ Notifications unavailable: {notificationsError.message}
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-gray-600">{title}</div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className={\`p-3 rounded \${notification.read ? 'bg-gray-50' : 'bg-blue-50'}\`}>
      <p className="text-sm">{notification.message}</p>
    </div>
  );
}

// Usage with Error Boundary
function App() {
  return (
    <TryErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-red-600 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={resetError}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      <UserDashboard userId="123" />
    </TryErrorBoundary>
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Form with Validation Example */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Form with Validation and Submission
          </h2>

          <p className="text-slate-600 mb-4">
            A form component that handles validation, submission, and error
            states using try-error patterns.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { useTryMutation, useTryCallback } from '@try-error/react';
import { trySync, isTryError } from 'try-error';
import { useState } from 'react';

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function CreateUserForm() {
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation function using try-error
  const validateForm = useTryCallback(
    (data: CreateUserForm): ValidationErrors => {
      const errors: ValidationErrors = {};

      // Name validation
      const nameResult = trySync(() => {
        if (!data.name.trim()) throw new Error('Name is required');
        if (data.name.length < 2) throw new Error('Name must be at least 2 characters');
        return data.name;
      });
      if (isTryError(nameResult)) errors.name = nameResult.message;

      // Email validation
      const emailResult = trySync(() => {
        if (!data.email.trim()) throw new Error('Email is required');
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(data.email)) throw new Error('Invalid email format');
        return data.email;
      });
      if (isTryError(emailResult)) errors.email = emailResult.message;

      // Password validation
      const passwordResult = trySync(() => {
        if (!data.password) throw new Error('Password is required');
        if (data.password.length < 8) throw new Error('Password must be at least 8 characters');
        if (!/[A-Z]/.test(data.password)) throw new Error('Password must contain uppercase letter');
        if (!/[0-9]/.test(data.password)) throw new Error('Password must contain a number');
        return data.password;
      });
      if (isTryError(passwordResult)) errors.password = passwordResult.message;

      // Confirm password validation
      const confirmResult = trySync(() => {
        if (data.password !== data.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        return data.confirmPassword;
      });
      if (isTryError(confirmResult)) errors.confirmPassword = confirmResult.message;

      return errors;
    },
    [formData]
  );

  // Mutation for creating user
  const { mutate: createUser, loading, error: submitError, data: createdUser } = useTryMutation(
    async (userData: Omit<CreateUserForm, 'confirmPassword'>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      
      return response.json();
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(formData);
    setValidationErrors(errors);
    
    // If validation passes, submit
    if (Object.keys(errors).length === 0) {
      const { confirmPassword, ...userData } = formData;
      await createUser(userData);
    }
  };

  const handleInputChange = (field: keyof CreateUserForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (createdUser) {
    return (
      <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-green-700">
            Welcome, {createdUser.name}! You can now log in to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          error={validationErrors.name}
          required
        />
        
        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={validationErrors.email}
          required
        />
        
        <FormField
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={validationErrors.password}
          required
        />
        
        <FormField
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={validationErrors.confirmPassword}
          required
        />
        
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{submitError.message}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  type,
  value,
  onChange,
  error,
  required = false,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 \${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }\`}
        required={required}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Data Fetching with Retry Example */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Data Fetching with Retry Logic
          </h2>

          <p className="text-slate-600 mb-4">
            A component that implements sophisticated retry logic for handling
            transient failures.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { useTryAsync } from '@try-error/react';
import { tryAsync, isTryError } from 'try-error';
import { useState, useCallback } from 'react';

interface ApiData {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

function DataFetcherWithRetry({ endpoint }: { endpoint: string }) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchData = useCallback(async (): Promise<ApiData> => {
    const result = await tryAsync(async () => {
      const response = await fetch(endpoint);
      
      // Handle different types of errors
      if (response.status === 429) {
        throw new Error('Rate limited - too many requests');
      }
      
      if (response.status >= 500) {
        throw new Error(\`Server error (\${response.status}) - this might be temporary\`);
      }
      
      if (!response.ok) {
        throw new Error(\`Request failed with status \${response.status}\`);
      }
      
      return response.json();
    });

    if (isTryError(result)) {
      throw result;
    }

    return result;
  }, [endpoint]);

  const { data, error, loading, refetch } = useTryAsync(fetchData, [fetchData]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    refetch();
    setIsRetrying(false);
  };

  const isRetriableError = error && (
    error.message.includes('Rate limited') ||
    error.message.includes('Server error') ||
    error.message.includes('Network error')
  );

  if (loading && !isRetrying) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="text-red-400 text-xl">⚠️</div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-red-800">
              Failed to load data
            </h3>
            <p className="mt-1 text-red-700">{error.message}</p>
            
            {error.context && (
              <details className="mt-2">
                <summary className="cursor-pointer text-red-600 text-sm">
                  Error Details
                </summary>
                <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </details>
            )}
            
            <div className="mt-4 flex items-center space-x-3">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
              
              {retryCount > 0 && (
                <span className="text-sm text-red-600">
                  Attempt {retryCount + 1}
                </span>
              )}
              
              {isRetriableError && retryCount < 3 && (
                <span className="text-sm text-red-600">
                  This error might be temporary
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{data.title}</h2>
        <button
          onClick={() => {
            setRetryCount(0);
            refetch();
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>
      
      <div className="prose max-w-none">
        <p className="text-gray-700">{data.content}</p>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
      
      {retryCount > 0 && (
        <div className="mt-2 text-xs text-green-600">
          ✓ Loaded successfully after {retryCount} retry{retryCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Best Practices Summary */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            React Best Practices Summary
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Do</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>
                  • Use TryErrorBoundary at the app level for unhandled errors
                </li>
                <li>• Handle loading states to improve user experience</li>
                <li>• Provide retry mechanisms for transient failures</li>
                <li>
                  • Show different error details in development vs production
                </li>
                <li>• Use graceful degradation for non-critical features</li>
                <li>
                  • Validate user input with try-error for consistent error
                  handling
                </li>
                <li>
                  • Clear validation errors when users start correcting them
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Show sensitive error information to end users</li>
                <li>• Ignore error states in your components</li>
                <li>• Use generic error messages without context</li>
                <li>• Forget to handle edge cases like empty data</li>
                <li>• Block the entire UI for non-critical failures</li>
                <li>• Retry indefinitely without exponential backoff</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">React Hooks</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about the hooks used in these examples
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
                Basic Examples
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Core try-error patterns and examples
              </p>
              <a
                href="/docs/examples/basic"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Basic Examples →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
