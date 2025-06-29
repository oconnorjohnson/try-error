# try-error Architecture

## Module Organization


### async
- **Files**: 2
- **Purpose**: Asynchronous error handling utilities
- **Key Functions**: tryAwait, tryAnyAsync, withTimeout, createRateLimiter, setProgress


### core
- **Files**: 10
- **Purpose**: Core error creation and handling functionality
- **Key Functions**: setFlag, clearFlag, hasFlag, toggleFlag, setFlags


### config
- **Files**: 1
- **Purpose**: Configuration management
- **Key Functions**: getConfigVersion, validateConfig, configure, getConfig, resetConfig


### errors
- **Files**: 1
- **Purpose**: Error types and creation functions
- **Key Functions**: invalidateEnvironmentCache, getCachedConfig, isProduction, detectEnvironmentAndRuntime, detectEnvironment


### middleware
- **Files**: 1
- **Purpose**: Middleware system for error processing
- **Key Functions**: compose, filterMiddleware, rateLimitMiddleware, next, dispatch


### sync
- **Files**: 2
- **Purpose**: Synchronous error handling utilities
- **Key Functions**: createTryError, unwrap, unwrapOr, isOk, isErr


### types
- **Files**: 1
- **Purpose**: TypeScript type definitions
- **Key Functions**: isTryError, isTrySuccess, unwrapTryResult, serializeTryError, deserializeTryError


### utils
- **Files**: 1
- **Purpose**: Utility functions and helpers
- **Key Functions**: createEnhancedError, isErrorOfType, isErrorOfTypes, getErrorMessage, getErrorContext


### react
- **Files**: 30
- **Purpose**: React-specific hooks and components
- **Key Functions**: SimpleCounter, increment, decrement, reset, TupleExample


## Dependency Graph

```
core
  ├── errors
  ├── types  
  └── utils
middleware
  └── core
async
  └── core
react
  ├── core
  └── types
```


## Event System

The library uses an event-driven architecture for lifecycle hooks:

- **Error Creation**: Emitted when new errors are created
- **Error Pooling**: Emitted when errors are pooled/released  
- **Error Transformation**: Emitted when errors are transformed
- **Configuration Changes**: Emitted when configuration updates


## Configuration System

Global configuration system with:

- **Performance Options**: Object pooling, lazy evaluation
- **Feature Flags**: Stack trace capture, source location
- **Environment Detection**: Automatic dev/prod optimization
- **Runtime Reconfiguration**: Update config on the fly

