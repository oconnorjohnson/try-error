# Basic Node.js Test for try-error

This is a simple test application to verify that the try-error package works correctly in a real project.

## Setup

1. Install the local package:

   ```bash
   npm run install-local
   ```

2. Run the test:
   ```bash
   npm test
   ```

## What it tests

- ✅ Package import
- ✅ Basic sync operations (`trySync`)
- ✅ Error handling
- ✅ Result mapping (`tryMap`)
- ✅ Operation chaining (`tryChain`)
- ✅ Parallel operations (`tryAll`)
- ✅ First success operations (`tryAny`)
- ✅ Safe unwrapping (`unwrapOr`)
- ✅ Async operations (`tryAsync`)

## Expected Output

You should see a series of test results with ✅ success indicators for each test case, ending with:

```
🎉 All tests completed successfully!
```

If you see any ❌ errors, there may be an issue with the package.
