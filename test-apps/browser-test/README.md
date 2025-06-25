# Browser Test Suite for try-error

This directory contains a browser-based test suite for the try-error library.

## Prerequisites

Before running the browser tests, make sure to build the browser bundle:

```bash
# From the root directory
pnpm build:browser
```

## Running the Tests

### Option 1: Using a Local Server (Recommended)

```bash
# From this directory
npx serve .
# Or
python -m http.server 8000
# Or
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

### Option 2: Direct File Access

Simply open `index.html` in your browser. Note that some browsers may have CORS restrictions when loading ES modules from file:// URLs.

## What's Tested

The test suite verifies:

- ✅ Basic sync operations (trySync, trySyncTuple)
- ✅ Async operations (tryAsync, tryAsyncTuple)
- ✅ Type guards (isTryError, isOk, isErr)
- ✅ Error creation and context
- ✅ Utility functions (unwrap, unwrapOr)
- ✅ Multiple operations (tryAll, tryAny)
- ✅ Advanced features (retry, withTimeout)
- ✅ Error metadata (timestamp, source, stack)

## Browser Compatibility

Tests should pass in:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Test Results

- **Green**: Test passed
- **Red**: Test failed
- **Yellow**: Test pending

The summary shows total tests, passed, and failed counts.

## Troubleshooting

If tests fail to load:

1. Check browser console for errors
2. Ensure you're using a modern browser with ES module support
3. Try using a local server instead of file:// protocol
4. Check that the library is published to npm/unpkg
