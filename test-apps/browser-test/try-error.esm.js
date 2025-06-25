var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/errors.ts
var errors_exports = {};
__export(errors_exports, {
  createError: () => createError,
  fromThrown: () => fromThrown,
  wrapError: () => wrapError
});
function isProduction() {
  if (typeof process !== "undefined" && process.env) {
    return false;
  }
  return true;
}
function getSourceLocation(stackOffset = 2) {
  try {
    const stack = new Error().stack;
    if (!stack) return "unknown";
    const lines = stack.split("\n");
    const targetLine = lines[stackOffset];
    if (!targetLine) return "unknown";
    const chromeMatch = targetLine.match(/\s+at\s+.*?\((.+):(\d+):(\d+)\)/);
    if (chromeMatch && chromeMatch[1]) {
      const [, file, line, column] = chromeMatch;
      return `${file.split("/").pop()}:${line}:${column}`;
    }
    const nodeMatch = targetLine.match(/\s+at\s+(.+):(\d+):(\d+)/);
    if (nodeMatch && nodeMatch[1]) {
      const [, file, line, column] = nodeMatch;
      return `${file.split("/").pop()}:${line}:${column}`;
    }
    const firefoxMatch = targetLine.match(/(.+)@(.+):(\d+):(\d+)/);
    if (firefoxMatch && firefoxMatch[2]) {
      const [, , file, line, column] = firefoxMatch;
      return `${file.split("/").pop()}:${line}:${column}`;
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}
function createError(options) {
  const source = options.source ?? getSourceLocation(3);
  const timestamp = options.timestamp ?? Date.now();
  let stack;
  if (!isProduction()) {
    try {
      const error = new Error(options.message);
      stack = error.stack;
    } catch {
    }
  }
  return {
    type: options.type,
    message: options.message,
    source,
    timestamp,
    stack,
    context: options.context,
    cause: options.cause
  };
}
function wrapError(type, cause, message, context) {
  let errorMessage = message;
  if (!errorMessage) {
    if (cause instanceof Error) {
      errorMessage = cause.message;
    } else if (typeof cause === "string") {
      errorMessage = cause;
    } else {
      errorMessage = "Unknown error occurred";
    }
  }
  return createError({
    type,
    message: errorMessage,
    cause,
    context
  });
}
function fromThrown(cause, context) {
  if (cause instanceof TypeError) {
    return wrapError("TypeError", cause, void 0, context);
  }
  if (cause instanceof ReferenceError) {
    return wrapError("ReferenceError", cause, void 0, context);
  }
  if (cause instanceof SyntaxError) {
    return wrapError("SyntaxError", cause, void 0, context);
  }
  if (cause instanceof Error) {
    return wrapError("Error", cause, void 0, context);
  }
  if (typeof cause === "string") {
    return wrapError("StringError", cause, cause, context);
  }
  return wrapError("UnknownError", cause, "An unknown error occurred", context);
}
var init_errors = __esm({
  "src/errors.ts"() {
    "use strict";
  }
});

// src/types.ts
function isTryError(value) {
  return typeof value === "object" && value !== null && "type" in value && "message" in value && "source" in value && "timestamp" in value && typeof value.type === "string" && typeof value.message === "string" && typeof value.source === "string" && typeof value.timestamp === "number";
}
function isTrySuccess(result) {
  return !isTryError(result);
}
function isTryFailure(result) {
  return isTryError(result);
}
function matchTryResult(result, handlers) {
  if (isTryError(result)) {
    return handlers.error(result);
  }
  return handlers.success(result);
}
function unwrapTryResult(result) {
  if (isTryError(result)) {
    return { success: false, error: result };
  }
  return { success: true, data: result };
}

// src/index.ts
init_errors();

// src/config.ts
var globalConfig = null;
var ConfigPresets = {
  /**
   * Development configuration with full debugging features
   */
  development: () => ({
    captureStackTrace: true,
    stackTraceLimit: 50,
    includeSource: true,
    developmentMode: true,
    onError: (error) => {
      if (typeof console !== "undefined") {
        console.group(`\u{1F6A8} TryError: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Source:", error.source);
        console.error("Context:", error.context);
        if (error.stack) console.error("Stack:", error.stack);
        console.groupEnd();
      }
      return error;
    }
  }),
  /**
   * Production configuration optimized for performance
   */
  production: () => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: false,
    developmentMode: false,
    serializer: (error) => ({
      type: error.type,
      message: error.message,
      timestamp: error.timestamp
      // Don't include sensitive information in production
    }),
    onError: (error) => {
      if (typeof console !== "undefined") {
        console.error(`Error: ${error.type} - ${error.message}`);
      }
      return error;
    }
  }),
  /**
   * Testing configuration with assertion-friendly features
   */
  test: () => ({
    captureStackTrace: true,
    stackTraceLimit: 10,
    includeSource: true,
    developmentMode: true,
    serializer: (error) => ({
      type: error.type,
      message: error.message,
      context: error.context,
      source: error.source
    })
  }),
  /**
   * High-performance configuration for critical paths
   */
  performance: () => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: false,
    developmentMode: false,
    performance: {
      errorCreation: {
        cacheConstructors: true,
        lazyStackTrace: true,
        objectPooling: true,
        poolSize: 100
      },
      contextCapture: {
        maxContextSize: 1024 * 5,
        // 5KB
        deepClone: false,
        timeout: 50
      },
      memory: {
        maxErrorHistory: 50,
        useWeakRefs: true,
        gcHints: true
      }
    }
  })
};
function configure(config) {
  if (typeof config === "string") {
    globalConfig = ConfigPresets[config]();
  } else {
    globalConfig = { ...globalConfig, ...config };
  }
}
function getConfig() {
  return globalConfig || {
    captureStackTrace: typeof process !== "undefined" ? true : true,
    stackTraceLimit: 10,
    includeSource: true,
    defaultErrorType: "Error",
    developmentMode: false
  };
}
function resetConfig() {
  globalConfig = null;
}
function createScope(config) {
  const scopedConfig = { ...getConfig(), ...config };
  return {
    config: scopedConfig,
    createError: (options) => {
      return Promise.resolve().then(() => (init_errors(), errors_exports)).then(
        ({ createError: createError2 }) => createError2({
          type: scopedConfig.defaultErrorType || "Error",
          ...options
        })
      );
    }
  };
}
function createEnvConfig(configs) {
  const env = typeof process !== "undefined" ? "development" : "development";
  return configs[env] || configs.development || {};
}
var Performance = {
  /**
   * Measure error creation performance
   */
  measureErrorCreation: (iterations = 1e3) => {
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    for (let i = 0; i < iterations; i++) {
      Promise.resolve().then(() => (init_errors(), errors_exports)).then(
        ({ createError: createError2 }) => createError2({
          type: "TestError",
          message: "Performance test",
          context: { iteration: i }
        })
      );
    }
    const end = typeof performance !== "undefined" ? performance.now() : Date.now();
    return {
      totalTime: end - start,
      averageTime: (end - start) / iterations,
      iterations
    };
  },
  /**
   * Get memory usage information (Node.js only)
   */
  getMemoryUsage: () => {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  }
};

// src/sync.ts
init_errors();
function trySync(fn, options) {
  try {
    return fn();
  } catch (error) {
    if (options?.errorType) {
      return {
        type: options.errorType,
        message: options.message || (error instanceof Error ? error.message : "Operation failed"),
        source: "unknown",
        // Will be set by createError if needed
        timestamp: Date.now(),
        cause: error,
        context: options.context
      };
    }
    return fromThrown(error, options?.context);
  }
}
function trySyncTuple(fn, options) {
  const result = trySync(fn, options);
  if (isTryError(result)) {
    return [null, result];
  }
  return [result, null];
}
function tryCall(fn, optionsOrFirstArg, ...restArgs) {
  const isOptionsObject = optionsOrFirstArg !== null && typeof optionsOrFirstArg === "object" && !Array.isArray(optionsOrFirstArg) && ("errorType" in optionsOrFirstArg || "context" in optionsOrFirstArg || "message" in optionsOrFirstArg);
  if (isOptionsObject) {
    const options = optionsOrFirstArg;
    return trySync(() => fn(...restArgs), options);
  } else {
    const allArgs = [optionsOrFirstArg, ...restArgs];
    return trySync(() => fn(...allArgs));
  }
}
function tryMap(result, mapper) {
  if (isTryError(result)) {
    return result;
  }
  return trySync(() => mapper(result));
}
function tryChain(result, chainer) {
  if (isTryError(result)) {
    return result;
  }
  return chainer(result);
}
function unwrap(result, message) {
  if (isTryError(result)) {
    const error = new Error(message || result.message);
    error.cause = result;
    throw error;
  }
  return result;
}
function unwrapOr(result, defaultValue) {
  if (isTryError(result)) {
    return defaultValue;
  }
  return result;
}
function unwrapOrElse(result, defaultFn) {
  if (isTryError(result)) {
    return defaultFn(result);
  }
  return result;
}
function isOk(result) {
  return !isTryError(result);
}
function isErr(result) {
  return isTryError(result);
}
function tryAll(results) {
  const values = [];
  for (const result of results) {
    if (isTryError(result)) {
      return result;
    }
    values.push(result);
  }
  return values;
}
function tryAny(attempts) {
  let lastError = null;
  for (const attempt of attempts) {
    const result = attempt();
    if (!isTryError(result)) {
      return result;
    }
    lastError = result;
  }
  return lastError || fromThrown("All attempts failed");
}

// src/async.ts
init_errors();
async function tryAsync(fn, options) {
  try {
    let promise = fn();
    if (options?.timeout) {
      promise = Promise.race([
        promise,
        new Promise(
          (_, reject) => setTimeout(
            () => reject(
              new Error(`Operation timed out after ${options.timeout}ms`)
            ),
            options.timeout
          )
        )
      ]);
    }
    const result = await promise;
    return result;
  } catch (error) {
    if (options?.errorType) {
      return {
        type: options.errorType,
        message: options.message || (error instanceof Error ? error.message : "Async operation failed"),
        source: "unknown",
        // Will be set by createError if needed
        timestamp: Date.now(),
        cause: error,
        context: options.context
      };
    }
    return fromThrown(error, options?.context);
  }
}
async function tryAsyncTuple(fn, options) {
  const result = await tryAsync(fn, options);
  if (isTryError(result)) {
    return [null, result];
  }
  return [result, null];
}
async function tryAwait(promise, options) {
  return tryAsync(() => promise, options);
}
async function tryMapAsync(resultPromise, mapper) {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }
  return tryAsync(() => mapper(result));
}
async function tryMap2(resultPromise, mapper) {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }
  try {
    return mapper(result);
  } catch (error) {
    return fromThrown(error);
  }
}
async function tryChainAsync(resultPromise, chainer) {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }
  return chainer(result);
}
async function tryChain2(resultPromise, chainer) {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }
  return chainer(result);
}
async function tryAllAsync(resultPromises) {
  const results = await Promise.all(resultPromises);
  const values = [];
  for (const result of results) {
    if (isTryError(result)) {
      return result;
    }
    values.push(result);
  }
  return values;
}
async function tryAnyAsync(attemptPromises) {
  const results = await Promise.allSettled(attemptPromises);
  let lastError = null;
  for (const settled of results) {
    if (settled.status === "fulfilled") {
      const result = settled.value;
      if (!isTryError(result)) {
        return result;
      }
      lastError = result;
    } else {
      lastError = fromThrown(settled.reason);
    }
  }
  return lastError || fromThrown("All async attempts failed");
}
async function tryAnySequential(attemptFns) {
  let lastError = null;
  for (const attemptFn of attemptFns) {
    try {
      const result = await attemptFn();
      if (!isTryError(result)) {
        return result;
      }
      lastError = result;
    } catch (error) {
      lastError = fromThrown(error);
    }
  }
  return lastError || fromThrown("All sequential attempts failed");
}
async function withTimeout(resultPromise, timeoutMs, timeoutMessage) {
  const timeoutPromise = new Promise(
    (resolve) => setTimeout(() => {
      resolve(
        fromThrown(
          new Error(
            timeoutMessage || `Operation timed out after ${timeoutMs}ms`
          )
        )
      );
    }, timeoutMs)
  );
  return Promise.race([resultPromise, timeoutPromise]);
}
async function retry(fn, options) {
  const {
    attempts,
    baseDelay = 1e3,
    maxDelay = 3e4,
    backoffFactor = 2,
    shouldRetry = () => true
  } = options;
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn();
      if (!isTryError(result)) {
        return result;
      }
      lastError = result;
      if (attempt < attempts && shouldRetry(result, attempt)) {
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      break;
    } catch (error) {
      lastError = fromThrown(error);
      if (attempt < attempts && shouldRetry(lastError, attempt)) {
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }
  return lastError || fromThrown("Retry failed");
}

// src/factories.ts
init_errors();
function createErrorFactory(defaultFields) {
  return function createDomainError(type, message, domainFields, options) {
    return {
      ...createError({
        type,
        message,
        cause: options?.cause,
        context: options?.context
      }),
      ...defaultFields,
      ...domainFields
    };
  };
}
function chainError(originalError, newType, newMessage, additionalFields) {
  return {
    ...createError({
      type: newType,
      message: newMessage,
      cause: originalError,
      context: {
        ...originalError.context,
        chainedFrom: originalError.type
      }
    }),
    ...additionalFields
  };
}
function wrapWithContext(error, additionalContext) {
  return {
    ...error,
    context: {
      ...error.context,
      ...additionalContext
    }
  };
}
function createEntityError(entityType, entityId, errorType, message, options) {
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context
    }),
    entityType,
    entityId
  };
}
function createAmountError(amount, currency, errorType, message, options) {
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context
    }),
    amount,
    currency
  };
}
function createExternalError(provider, errorType, message, options) {
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context
    }),
    provider,
    statusCode: options?.statusCode,
    externalId: options?.externalId
  };
}
function createValidationError(errorType, message, fields, code, options) {
  return {
    ...createError({
      type: errorType,
      message,
      cause: options?.cause,
      context: options?.context
    }),
    fields,
    code
  };
}
function validationError(field, code, message, context) {
  return createValidationError(
    "ValidationError",
    message,
    { [field]: [message] },
    code,
    { context }
  );
}
function amountError(requestedAmount, availableAmount, errorCode, message, currency = "USD") {
  return createAmountError(
    requestedAmount,
    currency,
    "AmountError",
    message,
    {
      context: {
        requestedAmount,
        availableAmount,
        errorCode
      }
    }
  );
}
function externalError(service, operation, message, context) {
  return createExternalError(service, "ExternalError", message, {
    statusCode: context?.statusCode,
    externalId: context?.externalId,
    context: {
      operation,
      ...context
    }
  });
}
function entityError(entityType, entityId, message, context) {
  return createEntityError(entityType, entityId, "EntityError", message, {
    context
  });
}
function fieldValidationError(fields, code = "VALIDATION_ERROR", message) {
  const fieldCount = Object.keys(fields).length;
  const defaultMessage = message || `Validation failed for ${fieldCount} field${fieldCount === 1 ? "" : "s"}`;
  return createValidationError(
    "ValidationError",
    defaultMessage,
    fields,
    code
  );
}

// src/utils.ts
function createEnhancedError(type, message, options = {}) {
  const context = {
    ...options.context,
    ...options.tags && { tags: options.tags }
  };
  return {
    type,
    message: options.message || message,
    source: "unknown",
    // Will be set by createError if needed
    timestamp: Date.now(),
    context: Object.keys(context).length > 0 ? context : void 0,
    stack: options.includeStack !== false && true ? new Error().stack : void 0
  };
}
function isErrorOfType(value, errorType) {
  return isTryError(value) && value.type === errorType;
}
function isErrorOfTypes(value, errorTypes) {
  return isTryError(value) && errorTypes.includes(value.type);
}
function getErrorMessage(value, fallback = "Unknown error") {
  if (isTryError(value)) {
    return value.message;
  }
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === "string") {
    return value;
  }
  return fallback;
}
function getErrorContext(error, key) {
  return error.context?.[key];
}
function hasErrorContext(error, key) {
  return error.context !== void 0 && key in error.context;
}
function transformResult(result, transform) {
  if (isTryError(result)) {
    return result;
  }
  return transform(result);
}
function withDefault(result, defaultValue) {
  return isTryError(result) ? defaultValue : result;
}
function withDefaultFn(result, getDefault) {
  return isTryError(result) ? getDefault(result) : result;
}
function filterSuccess(results) {
  return results.filter((result) => !isTryError(result));
}
function filterErrors(results) {
  return results.filter((result) => isTryError(result));
}
function partitionResults(results) {
  const successes = [];
  const errors = [];
  for (const result of results) {
    if (isTryError(result)) {
      errors.push(result);
    } else {
      successes.push(result);
    }
  }
  return [successes, errors];
}
function combineErrors(errors, type, message) {
  return createEnhancedError(type, message, {
    context: {
      errorCount: errors.length,
      errors: errors.map((error) => ({
        type: error.type,
        message: error.message,
        source: error.source
      }))
    }
  });
}
function getErrorSummary(errors) {
  const summary = {};
  for (const error of errors) {
    summary[error.type] = (summary[error.type] || 0) + 1;
  }
  return summary;
}
function formatErrorForLogging(error, includeStack = false) {
  const parts = [
    `[${error.type}] ${error.message}`,
    `Source: ${error.source}`,
    `Timestamp: ${new Date(error.timestamp).toISOString()}`
  ];
  if (error.context) {
    parts.push(`Context: ${JSON.stringify(error.context, null, 2)}`);
  }
  if (error.cause) {
    parts.push(`Cause: ${error.cause}`);
  }
  if (includeStack && error.stack) {
    parts.push(`Stack: ${error.stack}`);
  }
  return parts.join("\n");
}
function createErrorReport(errors) {
  if (errors.length === 0) {
    return "No errors to report";
  }
  const summary = getErrorSummary(errors);
  const summaryText = Object.entries(summary).map(([type, count]) => `${type}: ${count}`).join(", ");
  const report = [
    `Error Report (${errors.length} total errors)`,
    `Summary: ${summaryText}`,
    "",
    "Details:",
    ...errors.map(
      (error, index) => `${index + 1}. [${error.type}] ${error.message} (${error.source})`
    )
  ];
  return report.join("\n");
}
export {
  ConfigPresets,
  Performance,
  amountError,
  chainError,
  combineErrors,
  configure,
  createAmountError,
  createEnhancedError,
  createEntityError,
  createEnvConfig,
  createError,
  createErrorFactory,
  createErrorReport,
  createExternalError,
  createScope,
  createValidationError,
  entityError,
  externalError,
  fieldValidationError,
  filterErrors,
  filterSuccess,
  formatErrorForLogging,
  fromThrown,
  getConfig,
  getErrorContext,
  getErrorMessage,
  getErrorSummary,
  hasErrorContext,
  isErr,
  isErrorOfType,
  isErrorOfTypes,
  isOk,
  isTryError,
  isTryFailure,
  isTrySuccess,
  matchTryResult,
  partitionResults,
  resetConfig,
  retry,
  transformResult,
  trySync as try$,
  tryAsync as try$$,
  tryAll,
  tryAllAsync,
  tryAny,
  tryAnyAsync,
  tryAnySequential,
  tryAsync,
  tryChain2 as tryAsyncChain,
  tryMap2 as tryAsyncMap,
  tryAsyncTuple,
  tryAwait,
  tryCall,
  tryChainAsync,
  tryMapAsync,
  trySync,
  tryChain as trySyncChain,
  tryMap as trySyncMap,
  trySyncTuple,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  unwrapTryResult,
  validationError,
  withDefault,
  withDefaultFn,
  withTimeout,
  wrapError,
  wrapWithContext
};
