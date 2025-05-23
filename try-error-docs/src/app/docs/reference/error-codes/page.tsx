export default function ErrorCodesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Error Codes Reference
        </h1>
        <p className="text-xl text-slate-600">
          Complete reference of standard error types and codes used in try-error
        </p>
      </div>

      <div className="space-y-8">
        {/* Standard Error Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Standard Error Types
          </h2>

          <p className="text-slate-600 mb-6">
            try-error provides a set of standard error types that cover common
            error scenarios. These types help categorize errors for better
            handling and debugging.
          </p>

          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                ValidationError
              </h3>
              <p className="text-slate-600 mb-3">
                Used when input validation fails or data doesn't meet required
                criteria.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Example usage
const result = trySync(() => {
  if (!email.includes('@')) {
    throw createTryError('ValidationError', 'Invalid email format', {
      field: 'email',
      value: email,
      rule: 'must_contain_at_symbol'
    });
  }
  return email;
});`}</code>
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">
                  Common Context Fields
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <code>field</code> - The field that failed validation
                  </li>
                  <li>
                    • <code>value</code> - The invalid value
                  </li>
                  <li>
                    • <code>rule</code> - The validation rule that was violated
                  </li>
                  <li>
                    • <code>expected</code> - What was expected
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                NetworkError
              </h3>
              <p className="text-slate-600 mb-3">
                Used for network-related failures like HTTP requests, timeouts,
                or connectivity issues.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Example usage
const result = await tryAsync(async () => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw createTryError('NetworkError', 'Failed to fetch users', {
      url: '/api/users',
      status: response.status,
      statusText: response.statusText,
      method: 'GET'
    });
  }
  return response.json();
});`}</code>
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">
                  Common Context Fields
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <code>url</code> - The URL that was requested
                  </li>
                  <li>
                    • <code>status</code> - HTTP status code
                  </li>
                  <li>
                    • <code>statusText</code> - HTTP status text
                  </li>
                  <li>
                    • <code>method</code> - HTTP method used
                  </li>
                  <li>
                    • <code>timeout</code> - Whether the request timed out
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                AuthenticationError
              </h3>
              <p className="text-slate-600 mb-3">
                Used when authentication fails or credentials are invalid.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Example usage
const result = await tryAsync(async () => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    throw createTryError('AuthenticationError', 'Authentication required', {
      reason: token ? 'token_expired' : 'no_token',
      userId: getCurrentUserId()
    });
  }
  return validateToken(token);
});`}</code>
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">
                  Common Context Fields
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <code>reason</code> - Why authentication failed
                  </li>
                  <li>
                    • <code>userId</code> - User ID if available
                  </li>
                  <li>
                    • <code>tokenExpired</code> - Whether token is expired
                  </li>
                  <li>
                    • <code>provider</code> - Authentication provider
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                AuthorizationError
              </h3>
              <p className="text-slate-600 mb-3">
                Used when a user is authenticated but lacks permission for a
                specific action.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Example usage
const result = trySync(() => {
  if (!user.hasPermission('admin')) {
    throw createTryError('AuthorizationError', 'Insufficient permissions', {
      userId: user.id,
      requiredPermission: 'admin',
      userPermissions: user.permissions,
      resource: 'admin_panel'
    });
  }
  return accessAdminPanel();
});`}</code>
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">
                  Common Context Fields
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <code>userId</code> - ID of the user attempting access
                  </li>
                  <li>
                    • <code>requiredPermission</code> - Permission needed
                  </li>
                  <li>
                    • <code>userPermissions</code> - User's current permissions
                  </li>
                  <li>
                    • <code>resource</code> - Resource being accessed
                  </li>
                  <li>
                    • <code>action</code> - Action being attempted
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                NotFoundError
              </h3>
              <p className="text-slate-600 mb-3">
                Used when a requested resource cannot be found.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Example usage
const result = await tryAsync(async () => {
  const user = await database.findUser(userId);
  if (!user) {
    throw createTryError('NotFoundError', 'User not found', {
      resourceType: 'user',
      resourceId: userId,
      searchCriteria: { id: userId }
    });
  }
  return user;
});`}</code>
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">
                  Common Context Fields
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <code>resourceType</code> - Type of resource (user, post,
                    etc.)
                  </li>
                  <li>
                    • <code>resourceId</code> - ID of the missing resource
                  </li>
                  <li>
                    • <code>searchCriteria</code> - Criteria used to search
                  </li>
                  <li>
                    • <code>suggestions</code> - Alternative resources
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                ConflictError
              </h3>
              <p className="text-slate-600 mb-3">
                Used when an operation conflicts with the current state of the
                resource.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Example usage
const result = await tryAsync(async () => {
  const existingUser = await database.findUserByEmail(email);
  if (existingUser) {
    throw createTryError('ConflictError', 'Email already in use', {
      field: 'email',
      value: email,
      conflictingResourceId: existingUser.id,
      conflictType: 'unique_constraint'
    });
  }
  return database.createUser({ email, name });
});`}</code>
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">
                  Common Context Fields
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <code>field</code> - Field causing the conflict
                  </li>
                  <li>
                    • <code>value</code> - Conflicting value
                  </li>
                  <li>
                    • <code>conflictingResourceId</code> - ID of conflicting
                    resource
                  </li>
                  <li>
                    • <code>conflictType</code> - Type of conflict
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                RateLimitError
              </h3>
              <p className="text-slate-600 mb-3">
                Used when rate limiting is triggered due to too many requests.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Example usage
const result = await tryAsync(async () => {
  if (requestCount > rateLimit) {
    throw createTryError('RateLimitError', 'Rate limit exceeded', {
      limit: rateLimit,
      window: '1 hour',
      requestCount,
      resetTime: Date.now() + 3600000,
      clientId: getClientId()
    });
  }
  return processRequest();
});`}</code>
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">
                  Common Context Fields
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <code>limit</code> - Maximum allowed requests
                  </li>
                  <li>
                    • <code>window</code> - Time window for the limit
                  </li>
                  <li>
                    • <code>requestCount</code> - Current request count
                  </li>
                  <li>
                    • <code>resetTime</code> - When the limit resets
                  </li>
                  <li>
                    • <code>clientId</code> - Identifier for the client
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* HTTP Status Code Mapping */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            HTTP Status Code Mapping
          </h2>

          <p className="text-slate-600 mb-4">
            Recommended HTTP status codes for each error type when building
            APIs.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-4 py-2 text-left">
                    Error Type
                  </th>
                  <th className="border border-slate-300 px-4 py-2 text-left">
                    HTTP Status
                  </th>
                  <th className="border border-slate-300 px-4 py-2 text-left">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    ValidationError
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    400 Bad Request
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    Client sent invalid data
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    AuthenticationError
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    401 Unauthorized
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    Authentication required
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    AuthorizationError
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    403 Forbidden
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    Insufficient permissions
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    NotFoundError
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    404 Not Found
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    Resource doesn't exist
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    ConflictError
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    409 Conflict
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    Resource state conflict
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    RateLimitError
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    429 Too Many Requests
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    Rate limit exceeded
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    NetworkError
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    502/503/504
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    External service issues
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                    Error (generic)
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    500 Internal Server Error
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    Unexpected server error
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Custom Error Types */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Creating Custom Error Types
          </h2>

          <p className="text-slate-600 mb-4">
            You can create custom error types for domain-specific errors in your
            application.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Define custom error types
export const CustomErrorTypes = {
  PAYMENT_FAILED: 'PaymentError',
  INVENTORY_INSUFFICIENT: 'InventoryError',
  SUBSCRIPTION_EXPIRED: 'SubscriptionError',
  FEATURE_DISABLED: 'FeatureError',
  MAINTENANCE_MODE: 'MaintenanceError'
} as const;

// Usage examples
const paymentResult = await tryAsync(async () => {
  const payment = await processPayment(amount, cardToken);
  if (!payment.success) {
    throw createTryError(CustomErrorTypes.PAYMENT_FAILED, 'Payment processing failed', {
      amount,
      cardLast4: payment.cardLast4,
      declineReason: payment.declineReason,
      transactionId: payment.transactionId
    });
  }
  return payment;
});

const inventoryResult = trySync(() => {
  if (product.stock < quantity) {
    throw createTryError(CustomErrorTypes.INVENTORY_INSUFFICIENT, 'Not enough stock', {
      productId: product.id,
      requested: quantity,
      available: product.stock,
      restockDate: product.restockDate
    });
  }
  return reserveInventory(product, quantity);
});`}</code>
            </pre>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Best Practices for Custom Error Types
            </h4>
            <ul className="space-y-1 text-yellow-700 text-sm">
              <li>• Use descriptive, domain-specific names</li>
              <li>
                • Follow a consistent naming convention (e.g., PascalCase +
                "Error")
              </li>
              <li>• Include relevant context data for debugging</li>
              <li>• Document the error type and when it's used</li>
              <li>• Consider the HTTP status code mapping for API errors</li>
            </ul>
          </div>
        </section>

        {/* Error Code Utilities */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Code Utilities
          </h2>

          <p className="text-slate-600 mb-4">
            Utility functions for working with error codes and types.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Check if error is of specific type
function isErrorType(error: TryError, type: string): boolean {
  return error.type === type;
}

// Get HTTP status code from error type
function getHttpStatusFromError(error: TryError): number {
  const statusMap: Record<string, number> = {
    ValidationError: 400,
    AuthenticationError: 401,
    AuthorizationError: 403,
    NotFoundError: 404,
    ConflictError: 409,
    RateLimitError: 429,
    NetworkError: 502,
  };
  
  return statusMap[error.type] || 500;
}

// Create error response for APIs
function createErrorResponse(error: TryError) {
  return {
    error: {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        context: error.context
      })
    }
  };
}

// Usage
if (isTryError(result)) {
  const status = getHttpStatusFromError(result);
  const response = createErrorResponse(result);
  res.status(status).json(response);
}`}</code>
            </pre>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Custom Error Types
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn how to create and use custom error types
              </p>
              <a
                href="/docs/advanced/custom-errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Custom Errors →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Error Creation
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                API reference for creating errors
              </p>
              <a
                href="/docs/api/errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error API →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Integration Guides
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                How to integrate error codes with frameworks
              </p>
              <a
                href="/docs/guides/integration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Integration →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
