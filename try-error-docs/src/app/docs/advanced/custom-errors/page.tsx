import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function CustomErrorsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Custom Error Types
        </h1>
        <p className="text-xl text-slate-600">
          Creating domain-specific error types and hierarchies for better error
          handling
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Custom Errors */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Creating Custom Error Types
          </h2>

          <p className="text-slate-600 mb-4">
            Custom error types provide better semantic meaning and enable more
            precise error handling in your application. They extend the basic
            TryError structure with domain-specific context.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Basic Custom Error
              </h3>
              <CodeBlock
                language="typescript"
                title="Simple Custom Error Types"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { createTryError, TryError } from 'try-error';

// Define custom error interfaces
interface ValidationErrorContext {
  field: string;
  value: unknown;
  rule: string;
  expected?: string;
}

interface NetworkErrorContext {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  timeout?: number;
}

interface BusinessErrorContext {
  operation: string;
  entityId: string;
  entityType: string;
  reason: string;
}

// Custom error creation functions
export function createValidationError(
  message: string,
  context: ValidationErrorContext
): TryError<ValidationErrorContext> {
  return createTryError('ValidationError', message, context);
}

export function createNetworkError(
  message: string,
  context: NetworkErrorContext
): TryError<NetworkErrorContext> {
  return createTryError('NetworkError', message, context);
}

export function createBusinessError(
  message: string,
  context: BusinessErrorContext
): TryError<BusinessErrorContext> {
  return createTryError('BusinessError', message, context);
}

// Usage examples
const validationError = createValidationError(
  'Email format is invalid',
  {
    field: 'email',
    value: 'invalid-email',
    rule: 'email_format',
    expected: 'valid email address'
  }
);

const networkError = createNetworkError(
  'Request timeout',
  {
    url: '/api/users/123',
    method: 'GET',
    timeout: 5000
  }
);

const businessError = createBusinessError(
  'Cannot delete user with active orders',
  {
    operation: 'delete_user',
    entityId: '123',
    entityType: 'User',
    reason: 'has_active_orders'
  }
);`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Type-Safe Error Handling
              </h3>
              <CodeBlock
                language="typescript"
                title="Type-Safe Custom Error Handling"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { isTryError, hasErrorType } from 'try-error';

// Type guards for custom errors
function isValidationError(error: TryError): error is TryError<ValidationErrorContext> {
  return hasErrorType(error, 'ValidationError');
}

function isNetworkError(error: TryError): error is TryError<NetworkErrorContext> {
  return hasErrorType(error, 'NetworkError');
}

function isBusinessError(error: TryError): error is TryError<BusinessErrorContext> {
  return hasErrorType(error, 'BusinessError');
}

// Usage with type safety
async function handleUserOperation(userId: string) {
  const result = await tryAsync(() => performUserOperation(userId));
  
  if (isTryError(result)) {
    if (isValidationError(result)) {
      // TypeScript knows result.context is ValidationErrorContext
      return {
        status: 'validation_failed',
        field: result.context.field,
        message: result.message,
        expected: result.context.expected
      };
    }
    
    if (isNetworkError(result)) {
      // TypeScript knows result.context is NetworkErrorContext
      return {
        status: 'network_error',
        url: result.context.url,
        method: result.context.method,
        retryable: result.context.status !== 404
      };
    }
    
    if (isBusinessError(result)) {
      // TypeScript knows result.context is BusinessErrorContext
      return {
        status: 'business_error',
        operation: result.context.operation,
        entityType: result.context.entityType,
        reason: result.context.reason
      };
    }
    
    // Generic error handling
    return {
      status: 'unknown_error',
      message: result.message
    };
  }
  
  return {
    status: 'success',
    data: result
  };
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Hierarchies */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Hierarchies
          </h2>

          <p className="text-slate-600 mb-4">
            Create hierarchical error structures that allow for both specific
            and general error handling.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Hierarchical Error Types
              </h3>
              <CodeBlock
                language="typescript"
                title="Error Type Hierarchy"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Base error categories
type ErrorCategory = 'UserError' | 'SystemError' | 'ExternalError';

// Specific error types within categories
type UserErrorType = 
  | 'ValidationError'
  | 'AuthenticationError'
  | 'AuthorizationError'
  | 'InputError';

type SystemErrorType = 
  | 'DatabaseError'
  | 'FileSystemError'
  | 'ConfigurationError'
  | 'InternalError';

type ExternalErrorType = 
  | 'NetworkError'
  | 'APIError'
  | 'ServiceUnavailableError'
  | 'ThirdPartyError';

// Combined error type
type AppErrorType = UserErrorType | SystemErrorType | ExternalErrorType;

// Enhanced error context with hierarchy
interface HierarchicalErrorContext {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  userFacing: boolean;
  code?: string;
  details?: Record<string, unknown>;
}

// Error creation with hierarchy
function createHierarchicalError<T extends Record<string, unknown> = {}>(
  type: AppErrorType,
  message: string,
  context: HierarchicalErrorContext & T
): TryError<HierarchicalErrorContext & T> {
  return createTryError(type, message, context);
}

// Category-specific error creators
export function createUserError<T extends Record<string, unknown> = {}>(
  type: UserErrorType,
  message: string,
  context: Omit<HierarchicalErrorContext, 'category'> & T
): TryError<HierarchicalErrorContext & T> {
  return createHierarchicalError(type, message, {
    ...context,
    category: 'UserError'
  });
}

export function createSystemError<T extends Record<string, unknown> = {}>(
  type: SystemErrorType,
  message: string,
  context: Omit<HierarchicalErrorContext, 'category'> & T
): TryError<HierarchicalErrorContext & T> {
  return createHierarchicalError(type, message, {
    ...context,
    category: 'SystemError'
  });
}

export function createExternalError<T extends Record<string, unknown> = {}>(
  type: ExternalErrorType,
  message: string,
  context: Omit<HierarchicalErrorContext, 'category'> & T
): TryError<HierarchicalErrorContext & T> {
  return createHierarchicalError(type, message, {
    ...context,
    category: 'ExternalError'
  });
}

// Usage examples
const validationError = createUserError('ValidationError', 'Invalid email format', {
  severity: 'medium',
  retryable: false,
  userFacing: true,
  code: 'INVALID_EMAIL',
  field: 'email',
  value: 'invalid@'
});

const databaseError = createSystemError('DatabaseError', 'Connection timeout', {
  severity: 'high',
  retryable: true,
  userFacing: false,
  code: 'DB_TIMEOUT',
  connectionString: 'postgresql://...',
  timeout: 5000
});

const apiError = createExternalError('APIError', 'Third-party service unavailable', {
  severity: 'medium',
  retryable: true,
  userFacing: false,
  code: 'EXTERNAL_API_DOWN',
  service: 'payment-processor',
  endpoint: '/api/payments'
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Hierarchical Error Handling
              </h3>
              <CodeBlock
                language="typescript"
                title="Category-Based Error Handling"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Type guards for error categories
function isUserError(error: TryError): boolean {
  return error.context?.category === 'UserError';
}

function isSystemError(error: TryError): boolean {
  return error.context?.category === 'SystemError';
}

function isExternalError(error: TryError): boolean {
  return error.context?.category === 'ExternalError';
}

// Severity-based handling
function isCriticalError(error: TryError): boolean {
  return error.context?.severity === 'critical';
}

function isRetryableError(error: TryError): boolean {
  return error.context?.retryable === true;
}

function isUserFacingError(error: TryError): boolean {
  return error.context?.userFacing === true;
}

// Comprehensive error handler
class ErrorHandler {
  async handleError(error: TryError): Promise<ErrorResponse> {
    // Log error based on severity
    this.logError(error);
    
    // Alert on critical errors
    if (isCriticalError(error)) {
      await this.alertOncall(error);
    }
    
    // Handle by category
    if (isUserError(error)) {
      return this.handleUserError(error);
    }
    
    if (isSystemError(error)) {
      return this.handleSystemError(error);
    }
    
    if (isExternalError(error)) {
      return this.handleExternalError(error);
    }
    
    return this.handleUnknownError(error);
  }
  
  private handleUserError(error: TryError): ErrorResponse {
    return {
      status: 400,
      code: error.context?.code || 'USER_ERROR',
      message: isUserFacingError(error) ? error.message : 'Invalid request',
      retryable: false,
      details: isUserFacingError(error) ? error.context?.details : undefined
    };
  }
  
  private handleSystemError(error: TryError): ErrorResponse {
    return {
      status: 500,
      code: error.context?.code || 'SYSTEM_ERROR',
      message: 'Internal server error',
      retryable: isRetryableError(error),
      details: undefined // Never expose system details
    };
  }
  
  private handleExternalError(error: TryError): ErrorResponse {
    return {
      status: 502,
      code: error.context?.code || 'EXTERNAL_ERROR',
      message: 'Service temporarily unavailable',
      retryable: isRetryableError(error),
      details: undefined
    };
  }
  
  private logError(error: TryError): void {
    const logLevel = this.getLogLevel(error);
    const logData = {
      type: error.type,
      message: error.message,
      category: error.context?.category,
      severity: error.context?.severity,
      code: error.context?.code,
      context: error.context,
      timestamp: new Date().toISOString()
    };
    
    switch (logLevel) {
      case 'error':
        console.error('Error occurred:', logData);
        break;
      case 'warn':
        console.warn('Warning:', logData);
        break;
      case 'info':
        console.info('Info:', logData);
        break;
    }
  }
  
  private getLogLevel(error: TryError): 'error' | 'warn' | 'info' {
    switch (error.context?.severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
      default:
        return 'info';
    }
  }
}

interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Domain-Specific Errors */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Domain-Specific Error Systems
          </h2>

          <p className="text-slate-600 mb-4">
            Create comprehensive error systems tailored to specific business
            domains.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                E-commerce Error System
              </h3>
              <CodeBlock
                language="typescript"
                title="E-commerce Domain Errors"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// E-commerce specific error types
type EcommerceErrorType = 
  | 'ProductNotFoundError'
  | 'InsufficientInventoryError'
  | 'InvalidPriceError'
  | 'PaymentFailedError'
  | 'ShippingUnavailableError'
  | 'CouponInvalidError'
  | 'OrderNotFoundError'
  | 'CartEmptyError';

// Domain-specific contexts
interface ProductErrorContext {
  productId: string;
  sku?: string;
  category?: string;
  availability?: number;
}

interface PaymentErrorContext {
  paymentMethod: string;
  amount: number;
  currency: string;
  transactionId?: string;
  gatewayResponse?: string;
}

interface OrderErrorContext {
  orderId: string;
  userId: string;
  status: string;
  items: Array<{ productId: string; quantity: number }>;
}

// E-commerce error factory
class EcommerceErrorFactory {
  static productNotFound(productId: string, sku?: string): TryError<ProductErrorContext> {
    return createTryError('ProductNotFoundError', 'Product not found', {
      productId,
      sku,
      category: 'product',
      severity: 'medium',
      userFacing: true,
      retryable: false
    });
  }
  
  static insufficientInventory(
    productId: string, 
    requested: number, 
    available: number
  ): TryError<ProductErrorContext> {
    return createTryError('InsufficientInventoryError', 'Not enough items in stock', {
      productId,
      availability: available,
      requested,
      category: 'inventory',
      severity: 'medium',
      userFacing: true,
      retryable: false
    });
  }
  
  static paymentFailed(
    paymentMethod: string,
    amount: number,
    currency: string,
    gatewayResponse?: string
  ): TryError<PaymentErrorContext> {
    return createTryError('PaymentFailedError', 'Payment processing failed', {
      paymentMethod,
      amount,
      currency,
      gatewayResponse,
      category: 'payment',
      severity: 'high',
      userFacing: true,
      retryable: true
    });
  }
  
  static orderNotFound(orderId: string, userId: string): TryError<OrderErrorContext> {
    return createTryError('OrderNotFoundError', 'Order not found', {
      orderId,
      userId,
      status: 'not_found',
      items: [],
      category: 'order',
      severity: 'medium',
      userFacing: true,
      retryable: false
    });
  }
  
  static invalidCoupon(
    couponCode: string,
    reason: 'expired' | 'invalid' | 'used' | 'minimum_not_met'
  ): TryError {
    const messages = {
      expired: 'Coupon has expired',
      invalid: 'Invalid coupon code',
      used: 'Coupon has already been used',
      minimum_not_met: 'Order does not meet minimum requirements for this coupon'
    };
    
    return createTryError('CouponInvalidError', messages[reason], {
      couponCode,
      reason,
      category: 'promotion',
      severity: 'low',
      userFacing: true,
      retryable: false
    });
  }
}

// Usage in e-commerce service
class ProductService {
  async getProduct(productId: string): Promise<TryResult<Product, TryError>> {
    return tryAsync(async () => {
      const product = await this.repository.findById(productId);
      
      if (!product) {
        throw EcommerceErrorFactory.productNotFound(productId, product?.sku);
      }
      
      return product;
    });
  }
  
  async reserveInventory(
    productId: string, 
    quantity: number
  ): Promise<TryResult<void, TryError>> {
    return tryAsync(async () => {
      const product = await this.repository.findById(productId);
      
      if (!product) {
        throw EcommerceErrorFactory.productNotFound(productId);
      }
      
      if (product.inventory < quantity) {
        throw EcommerceErrorFactory.insufficientInventory(
          productId,
          quantity,
          product.inventory
        );
      }
      
      await this.repository.updateInventory(productId, -quantity);
    });
  }
}

// Error handling in controllers
class OrderController {
  async createOrder(req: Request, res: Response) {
    const result = await this.orderService.createOrder(req.body);
    
    if (isTryError(result)) {
      const response = this.mapErrorToResponse(result);
      return res.status(response.status).json(response);
    }
    
    return res.status(201).json({ order: result });
  }
  
  private mapErrorToResponse(error: TryError): ErrorResponse {
    switch (error.type) {
      case 'ProductNotFoundError':
        return {
          status: 404,
          code: 'PRODUCT_NOT_FOUND',
          message: error.message,
          details: { productId: error.context?.productId }
        };
        
      case 'InsufficientInventoryError':
        return {
          status: 409,
          code: 'INSUFFICIENT_INVENTORY',
          message: error.message,
          details: {
            productId: error.context?.productId,
            available: error.context?.availability,
            requested: error.context?.requested
          }
        };
        
      case 'PaymentFailedError':
        return {
          status: 402,
          code: 'PAYMENT_FAILED',
          message: error.message,
          retryable: true
        };
        
      default:
        return {
          status: 500,
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        };
    }
  }
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Composition */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Composition and Chaining
          </h2>

          <p className="text-slate-600 mb-4">
            Compose complex errors from simpler ones and maintain error chains
            for better debugging.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Composition
              </h3>
              <CodeBlock
                language="typescript"
                title="Composable Error System"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Composable error builder
class ErrorBuilder {
  private errorData: {
    type: string;
    message: string;
    context: Record<string, unknown>;
    cause?: TryError;
    chain: TryError[];
  };
  
  constructor(type: string, message: string) {
    this.errorData = {
      type,
      message,
      context: {},
      chain: []
    };
  }
  
  static create(type: string, message: string): ErrorBuilder {
    return new ErrorBuilder(type, message);
  }
  
  withContext<T extends Record<string, unknown>>(context: T): ErrorBuilder {
    this.errorData.context = { ...this.errorData.context, ...context };
    return this;
  }
  
  withCause(cause: TryError): ErrorBuilder {
    this.errorData.cause = cause;
    return this;
  }
  
  withChain(errors: TryError[]): ErrorBuilder {
    this.errorData.chain = [...this.errorData.chain, ...errors];
    return this;
  }
  
  severity(level: 'low' | 'medium' | 'high' | 'critical'): ErrorBuilder {
    return this.withContext({ severity: level });
  }
  
  retryable(canRetry: boolean = true): ErrorBuilder {
    return this.withContext({ retryable: canRetry });
  }
  
  userFacing(isUserFacing: boolean = true): ErrorBuilder {
    return this.withContext({ userFacing: isUserFacing });
  }
  
  code(errorCode: string): ErrorBuilder {
    return this.withContext({ code: errorCode });
  }
  
  build(): TryError {
    return createTryError(this.errorData.type, this.errorData.message, {
      ...this.errorData.context,
      ...(this.errorData.cause && { cause: this.errorData.cause }),
      ...(this.errorData.chain.length > 0 && { chain: this.errorData.chain })
    });
  }
}

// Usage examples
const composedError = ErrorBuilder
  .create('OrderProcessingError', 'Failed to process order')
  .withContext({
    orderId: '12345',
    userId: 'user123',
    step: 'payment_processing'
  })
  .severity('high')
  .retryable(true)
  .code('ORDER_PROC_001')
  .withCause(paymentError)
  .build();

// Error aggregation for batch operations
class ErrorAggregator {
  private errors: TryError[] = [];
  
  add(error: TryError): void {
    this.errors.push(error);
  }
  
  addAll(errors: TryError[]): void {
    this.errors.push(...errors);
  }
  
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  getErrors(): TryError[] {
    return [...this.errors];
  }
  
  createAggregateError(type: string, message: string): TryError {
    return ErrorBuilder
      .create(type, message)
      .withContext({
        errorCount: this.errors.length,
        errors: this.errors.map(e => ({
          type: e.type,
          message: e.message,
          context: e.context
        }))
      })
      .severity(this.getHighestSeverity())
      .build();
  }
  
  private getHighestSeverity(): 'low' | 'medium' | 'high' | 'critical' {
    const severities = this.errors
      .map(e => e.context?.severity)
      .filter(Boolean) as string[];
    
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }
}

// Batch processing with error aggregation
async function processBatchWithAggregation<T>(
  items: T[],
  processor: (item: T) => Promise<TryResult<void, TryError>>
): Promise<TryResult<void, TryError>> {
  const aggregator = new ErrorAggregator();
  
  for (const item of items) {
    const result = await processor(item);
    if (isTryError(result)) {
      aggregator.add(result);
    }
  }
  
  if (aggregator.hasErrors()) {
    return aggregator.createAggregateError(
      'BatchProcessingError',
      \`Failed to process \${aggregator.getErrors().length} out of \${items.length} items\`
    );
  }
  
  return undefined as any; // Success
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Best Practices
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Do</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>
                  • Create domain-specific error types for better semantics
                </li>
                <li>
                  • Use hierarchical error structures for flexible handling
                </li>
                <li>• Include rich context information in custom errors</li>
                <li>• Implement type guards for type-safe error handling</li>
                <li>• Use error builders for complex error composition</li>
                <li>• Maintain error chains for debugging complex flows</li>
                <li>• Categorize errors by severity and user-facing nature</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>
                  • Create too many granular error types without clear purpose
                </li>
                <li>• Include sensitive information in user-facing errors</li>
                <li>• Make error hierarchies too deep or complex</li>
                <li>• Ignore error context when handling errors</li>
                <li>• Use generic error types for domain-specific problems</li>
                <li>• Create circular references in error chains</li>
                <li>• Expose internal system details in error messages</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips</h4>
              <ul className="space-y-1 text-yellow-700 text-sm">
                <li>
                  • Start with basic custom errors and evolve to hierarchies
                </li>
                <li>• Use error codes for programmatic error handling</li>
                <li>• Document your error types and their contexts</li>
                <li>
                  • Consider internationalization for user-facing messages
                </li>
                <li>• Use error aggregation for batch operations</li>
                <li>
                  • Implement error recovery strategies based on error types
                </li>
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
              <h3 className="font-semibold text-slate-900 mb-2">
                Error Creation API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about the core error creation functions and utilities
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
                Error Factories
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Advanced patterns for creating reusable error factories
              </p>
              <a
                href="/docs/advanced/factories"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Factories →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
