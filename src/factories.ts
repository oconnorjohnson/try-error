/**
 * Generic error factories and domain-specific base types
 *
 * These utilities make it easier to create consistent, domain-specific
 * error types while maintaining all the benefits of the base TryError system.
 */

import { TryError } from "./types";
import { createError } from "./errors";

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
 * Creates a factory function for domain-specific errors
 *
 * This eliminates boilerplate when creating multiple error types in the same domain.
 * Each domain can have its own factory with consistent defaults.
 *
 * @param defaultFields - Default fields to include in all errors from this factory
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
 * });
 *
 * const error = createPaymentError("CardDeclined", "Card was declined", {
 *   transactionId: "tx_123",
 *   amount: 99.99
 * });
 * ```
 */
export function createErrorFactory<T extends string, E extends TryError<T>>(
  defaultFields?: Partial<Omit<E, keyof TryError>>
) {
  return function createDomainError(
    type: T,
    message: string,
    domainFields?: Partial<Omit<E, keyof TryError>>,
    options?: ErrorFactoryOptions
  ): E {
    return {
      ...createError({
        type,
        message,
        cause: options?.cause,
        context: options?.context,
      }),
      ...defaultFields,
      ...domainFields,
    } as E;
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
 * Pre-built factory for entity-related errors
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
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context,
    }),
    entityType,
    entityId,
  };
}

/**
 * Pre-built factory for amount-related errors
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
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context,
    }),
    amount,
    currency,
  };
}

/**
 * Pre-built factory for external service errors
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
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context,
    }),
    provider,
    statusCode: options?.statusCode,
    externalId: options?.externalId,
  };
}

/**
 * Pre-built factory for validation errors
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
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context,
    }),
    fields,
    code,
  };
}
