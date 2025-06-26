/**
 * Generic error factories and domain-specific base types
 *
 * These utilities make it easier to create consistent, domain-specific
 * error types while maintaining all the benefits of the base TryError system.
 */

import { TryError, serializeTryError } from "./types";
import { createError } from "./errors";

// Factory registry for discovery
const factoryRegistry = new Map<string, Function>();

// Factory cache to avoid recreation
const factoryCache = new WeakMap<Function, Map<string, TryError>>();

// ============================================================================
// GENERIC ERROR FACTORY BUILDER
// ============================================================================

/**
 * Options for error factory functions
 */
export interface ErrorFactoryOptions {
  cause?: unknown;
  context?: Record<string, unknown>;
}

/**
 * Validates required fields are present in domain fields
 */
function validateRequiredFields<T extends Record<string, any>>(
  fields: T,
  required: Array<keyof T>
): void {
  for (const field of required) {
    if (fields[field] === undefined || fields[field] === null) {
      throw new Error(`Required field '${String(field)}' is missing`);
    }
  }
}

/**
 * Creates a factory function for domain-specific errors
 *
 * This eliminates boilerplate when creating multiple error types in the same domain.
 * Each domain can have its own factory with consistent defaults.
 *
 * @param defaultFields - Default fields to include in all errors from this factory
 * @param requiredFields - Fields that must be provided when creating errors
 * @param factoryName - Optional name for registry
 * @returns A factory function for creating errors of type E
 *
 * @example
 * ```typescript
 * type PaymentErrorType = "CardDeclined" | "InsufficientFunds" | "ProcessingError";
 * interface PaymentError extends TryError<PaymentErrorType> {
 *   readonly transactionId: string;
 *   readonly amount: number;
 *   readonly provider: string;
 * }
 *
 * const createPaymentError = createErrorFactory<PaymentErrorType, PaymentError>({
 *   provider: "stripe" // Default for all payment errors
 * }, ["transactionId", "amount"]);
 *
 * const error = createPaymentError("CardDeclined", "Card was declined", {
 *   transactionId: "tx_123",
 *   amount: 99.99
 * });
 * ```
 */
export function createErrorFactory<T extends string, E extends TryError<T>>(
  defaultFields?: Partial<Omit<E, keyof TryError>>,
  requiredFields?: Array<keyof Omit<E, keyof TryError>>,
  factoryName?: string
) {
  const factory = function createDomainError(
    type: T,
    message: string,
    domainFields?: Partial<Omit<E, keyof TryError>>,
    options?: ErrorFactoryOptions
  ): E {
    // Validate required fields if specified
    if (requiredFields && domainFields) {
      validateRequiredFields(domainFields, requiredFields);
    }

    // Check cache
    const cacheKey = `${type}:${message}:${JSON.stringify(domainFields)}`;
    let cache = factoryCache.get(factory);
    if (!cache) {
      cache = new Map();
      factoryCache.set(factory, cache);
    }

    const cached = cache.get(cacheKey);
    if (cached) {
      return cached as E;
    }

    // Create the error
    const baseError = createError({
      type,
      message,
      cause: options?.cause,
      context: options?.context,
    });

    const error = {
      ...baseError,
      ...defaultFields,
      ...domainFields,
    } as E;

    // Cache the error
    cache.set(cacheKey, error);

    return error;
  };

  // Register factory if name provided
  if (factoryName) {
    factoryRegistry.set(factoryName, factory);
  }

  return factory;
}

/**
 * Get a registered factory by name
 */
export function getFactory(name: string): Function | undefined {
  return factoryRegistry.get(name);
}

/**
 * List all registered factory names
 */
export function listFactories(): string[] {
  return Array.from(factoryRegistry.keys());
}

/**
 * Compose multiple factories together
 *
 * @param factories - Array of factories to compose
 * @returns A new factory that applies all factory defaults
 *
 * @example
 * ```typescript
 * const baseApiFactory = createErrorFactory({ provider: "api" });
 * const authFactory = createErrorFactory({ authenticated: false });
 *
 * const composedFactory = composeFactories([baseApiFactory, authFactory]);
 * ```
 */
export function composeFactories<T extends string, E extends TryError<T>>(
  factories: Array<ReturnType<typeof createErrorFactory>>
): ReturnType<typeof createErrorFactory<T, E>> {
  return function composedFactory(
    type: T,
    message: string,
    domainFields?: Partial<Omit<E, keyof TryError>>,
    options?: ErrorFactoryOptions
  ): E {
    let result = {} as E;

    // Apply each factory in order
    for (const factory of factories) {
      const partial = factory(type, message, domainFields, options);
      result = { ...result, ...partial };
    }

    return result;
  };
}

/**
 * Create a serializable version of domain-specific errors
 *
 * @param error - The domain-specific error to serialize
 * @returns A JSON-safe object with all fields
 *
 * @example
 * ```typescript
 * const error = createPaymentError("CardDeclined", "Card declined", {
 *   transactionId: "tx_123",
 *   amount: 99.99
 * });
 *
 * const serialized = serializeDomainError(error);
 * // Includes all domain-specific fields in addition to base fields
 * ```
 */
export function serializeDomainError<E extends TryError>(
  error: E
): Record<string, unknown> {
  // Get base serialization
  const base = serializeTryError(error);

  // Add all domain-specific fields
  const domainFields: Record<string, unknown> = {};

  for (const key in error) {
    if (error.hasOwnProperty(key) && !(key in base)) {
      domainFields[key] = error[key];
    }
  }

  return {
    ...base,
    ...domainFields,
  };
}

// ============================================================================
// DOMAIN-SPECIFIC BASE TYPES
// ============================================================================

/**
 * Base type for errors related to specific entities (users, orders, products, etc.)
 *
 * Provides consistent fields for entity-related errors across different domains.
 *
 * @example
 * ```typescript
 * interface UserError extends EntityError<"UserNotFound" | "UserSuspended", "user"> {
 *   readonly accountStatus?: string;
 * }
 *
 * const error: UserError = {
 *   ...createError({ type: "UserNotFound", message: "User not found" }),
 *   entityId: "user_123",
 *   entityType: "user",
 *   accountStatus: "active"
 * };
 * ```
 */
export interface EntityError<
  T extends string,
  EntityType extends string = string
> extends TryError<T> {
  /**
   * The ID of the entity that caused the error
   */
  readonly entityId: string;

  /**
   * The type of entity (user, order, product, etc.)
   */
  readonly entityType: EntityType;
}

/**
 * Base type for errors involving monetary amounts (payments, billing, etc.)
 *
 * Provides consistent fields for financial operations across different domains.
 *
 * @example
 * ```typescript
 * interface PaymentError extends AmountError<"CardDeclined" | "InsufficientFunds"> {
 *   readonly transactionId: string;
 * }
 *
 * const error: PaymentError = {
 *   ...createError({ type: "CardDeclined", message: "Card was declined" }),
 *   amount: 99.99,
 *   currency: "USD",
 *   transactionId: "tx_123"
 * };
 * ```
 */
export interface AmountError<T extends string> extends TryError<T> {
  /**
   * The monetary amount involved in the error
   */
  readonly amount: number;

  /**
   * The currency code (ISO 4217)
   */
  readonly currency: string;
}

/**
 * Base type for errors from external services (APIs, third-party services, etc.)
 *
 * Provides consistent fields for external service errors across different integrations.
 *
 * @example
 * ```typescript
 * interface ApiError extends ExternalError<"NetworkError" | "AuthError" | "RateLimited"> {
 *   readonly endpoint: string;
 * }
 *
 * const error: ApiError = {
 *   ...createError({ type: "RateLimited", message: "Rate limit exceeded" }),
 *   provider: "stripe",
 *   externalId: "req_123",
 *   statusCode: 429,
 *   endpoint: "/v1/charges"
 * };
 * ```
 */
export interface ExternalError<T extends string> extends TryError<T> {
  /**
   * The name of the external service/provider
   */
  readonly provider: string;

  /**
   * External reference ID (request ID, transaction ID, etc.)
   */
  readonly externalId?: string;

  /**
   * HTTP status code or equivalent error code
   */
  readonly statusCode?: number;
}

/**
 * Base type for validation errors with field-level details
 *
 * Provides a consistent structure for validation errors across different forms/inputs.
 *
 * @example
 * ```typescript
 * interface FormValidationError extends ValidationError<"FormValidation"> {
 *   readonly formId: string;
 * }
 *
 * const error: FormValidationError = {
 *   ...createError({ type: "FormValidation", message: "Form validation failed" }),
 *   fields: {
 *     email: ["Must be a valid email address"],
 *     password: ["Must be at least 8 characters", "Must contain a number"]
 *   },
 *   code: "FORM_VALIDATION_ERROR",
 *   formId: "user-signup"
 * };
 * ```
 */
export interface ValidationError<T extends string> extends TryError<T> {
  /**
   * Field-level validation errors
   * Key is the field name, value is array of error messages for that field
   */
  readonly fields: Record<string, string[]>;

  /**
   * Validation error code for programmatic handling
   */
  readonly code: string;
}

// ============================================================================
// ERROR CHAINING UTILITIES
// ============================================================================

/**
 * Chain errors while preserving the original error context
 *
 * Useful for wrapping lower-level errors with higher-level context
 * while maintaining the full error chain for debugging.
 *
 * @param originalError - The original error to chain from
 * @param newType - The type for the new error
 * @param newMessage - The message for the new error
 * @param additionalFields - Additional domain-specific fields
 * @returns A new error with the original error as the cause
 *
 * @example
 * ```typescript
 * const dbError = trySync(() => database.query("SELECT * FROM users"));
 * if (isErr(dbError)) {
 *   return chainError(dbError, "UserServiceError", "Failed to fetch user data", {
 *     operation: "getUserById",
 *     userId: "123"
 *   });
 * }
 * ```
 */
export function chainError<T extends string, E extends TryError<T>>(
  originalError: TryError,
  newType: T,
  newMessage: string,
  additionalFields?: Partial<Omit<E, keyof TryError>>
): E {
  return {
    ...createError({
      type: newType,
      message: newMessage,
      cause: originalError,
      context: {
        ...originalError.context,
        chainedFrom: originalError.type,
      },
    }),
    ...additionalFields,
  } as E;
}

/**
 * Wrap an error with additional context while preserving the original type
 *
 * Useful for adding context to an error without changing its type,
 * such as adding request IDs or user context.
 *
 * @param error - The original error
 * @param additionalContext - Additional context to merge
 * @returns The same error with additional context
 *
 * @example
 * ```typescript
 * const error = createError({ type: "ValidationError", message: "Invalid input" });
 * const contextualError = wrapWithContext(error, {
 *   requestId: "req_123",
 *   userId: "user_456"
 * });
 * ```
 */
export function wrapWithContext<E extends TryError>(
  error: E,
  additionalContext: Record<string, unknown>
): E {
  return {
    ...error,
    context: {
      ...error.context,
      ...additionalContext,
    },
  };
}

// ============================================================================
// CONVENIENCE FACTORIES FOR COMMON PATTERNS
// ============================================================================

/**
 * Pre-built factory for entity-related errors with validation
 *
 * @example
 * ```typescript
 * const userError = createEntityError("user", "user_123", "UserNotFound", "User not found");
 * const orderError = createEntityError("order", "order_456", "OrderCancelled", "Order was cancelled");
 * ```
 */
export function createEntityError<T extends string>(
  entityType: string,
  entityId: string,
  errorType: T,
  message: string,
  options?: ErrorFactoryOptions
): EntityError<T> {
  // Validate required fields
  if (!entityType || !entityId) {
    throw new Error("entityType and entityId are required for entity errors");
  }

  const baseError = createError({
    type: errorType,
    message,
    cause: options?.cause,
    context: options?.context,
  });

  return {
    ...baseError,
    entityType,
    entityId,
  };
}

/**
 * Pre-built factory for amount-related errors with validation
 *
 * @example
 * ```typescript
 * const paymentError = createAmountError(99.99, "USD", "InsufficientFunds", "Insufficient funds");
 * ```
 */
export function createAmountError<T extends string>(
  amount: number,
  currency: string,
  errorType: T,
  message: string,
  options?: ErrorFactoryOptions
): AmountError<T> {
  // Validate required fields
  if (typeof amount !== "number" || !currency) {
    throw new Error(
      "amount (number) and currency are required for amount errors"
    );
  }

  const baseError = createError({
    type: errorType,
    message,
    cause: options?.cause,
    context: options?.context,
  });

  return {
    ...baseError,
    amount,
    currency,
  };
}

/**
 * Pre-built factory for external service errors with validation
 *
 * @example
 * ```typescript
 * const apiError = createExternalError("stripe", "NetworkError", "Connection failed", {
 *   statusCode: 500,
 *   externalId: "req_123"
 * });
 * ```
 */
export function createExternalError<T extends string>(
  provider: string,
  errorType: T,
  message: string,
  options?: ErrorFactoryOptions & {
    statusCode?: number;
    externalId?: string;
  }
): ExternalError<T> {
  // Validate required fields
  if (!provider) {
    throw new Error("provider is required for external errors");
  }

  const baseError = createError({
    type: errorType,
    message,
    cause: options?.cause,
    context: options?.context,
  });

  return {
    ...baseError,
    provider,
    statusCode: options?.statusCode,
    externalId: options?.externalId,
  };
}

/**
 * Pre-built factory for validation errors with field validation
 *
 * @example
 * ```typescript
 * const validationError = createValidationError("FormValidation", "Form validation failed", {
 *   email: ["Must be a valid email"],
 *   password: ["Must be at least 8 characters"]
 * }, "FORM_VALIDATION_ERROR");
 * ```
 */
export function createValidationError<T extends string>(
  errorType: T,
  message: string,
  fields: Record<string, string[]>,
  code: string,
  options?: ErrorFactoryOptions
): ValidationError<T> {
  // Validate required fields
  if (!fields || typeof fields !== "object" || !code) {
    throw new Error(
      "fields (object) and code are required for validation errors"
    );
  }

  // Validate field structure
  for (const [field, errors] of Object.entries(fields)) {
    if (!Array.isArray(errors)) {
      throw new Error(`Field '${field}' must have an array of error messages`);
    }
  }

  const baseError = createError({
    type: errorType,
    message,
    cause: options?.cause,
    context: options?.context,
  });

  return {
    ...baseError,
    fields,
    code,
  };
}

// ============================================================================
// IMPROVED ERGONOMIC FACTORIES WITH BETTER PARAMETER ORDERS
// ============================================================================

/**
 * IMPROVED: More intuitive validation error factory
 *
 * Common usage pattern with field and message as primary parameters
 *
 * @example
 * ```typescript
 * const error = validationError('email', 'invalid', 'Must be a valid email address', {
 *   value: 'invalid-email',
 *   pattern: /^\S+@\S+\.\S+$/
 * });
 * ```
 */
export function validationError<T extends string = "ValidationError">(
  field: string,
  code: string,
  message: string,
  context?: Record<string, unknown>
): ValidationError<T> {
  return createValidationError(
    "ValidationError" as T,
    message,
    { [field]: [message] },
    code,
    { context }
  );
}

/**
 * IMPROVED: More intuitive amount error factory
 *
 * @example
 * ```typescript
 * const error = amountError(150, 100, 'insufficient', 'Insufficient funds available');
 * ```
 */
export function amountError<T extends string = "AmountError">(
  requestedAmount: number,
  availableAmount: number,
  errorCode: string,
  message: string,
  currency: string = "USD"
): AmountError<T> {
  return createAmountError(
    requestedAmount,
    currency,
    "AmountError" as T,
    message,
    {
      context: {
        requestedAmount,
        availableAmount,
        errorCode,
      },
    }
  );
}

/**
 * IMPROVED: More intuitive external service error factory
 *
 * @example
 * ```typescript
 * const error = externalError('API', 'failed', 'Service unavailable', {
 *   transactionId: 'tx_123',
 *   statusCode: 503
 * });
 * ```
 */
export function externalError<T extends string = "ExternalError">(
  service: string,
  operation: string,
  message: string,
  context?: Record<string, unknown> & {
    statusCode?: number;
    externalId?: string;
  }
): ExternalError<T> {
  return createExternalError(service, "ExternalError" as T, message, {
    statusCode: context?.statusCode,
    externalId: context?.externalId,
    context: {
      operation,
      ...context,
    },
  });
}

/**
 * IMPROVED: Quick entity error factory
 *
 * @example
 * ```typescript
 * const error = entityError('user', 'user_123', 'User not found');
 * ```
 */
export function entityError<T extends string = "EntityError">(
  entityType: string,
  entityId: string,
  message: string,
  context?: Record<string, unknown>
): EntityError<T> {
  return createEntityError(entityType, entityId, "EntityError" as T, message, {
    context,
  });
}

/**
 * IMPROVED: Multi-field validation error factory
 *
 * @example
 * ```typescript
 * const error = fieldValidationError({
 *   email: ['Must be a valid email address'],
 *   password: ['Must be at least 8 characters', 'Must contain a number']
 * }, 'FORM_VALIDATION_ERROR');
 * ```
 */
export function fieldValidationError<T extends string = "ValidationError">(
  fields: Record<string, string[]>,
  code: string = "VALIDATION_ERROR",
  message?: string
): ValidationError<T> {
  const fieldCount = Object.keys(fields).length;
  const defaultMessage =
    message ||
    `Validation failed for ${fieldCount} field${fieldCount === 1 ? "" : "s"}`;

  return createValidationError(
    "ValidationError" as T,
    defaultMessage,
    fields,
    code
  );
}
