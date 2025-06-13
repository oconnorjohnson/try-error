# Local Testing Guide for try-error

Your try-error package is **ready for local testing**! 🎉 All tests are passing and both the core and React packages build successfully.

## Package Status ✅

- **Core Package**: Built and tested (134 tests passing)
- **React Package**: Built and tested (1 test passing)
- **Tarball Packages**: Created for local installation

## Testing Options

### 1. **Local Tarball Installation** (Recommended)

This method simulates the exact npm installation experience:

```bash
# Core package
npm install /path/to/try-error/try-error-0.0.1-alpha.1.tgz

# React package (requires core package)
npm install /path/to/try-error/try-error-0.0.1-alpha.1.tgz
npm install /path/to/try-error/packages/react/try-error-react-0.0.1-alpha.1.tgz
```

**Pros:**

- Exact npm installation experience
- Tests actual package contents
- No symlink issues

**Cons:**

- Need to rebuild/repack for changes
- Manual process

### 2. **pnpm Link** (Best for Development)

For active development and testing:

```bash
# In try-error directory
pnpm link --global

# In React package directory
cd packages/react
pnpm link --global

# In test project
pnpm link --global try-error
pnpm link --global @try-error/react
```

**Pros:**

- Real-time updates during development
- No rebuild needed for changes
- Easy to update

**Cons:**

- Symlinks can sometimes cause issues
- Different from real npm install

### 3. **Workspace Testing**

Create test apps within your workspace:

```bash
# Add to pnpm-workspace.yaml
packages:
  - 'src'
  - 'packages/*'
  - 'test-apps/*'  # Add this

# Create test apps
mkdir test-apps
cd test-apps
mkdir vanilla-js-test react-test
```

### 4. **Private Registry** (Advanced)

Use Verdaccio for most realistic testing:

```bash
# Install Verdaccio
npm install -g verdaccio

# Start registry
verdaccio

# Publish to local registry
npm publish --registry http://localhost:4873

# Install from local registry
npm install try-error --registry http://localhost:4873
```

## Quick Test Setup

### Basic Node.js Test

```javascript
// test-basic.js
const { trySync, isOk, isErr } = require("try-error");

// Test basic functionality
const result = trySync(() => {
  return "Hello from try-error!";
});

if (isOk(result)) {
  console.log("✅ Success:", result);
} else {
  console.log("❌ Error:", result.message);
}

// Test error handling
const errorResult = trySync(() => {
  throw new Error("Test error");
});

if (isErr(errorResult)) {
  console.log("✅ Error handled:", errorResult.message);
}
```

### React Test

```jsx
// test-react.jsx
import React from "react";
import { TryErrorBoundary } from "@try-error/react";
import { trySync } from "try-error";

function TestComponent() {
  const handleClick = () => {
    const result = trySync(() => {
      return "React integration works!";
    });

    console.log(result);
  };

  return (
    <TryErrorBoundary fallback={<div>Something went wrong!</div>}>
      <button onClick={handleClick}>Test try-error</button>
    </TryErrorBoundary>
  );
}
```

## What to Test

### Core Functionality

- [ ] Basic `trySync` operations
- [ ] Async `tryAsync` operations
- [ ] Error handling with custom types
- [ ] Chaining operations with `tryChain`
- [ ] Parallel operations with `tryAll`
- [ ] Timeout handling
- [ ] Retry logic

### React Integration

- [ ] Error boundary functionality
- [ ] Hook integrations
- [ ] Component error handling

### TypeScript Support

- [ ] Type inference
- [ ] Custom error types
- [ ] Generic type support

## File Locations

- **Core Package**: `./try-error-0.0.1-alpha.1.tgz`
- **React Package**: `./packages/react/try-error-react-0.0.1-alpha.1.tgz`
- **Source**: `./src/` and `./packages/react/src/`
- **Built**: `./dist/` and `./packages/react/dist/`

## Next Steps

1. **Create Test Projects**: Set up small test applications
2. **Test Different Scenarios**: Try various use cases
3. **Test TypeScript**: Verify type safety works
4. **Test Build Tools**: Verify compatibility with Webpack, Vite, etc.
5. **Test Different Node Versions**: Ensure compatibility
6. **Performance Test**: Run benchmarks if needed

## Ready for NPM Publish

Once local testing is complete, you can publish with:

```bash
# Publish core package
npm publish

# Publish React package
cd packages/react
npm publish
```

Your package is well-structured and ready for real-world testing! 🚀
