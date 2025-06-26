import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function FactoriesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Error Factory Patterns
        </h1>
        <p className="text-xl text-slate-600">
          Advanced patterns for creating reusable, composable error factory
          functions
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Factory Patterns */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Basic Factory Patterns
          </h2>

          <p className="text-slate-600 mb-4">
            Error factories provide a consistent way to create errors with
            predefined structure and context. They encapsulate error creation
            logic and ensure consistency across your application.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Simple Error Factories
              </h3>
              <CodeBlock
                language="typescript"
                title="Basic Error Factory Functions"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { createTryError, TryError } from 'tryError';

// Basic validation error factory
export function createValidationError(
  field: string,
  value: unknown,
  message: string,
  rule?: string
): TryError {
  return createTryError('ValidationError', message, {
    field,
    value,
    rule,
    timestamp: new Date().toISOString(),
    severity: 'medium',
    userFacing: true
  });
}

// Network error factory with common patterns
export function createNetworkError(
  url: string,
  method: string,
  status?: number,
  message?: string
): TryError {
  const defaultMessage = status 
    ? \`HTTP \${status}: Request failed\`
    : 'Network request failed';

  return createTryError('NetworkError', message || defaultMessage, {
    url,
    method,
    status,
    timestamp: new Date().toISOString(),
    retryable: status ? status >= 500 || status === 429 : true,
    severity: status && status < 500 ? 'medium' : 'high'
  });
}

// Database error factory
export function createDatabaseError(
  operation: string,
  table?: string,
  constraint?: string,
  originalError?: Error
): TryError {
  return createTryError('DatabaseError', \`Database operation failed: \${operation}\`, {
    operation,
    table,
    constraint,
    originalError: originalError?.message,
    timestamp: new Date().toISOString(),
    retryable: !constraint, // Constraint violations are not retryable
    severity: 'high'
  });
}

// Usage examples
const validationError = createValidationError(
  'email',
  'invalid-email',
  'Email format is invalid',
  'email_format'
);

const networkError = createNetworkError(
  '/api/users/123',
  'GET',
  404,
  'User not found'
);

const dbError = createDatabaseError(
  'INSERT',
  'users',
  'unique_email',
  new Error('Duplicate key violation')
);`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Parameterized Factory Functions
              </h3>
              <CodeBlock
                language="typescript"
                title="Configurable Error Factories"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Factory with configuration options
interface ErrorFactoryOptions {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userFacing?: boolean;
  retryable?: boolean;
  code?: string;
  metadata?: Record<string, unknown>;
}

export function createConfigurableError(
  type: string,
  message: string,
  context: Record<string, unknown>,
  options: ErrorFactoryOptions = {}
): TryError {
  return createTryError(type, message, {
    ...context,
    severity: options.severity || 'medium',
    userFacing: options.userFacing || false,
    retryable: options.retryable || false,
    code: options.code,
    metadata: options.metadata,
    timestamp: new Date().toISOString()
  });
}

// Specialized factories using the configurable base
export function createAuthenticationError(
  reason: 'invalid_credentials' | 'token_expired' | 'token_invalid',
  userId?: string
): TryError {
  const messages = {
    invalid_credentials: 'Invalid username or password',
    token_expired: 'Authentication token has expired',
    token_invalid: 'Invalid authentication token'
  };

  return createConfigurableError(
    'AuthenticationError',
    messages[reason],
    { reason, userId },
    {
      severity: 'medium',
      userFacing: true,
      retryable: reason === 'token_expired',
      code: \`AUTH_\${reason.toUpperCase()}\`
    }
  );
}

export function createAuthorizationError(
  resource: string,
  action: string,
  userId: string,
  requiredRole?: string
): TryError {
  return createConfigurableError(
    'AuthorizationError',
    'Insufficient permissions to perform this action',
    { resource, action, userId, requiredRole },
    {
      severity: 'medium',
      userFacing: true,
      retryable: false,
      code: 'INSUFFICIENT_PERMISSIONS'
    }
  );
}

// Business logic error factory
export function createBusinessRuleError(
  rule: string,
  entity: string,
  entityId: string,
  details?: Record<string, unknown>
): TryError {
  return createConfigurableError(
    'BusinessRuleError',
    \`Business rule violation: \${rule}\`,
    { rule, entity, entityId, details },
    {
      severity: 'medium',
      userFacing: true,
      retryable: false,
      code: \`BUSINESS_RULE_\${rule.toUpperCase()}\`
    }
  );
}

// Usage examples
const authError = createAuthenticationError('invalid_credentials', 'user123');

const authzError = createAuthorizationError(
  'user_profile',
  'delete',
  'user123',
  'admin'
);

const businessError = createBusinessRuleError(
  'minimum_age_requirement',
  'user',
  'user123',
  { currentAge: 16, requiredAge: 18 }
);`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Factory Classes */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Factory Classes and Builders
          </h2>

          <p className="text-slate-600 mb-4">
            For more complex scenarios, factory classes provide better
            organization and allow for stateful error creation with shared
            configuration.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Factory Classes
              </h3>
              <CodeBlock
                language="typescript"
                title="Class-Based Error Factories"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Base error factory class
abstract class BaseErrorFactory {
  protected defaultSeverity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  protected defaultUserFacing: boolean = false;
  protected serviceContext: Record<string, unknown> = {};

  constructor(serviceContext: Record<string, unknown> = {}) {
    this.serviceContext = serviceContext;
  }

  protected createError(
    type: string,
    message: string,
    context: Record<string, unknown> = {},
    overrides: Partial<ErrorFactoryOptions> = {}
  ): TryError {
    return createTryError(type, message, {
      ...this.serviceContext,
      ...context,
      severity: overrides.severity || this.defaultSeverity,
      userFacing: overrides.userFacing ?? this.defaultUserFacing,
      retryable: overrides.retryable || false,
      timestamp: new Date().toISOString(),
      ...overrides.metadata
    });
  }
}

// User service error factory
class UserErrorFactory extends BaseErrorFactory {
  constructor(serviceContext: Record<string, unknown> = {}) {
    super({ service: 'user-service', ...serviceContext });
    this.defaultUserFacing = true;
  }

  userNotFound(userId: string): TryError {
    return this.createError(
      'UserNotFoundError',
      'User not found',
      { userId },
      { code: 'USER_NOT_FOUND' }
    );
  }

  emailAlreadyExists(email: string): TryError {
    return this.createError(
      'EmailConflictError',
      'Email address is already registered',
      { email },
      { code: 'EMAIL_CONFLICT' }
    );
  }

  invalidUserData(field: string, value: unknown, reason: string): TryError {
    return this.createError(
      'InvalidUserDataError',
      \`Invalid user data: \${reason}\`,
      { field, value, reason },
      { code: 'INVALID_USER_DATA' }
    );
  }

  userDeactivated(userId: string, reason: string): TryError {
    return this.createError(
      'UserDeactivatedError',
      'User account is deactivated',
      { userId, reason },
      { code: 'USER_DEACTIVATED' }
    );
  }
}

// Payment service error factory
class PaymentErrorFactory extends BaseErrorFactory {
  constructor(serviceContext: Record<string, unknown> = {}) {
    super({ service: 'payment-service', ...serviceContext });
    this.defaultSeverity = 'high';
  }

  paymentDeclined(
    transactionId: string,
    reason: string,
    gatewayResponse?: string
  ): TryError {
    return this.createError(
      'PaymentDeclinedError',
      'Payment was declined',
      { transactionId, reason, gatewayResponse },
      { 
        code: 'PAYMENT_DECLINED',
        userFacing: true,
        retryable: reason === 'insufficient_funds' ? false : true
      }
    );
  }

  paymentTimeout(transactionId: string, timeoutMs: number): TryError {
    return this.createError(
      'PaymentTimeoutError',
      'Payment processing timed out',
      { transactionId, timeoutMs },
      { 
        code: 'PAYMENT_TIMEOUT',
        retryable: true,
        severity: 'critical'
      }
    );
  }

  invalidPaymentMethod(paymentMethodId: string, reason: string): TryError {
    return this.createError(
      'InvalidPaymentMethodError',
      'Payment method is invalid',
      { paymentMethodId, reason },
      { 
        code: 'INVALID_PAYMENT_METHOD',
        userFacing: true
      }
    );
  }
}

// Usage with dependency injection
class UserService {
  private errorFactory: UserErrorFactory;

  constructor(requestContext: Record<string, unknown> = {}) {
    this.errorFactory = new UserErrorFactory({
      requestId: requestContext.requestId,
      userId: requestContext.userId,
      userAgent: requestContext.userAgent
    });
  }

  async getUser(userId: string): Promise<TryResult<User, TryError>> {
    return tryAsync(async () => {
      const user = await this.repository.findById(userId);
      
      if (!user) {
        throw this.errorFactory.userNotFound(userId);
      }

      if (user.status === 'deactivated') {
        throw this.errorFactory.userDeactivated(userId, user.deactivationReason);
      }

      return user;
    });
  }

  async createUser(userData: CreateUserData): Promise<TryResult<User, TryError>> {
    return tryAsync(async () => {
      // Check if email exists
      const existingUser = await this.repository.findByEmail(userData.email);
      if (existingUser) {
        throw this.errorFactory.emailAlreadyExists(userData.email);
      }

      // Validate user data
      if (!userData.email || !this.isValidEmail(userData.email)) {
        throw this.errorFactory.invalidUserData(
          'email',
          userData.email,
          'Invalid email format'
        );
      }

      return this.repository.create(userData);
    });
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Fluent Error Builders
              </h3>
              <CodeBlock
                language="typescript"
                title="Fluent Builder Pattern"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Fluent error builder
class ErrorBuilder {
  private errorData: {
    type: string;
    message: string;
    context: Record<string, unknown>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userFacing: boolean;
    retryable: boolean;
    code?: string;
    cause?: TryError;
  };

  constructor(type: string, message: string) {
    this.errorData = {
      type,
      message,
      context: {},
      severity: 'medium',
      userFacing: false,
      retryable: false
    };
  }

  static create(type: string, message: string): ErrorBuilder {
    return new ErrorBuilder(type, message);
  }

  // Context methods
  withContext(key: string, value: unknown): ErrorBuilder {
    this.errorData.context[key] = value;
    return this;
  }

  withContextObject(context: Record<string, unknown>): ErrorBuilder {
    this.errorData.context = { ...this.errorData.context, ...context };
    return this;
  }

  // Configuration methods
  severity(level: 'low' | 'medium' | 'high' | 'critical'): ErrorBuilder {
    this.errorData.severity = level;
    return this;
  }

  userFacing(isUserFacing: boolean = true): ErrorBuilder {
    this.errorData.userFacing = isUserFacing;
    return this;
  }

  retryable(canRetry: boolean = true): ErrorBuilder {
    this.errorData.retryable = canRetry;
    return this;
  }

  code(errorCode: string): ErrorBuilder {
    this.errorData.code = errorCode;
    return this;
  }

  causedBy(cause: TryError): ErrorBuilder {
    this.errorData.cause = cause;
    return this;
  }

  // Conditional methods
  when(condition: boolean, configureFn: (builder: ErrorBuilder) => ErrorBuilder): ErrorBuilder {
    if (condition) {
      return configureFn(this);
    }
    return this;
  }

  // Specialized context methods
  forUser(userId: string): ErrorBuilder {
    return this.withContext('userId', userId);
  }

  forResource(resourceType: string, resourceId: string): ErrorBuilder {
    return this.withContextObject({ resourceType, resourceId });
  }

  forOperation(operation: string): ErrorBuilder {
    return this.withContext('operation', operation);
  }

  withTimestamp(): ErrorBuilder {
    return this.withContext('timestamp', new Date().toISOString());
  }

  // Build method
  build(): TryError {
    return createTryError(this.errorData.type, this.errorData.message, {
      ...this.errorData.context,
      severity: this.errorData.severity,
      userFacing: this.errorData.userFacing,
      retryable: this.errorData.retryable,
      ...(this.errorData.code && { code: this.errorData.code }),
      ...(this.errorData.cause && { cause: this.errorData.cause })
    });
  }
}

// Specialized builders for common patterns
class ValidationErrorBuilder extends ErrorBuilder {
  constructor(field: string, value: unknown, message: string) {
    super('ValidationError', message);
    this.withContextObject({ field, value })
        .userFacing(true)
        .severity('medium');
  }

  static field(field: string, value: unknown, message: string): ValidationErrorBuilder {
    return new ValidationErrorBuilder(field, value, message);
  }

  rule(ruleName: string): ValidationErrorBuilder {
    return this.withContext('rule', ruleName) as ValidationErrorBuilder;
  }

  expected(expectedValue: unknown): ValidationErrorBuilder {
    return this.withContext('expected', expectedValue) as ValidationErrorBuilder;
  }
}

class NetworkErrorBuilder extends ErrorBuilder {
  constructor(url: string, method: string, message: string) {
    super('NetworkError', message);
    this.withContextObject({ url, method })
        .severity('high')
        .retryable(true);
  }

  static request(url: string, method: string, message: string): NetworkErrorBuilder {
    return new NetworkErrorBuilder(url, method, message);
  }

  status(statusCode: number): NetworkErrorBuilder {
    this.withContext('status', statusCode);
    // Adjust retryability based on status code
    if (statusCode >= 400 && statusCode < 500) {
      this.retryable(false);
    }
    return this as NetworkErrorBuilder;
  }

  timeout(timeoutMs: number): NetworkErrorBuilder {
    return this.withContext('timeout', timeoutMs) as NetworkErrorBuilder;
  }
}

// Usage examples
const validationError = ValidationErrorBuilder
  .field('email', 'invalid@', 'Invalid email format')
  .rule('email_format')
  .expected('valid email address')
  .code('INVALID_EMAIL')
  .build();

const networkError = NetworkErrorBuilder
  .request('/api/users/123', 'GET', 'Request failed')
  .status(404)
  .timeout(5000)
  .code('USER_NOT_FOUND')
  .build();

const complexError = ErrorBuilder
  .create('OrderProcessingError', 'Failed to process order')
  .forUser('user123')
  .forResource('order', 'order456')
  .forOperation('payment_processing')
  .severity('high')
  .userFacing(true)
  .retryable(true)
  .code('ORDER_PAYMENT_FAILED')
  .withTimestamp()
  .when(process.env.NODE_ENV === 'development', builder =>
    builder.withContext('debug', { stackTrace: true, verbose: true })
  )
  .build();`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Domain-Specific Factories */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Domain-Specific Factory Patterns
          </h2>

          <p className="text-slate-600 mb-4">
            Create specialized factory patterns tailored to specific business
            domains and use cases.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                E-commerce Factory System
              </h3>
              <CodeBlock
                language="typescript"
                title="E-commerce Error Factory"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// E-commerce domain factory
class EcommerceErrorFactory {
  private static instance: EcommerceErrorFactory;
  private requestContext: Record<string, unknown> = {};

  private constructor() {}

  static getInstance(): EcommerceErrorFactory {
    if (!EcommerceErrorFactory.instance) {
      EcommerceErrorFactory.instance = new EcommerceErrorFactory();
    }
    return EcommerceErrorFactory.instance;
  }

  withContext(context: Record<string, unknown>): EcommerceErrorFactory {
    this.requestContext = { ...this.requestContext, ...context };
    return this;
  }

  // Product-related errors
  product = {
    notFound: (productId: string, sku?: string): TryError => 
      ErrorBuilder
        .create('ProductNotFoundError', 'Product not found')
        .withContextObject({ productId, sku, ...this.requestContext })
        .userFacing(true)
        .code('PRODUCT_NOT_FOUND')
        .build(),

    outOfStock: (productId: string, requested: number, available: number): TryError =>
      ErrorBuilder
        .create('OutOfStockError', 'Product is out of stock')
        .withContextObject({ 
          productId, 
          requested, 
          available,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('OUT_OF_STOCK')
        .build(),

    priceChanged: (productId: string, oldPrice: number, newPrice: number): TryError =>
      ErrorBuilder
        .create('PriceChangedError', 'Product price has changed')
        .withContextObject({ 
          productId, 
          oldPrice, 
          newPrice,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('PRICE_CHANGED')
        .build(),

    discontinued: (productId: string, discontinuedDate: string): TryError =>
      ErrorBuilder
        .create('ProductDiscontinuedError', 'Product has been discontinued')
        .withContextObject({ 
          productId, 
          discontinuedDate,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('PRODUCT_DISCONTINUED')
        .build()
  };

  // Cart-related errors
  cart = {
    empty: (userId: string): TryError =>
      ErrorBuilder
        .create('EmptyCartError', 'Cart is empty')
        .withContextObject({ userId, ...this.requestContext })
        .userFacing(true)
        .code('CART_EMPTY')
        .build(),

    itemNotFound: (userId: string, productId: string): TryError =>
      ErrorBuilder
        .create('CartItemNotFoundError', 'Item not found in cart')
        .withContextObject({ userId, productId, ...this.requestContext })
        .userFacing(true)
        .code('CART_ITEM_NOT_FOUND')
        .build(),

    quantityExceeded: (productId: string, maxQuantity: number): TryError =>
      ErrorBuilder
        .create('QuantityExceededError', 'Quantity exceeds maximum allowed')
        .withContextObject({ 
          productId, 
          maxQuantity,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('QUANTITY_EXCEEDED')
        .build()
  };

  // Order-related errors
  order = {
    notFound: (orderId: string, userId?: string): TryError =>
      ErrorBuilder
        .create('OrderNotFoundError', 'Order not found')
        .withContextObject({ orderId, userId, ...this.requestContext })
        .userFacing(true)
        .code('ORDER_NOT_FOUND')
        .build(),

    cannotCancel: (orderId: string, status: string, reason: string): TryError =>
      ErrorBuilder
        .create('OrderCancellationError', 'Order cannot be cancelled')
        .withContextObject({ 
          orderId, 
          status, 
          reason,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('ORDER_CANNOT_CANCEL')
        .build(),

    paymentFailed: (orderId: string, paymentId: string, reason: string): TryError =>
      ErrorBuilder
        .create('OrderPaymentError', 'Order payment failed')
        .withContextObject({ 
          orderId, 
          paymentId, 
          reason,
          ...this.requestContext 
        })
        .severity('high')
        .userFacing(true)
        .retryable(true)
        .code('ORDER_PAYMENT_FAILED')
        .build(),

    shippingUnavailable: (orderId: string, address: string, reason: string): TryError =>
      ErrorBuilder
        .create('ShippingUnavailableError', 'Shipping not available to this address')
        .withContextObject({ 
          orderId, 
          address, 
          reason,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('SHIPPING_UNAVAILABLE')
        .build()
  };

  // Promotion-related errors
  promotion = {
    expired: (promoCode: string, expiredDate: string): TryError =>
      ErrorBuilder
        .create('PromotionExpiredError', 'Promotion code has expired')
        .withContextObject({ 
          promoCode, 
          expiredDate,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('PROMOTION_EXPIRED')
        .build(),

    notApplicable: (promoCode: string, reason: string): TryError =>
      ErrorBuilder
        .create('PromotionNotApplicableError', 'Promotion code is not applicable')
        .withContextObject({ 
          promoCode, 
          reason,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('PROMOTION_NOT_APPLICABLE')
        .build(),

    usageLimitReached: (promoCode: string, limit: number): TryError =>
      ErrorBuilder
        .create('PromotionUsageLimitError', 'Promotion usage limit reached')
        .withContextObject({ 
          promoCode, 
          limit,
          ...this.requestContext 
        })
        .userFacing(true)
        .code('PROMOTION_USAGE_LIMIT')
        .build()
  };
}

// Usage in services
class ProductService {
  private errorFactory = EcommerceErrorFactory.getInstance();

  async getProduct(productId: string, requestContext: Record<string, unknown>): Promise<TryResult<Product, TryError>> {
    this.errorFactory.withContext(requestContext);

    return tryAsync(async () => {
      const product = await this.repository.findById(productId);
      
      if (!product) {
        throw this.errorFactory.product.notFound(productId, product?.sku);
      }

      if (product.status === 'discontinued') {
        throw this.errorFactory.product.discontinued(productId, product.discontinuedDate);
      }

      return product;
    });
  }

  async checkAvailability(productId: string, quantity: number): Promise<TryResult<void, TryError>> {
    return tryAsync(async () => {
      const product = await this.repository.findById(productId);
      
      if (!product) {
        throw this.errorFactory.product.notFound(productId);
      }

      if (product.inventory < quantity) {
        throw this.errorFactory.product.outOfStock(
          productId,
          quantity,
          product.inventory
        );
      }
    });
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Factory Registry Pattern
              </h3>
              <CodeBlock
                language="typescript"
                title="Centralized Factory Registry"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Factory registry for managing multiple error factories
class ErrorFactoryRegistry {
  private static instance: ErrorFactoryRegistry;
  private factories: Map<string, any> = new Map();
  private globalContext: Record<string, unknown> = {};

  private constructor() {}

  static getInstance(): ErrorFactoryRegistry {
    if (!ErrorFactoryRegistry.instance) {
      ErrorFactoryRegistry.instance = new ErrorFactoryRegistry();
    }
    return ErrorFactoryRegistry.instance;
  }

  // Register a factory
  register<T>(name: string, factory: T): void {
    this.factories.set(name, factory);
  }

  // Get a factory
  get<T>(name: string): T {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(\`Factory '\${name}' not found\`);
    }
    return factory;
  }

  // Set global context that all factories can use
  setGlobalContext(context: Record<string, unknown>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  getGlobalContext(): Record<string, unknown> {
    return { ...this.globalContext };
  }

  // Create a factory with global context
  createWithContext<T extends { withContext: (ctx: any) => T }>(name: string): T {
    const factory = this.get<T>(name);
    return factory.withContext(this.globalContext);
  }
}

// Factory initialization
function initializeErrorFactories(): void {
  const registry = ErrorFactoryRegistry.getInstance();

  // Register domain-specific factories
  registry.register('ecommerce', EcommerceErrorFactory.getInstance());
  registry.register('user', new UserErrorFactory());
  registry.register('payment', new PaymentErrorFactory());

  // Set global context
  registry.setGlobalContext({
    service: 'api-server',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
}

// Factory provider for dependency injection
class ErrorFactoryProvider {
  private registry = ErrorFactoryRegistry.getInstance();

  constructor(private requestContext: Record<string, unknown> = {}) {}

  ecommerce(): EcommerceErrorFactory {
    return this.registry
      .createWithContext<EcommerceErrorFactory>('ecommerce')
      .withContext(this.requestContext);
  }

  user(): UserErrorFactory {
    return this.registry
      .createWithContext<UserErrorFactory>('user')
      .withContext(this.requestContext);
  }

  payment(): PaymentErrorFactory {
    return this.registry
      .createWithContext<PaymentErrorFactory>('payment')
      .withContext(this.requestContext);
  }
}

// Usage in Express middleware
function errorFactoryMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestContext = {
    requestId: req.headers['x-request-id'] || generateRequestId(),
    userId: req.user?.id,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  };

  // Attach factory provider to request
  req.errorFactory = new ErrorFactoryProvider(requestContext);
  next();
}

// Usage in controllers
class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    const { errorFactory } = req;
    
    try {
      const orderData = req.body;
      
      // Validate order data
      if (!orderData.items || orderData.items.length === 0) {
        const error = errorFactory.ecommerce().cart.empty(req.user.id);
        return res.status(400).json({ error: this.serializeError(error) });
      }

      // Process order
      const result = await this.orderService.createOrder(orderData);
      
      if (isTryError(result)) {
        const statusCode = this.getStatusCodeForError(result);
        return res.status(statusCode).json({ error: this.serializeError(result) });
      }

      res.status(201).json({ order: result });
    } catch (error) {
      const internalError = errorFactory.ecommerce().order.paymentFailed(
        'unknown',
        'unknown',
        'Unexpected error during order creation'
      );
      res.status(500).json({ error: this.serializeError(internalError) });
    }
  }

  private serializeError(error: TryError): Record<string, unknown> {
    return {
      type: error.type,
      message: error.message,
      code: error.context?.code,
      ...(error.context?.userFacing && { details: error.context })
    };
  }

  private getStatusCodeForError(error: TryError): number {
    const statusMap: Record<string, number> = {
      'ProductNotFoundError': 404,
      'OutOfStockError': 409,
      'CartEmptyError': 400,
      'OrderPaymentError': 402,
      'PromotionExpiredError': 400,
      'ShippingUnavailableError': 400
    };

    return statusMap[error.type] || 500;
  }
}

// Type augmentation for Express
declare global {
  namespace Express {
    interface Request {
      errorFactory: ErrorFactoryProvider;
    }
  }
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Advanced Patterns */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Advanced Factory Patterns
          </h2>

          <p className="text-slate-600 mb-4">
            Sophisticated patterns for complex error handling scenarios,
            including composable factories and dynamic error generation.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Composable Factory Pattern
              </h3>
              <CodeBlock
                language="typescript"
                title="Composable Error Factories"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Composable factory traits
interface ErrorFactoryTrait {
  name: string;
  apply(builder: ErrorBuilder): ErrorBuilder;
}

// Common traits
class TimestampTrait implements ErrorFactoryTrait {
  name = 'timestamp';
  
  apply(builder: ErrorBuilder): ErrorBuilder {
    return builder.withContext('timestamp', new Date().toISOString());
  }
}

class RequestContextTrait implements ErrorFactoryTrait {
  name = 'requestContext';
  
  constructor(private context: Record<string, unknown>) {}
  
  apply(builder: ErrorBuilder): ErrorBuilder {
    return builder.withContextObject(this.context);
  }
}

class SeverityTrait implements ErrorFactoryTrait {
  name = 'severity';
  
  constructor(private severity: 'low' | 'medium' | 'high' | 'critical') {}
  
  apply(builder: ErrorBuilder): ErrorBuilder {
    return builder.severity(this.severity);
  }
}

class UserFacingTrait implements ErrorFactoryTrait {
  name = 'userFacing';
  
  constructor(private isUserFacing: boolean = true) {}
  
  apply(builder: ErrorBuilder): ErrorBuilder {
    return builder.userFacing(this.isUserFacing);
  }
}

class RetryableTrait implements ErrorFactoryTrait {
  name = 'retryable';
  
  constructor(private canRetry: boolean = true) {}
  
  apply(builder: ErrorBuilder): ErrorBuilder {
    return builder.retryable(this.canRetry);
  }
}

// Composable factory
class ComposableErrorFactory {
  private traits: ErrorFactoryTrait[] = [];

  withTrait(trait: ErrorFactoryTrait): ComposableErrorFactory {
    this.traits.push(trait);
    return this;
  }

  withTraits(...traits: ErrorFactoryTrait[]): ComposableErrorFactory {
    this.traits.push(...traits);
    return this;
  }

  create(type: string, message: string, context: Record<string, unknown> = {}): TryError {
    let builder = ErrorBuilder.create(type, message).withContextObject(context);

    // Apply all traits
    for (const trait of this.traits) {
      builder = trait.apply(builder);
    }

    return builder.build();
  }

  // Convenience methods for common patterns
  createUserError(type: string, message: string, context: Record<string, unknown> = {}): TryError {
    return this.withTraits(
      new UserFacingTrait(true),
      new SeverityTrait('medium'),
      new TimestampTrait()
    ).create(type, message, context);
  }

  createSystemError(type: string, message: string, context: Record<string, unknown> = {}): TryError {
    return this.withTraits(
      new UserFacingTrait(false),
      new SeverityTrait('high'),
      new RetryableTrait(true),
      new TimestampTrait()
    ).create(type, message, context);
  }

  createCriticalError(type: string, message: string, context: Record<string, unknown> = {}): TryError {
    return this.withTraits(
      new SeverityTrait('critical'),
      new UserFacingTrait(false),
      new RetryableTrait(false),
      new TimestampTrait()
    ).create(type, message, context);
  }
}

// Factory composition for specific domains
class APIErrorFactory extends ComposableErrorFactory {
  constructor(requestContext: Record<string, unknown>) {
    super();
    this.withTraits(
      new RequestContextTrait(requestContext),
      new TimestampTrait()
    );
  }

  validationError(field: string, value: unknown, rule: string): TryError {
    return this.createUserError('ValidationError', \`Validation failed for field: \${field}\`, {
      field,
      value,
      rule
    });
  }

  authenticationError(reason: string): TryError {
    return this.createUserError('AuthenticationError', 'Authentication failed', {
      reason
    });
  }

  rateLimitError(limit: number, window: string): TryError {
    return this.withTrait(new RetryableTrait(true))
      .createUserError('RateLimitError', 'Rate limit exceeded', {
        limit,
        window,
        retryAfter: this.calculateRetryAfter(window)
      });
  }

  internalError(operation: string, originalError?: Error): TryError {
    return this.createCriticalError('InternalError', 'Internal server error', {
      operation,
      originalError: originalError?.message
    });
  }

  private calculateRetryAfter(window: string): number {
    // Simple calculation - in real implementation, this would be more sophisticated
    return window === '1m' ? 60 : window === '1h' ? 3600 : 300;
  }
}

// Usage
const requestContext = {
  requestId: 'req_123',
  userId: 'user_456',
  endpoint: '/api/users',
  method: 'POST'
};

const apiFactory = new APIErrorFactory(requestContext);

const validationError = apiFactory.validationError('email', 'invalid@', 'email_format');
const authError = apiFactory.authenticationError('invalid_token');
const rateLimitError = apiFactory.rateLimitError(100, '1h');
const internalError = apiFactory.internalError('user_creation', new Error('Database connection failed'));`}
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
                  • Create domain-specific factories for better organization
                </li>
                <li>• Use builder patterns for complex error construction</li>
                <li>
                  • Implement factory registries for centralized management
                </li>
                <li>• Include request context in error factories</li>
                <li>• Use traits/mixins for reusable error characteristics</li>
                <li>• Provide convenience methods for common error patterns</li>
                <li>• Document factory APIs and usage patterns</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Create overly complex factory hierarchies</li>
                <li>• Include sensitive data in factory default contexts</li>
                <li>• Make factories stateful without proper isolation</li>
                <li>
                  • Create factories that are tightly coupled to specific
                  implementations
                </li>
                <li>
                  • Ignore error factory performance in high-throughput
                  scenarios
                </li>
                <li>
                  • Mix factory patterns inconsistently across the codebase
                </li>
                <li>
                  • Create factories without clear ownership and responsibility
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips</h4>
              <ul className="space-y-1 text-yellow-700 text-sm">
                <li>
                  • Start with simple factories and evolve to complex patterns
                </li>
                <li>• Use TypeScript for better factory API type safety</li>
                <li>
                  • Consider factory caching for performance-critical paths
                </li>
                <li>
                  • Implement factory testing strategies and mock patterns
                </li>
                <li>
                  • Use factory composition over inheritance when possible
                </li>
                <li>• Create factory documentation with usage examples</li>
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
                Custom Errors
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about creating custom error types and hierarchies
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
                Error Creation API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Core functions for creating and working with TryError objects
              </p>
              <a
                href="/docs/api/errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error API →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
