import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function SyncAPIPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Synchronous Operations
        </h1>
        <p className="text-xl text-slate-600">
          API reference for handling synchronous operations with tryError
        </p>
      </div>

      <div className="space-y-8">
        {/* trySync Function */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            trySync
          </h2>

          <CodeBlock
            language="typescript"
            title="Function Signature"
            className="mb-4"
          >
            {`function trySync<T>(fn: () => T): TryResult<T, TryError>`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Executes a synchronous function and returns either the result or a
            TryError if an exception is thrown.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Parameters
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <ul className="space-y-2">
              <li>
                <code className="bg-slate-200 px-2 py-1 rounded">
                  fn: () =&gt; T
                </code>{" "}
                - The function to execute
              </li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Returns</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <p>
              <code className="bg-slate-200 px-2 py-1 rounded">
                TryResult&lt;T, TryError&gt;
              </code>{" "}
              - Either the function result or a TryError
            </p>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Examples
          </h3>

          <CodeBlock
            language="typescript"
            title="trySync Examples"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { trySync, isTryError } from '@try-error/core';

// JSON parsing
const parseResult = trySync(() => JSON.parse('{"name": "John"}'));
if (isTryError(parseResult)) {
  console.error('Parse failed:', parseResult.message);
} else {
  console.log('Parsed:', parseResult.name); // "John"
}

// Mathematical operations
const divideResult = trySync(() => {
  const a = 10;
  const b = 0;
  if (b === 0) throw new Error('Division by zero');
  return a / b;
});

// File operations (Node.js)
const fileResult = trySync(() => 
  require('fs').readFileSync('config.json', 'utf8')
);

// Type conversion
const numberResult = trySync(() => {
  const value = "not-a-number";
  const num = parseInt(value, 10);
  if (isNaN(num)) throw new Error('Invalid number');
  return num;
});`}
          </CodeBlock>
        </section>

        {/* Type Guards */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Type Guards
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            isTryError
          </h3>

          <CodeBlock
            language="typescript"
            title="isTryError Signature"
            className="mb-4"
          >
            {`function isTryError(value: unknown): value is TryError`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Type guard function to check if a value is a TryError. This provides
            type narrowing in TypeScript.
          </p>

          <CodeBlock
            language="typescript"
            title="isTryError Usage"
            className="mb-4"
          >
            {`const result = trySync(() => JSON.parse(jsonString));

if (isTryError(result)) {
  // TypeScript knows result is TryError here
  console.error(result.message);
  console.error(result.stack);
  console.error(result.source);
} else {
  // TypeScript knows result is the parsed value here
  console.log(result.someProperty);
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            isTrySuccess
          </h3>

          <CodeBlock
            language="typescript"
            title="isTrySuccess Signature"
            className="mb-4"
          >
            {`function isTrySuccess<T>(value: TryResult<T, TryError>): value is T`}
          </CodeBlock>

          <p className="text-slate-600 mb-4">
            Type guard function to check if a value is a successful result (not
            a TryError).
          </p>

          <CodeBlock
            language="typescript"
            title="isTrySuccess Usage"
            className="mb-4"
          >
            {`const result = trySync(() => JSON.parse(jsonString));

if (isTrySuccess(result)) {
  // TypeScript knows result is the parsed value here
  console.log('Success:', result);
} else {
  // TypeScript knows result is TryError here
  console.error('Error:', result.message);
}`}
          </CodeBlock>
        </section>

        {/* Common Patterns */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Common Patterns
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Default Values
          </h3>

          <CodeBlock
            language="typescript"
            title="Default Value Patterns"
            className="mb-4"
          >
            {`// Provide default value on error
function parseConfigWithDefault(jsonString: string) {
  const result = trySync(() => JSON.parse(jsonString));
  return isTryError(result) ? { defaultConfig: true } : result;
}

// Using ternary operator
const config = isTryError(parseResult) ? defaultConfig : parseResult;`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Error Transformation
          </h3>

          <CodeBlock
            language="typescript"
            title="Error Transformation"
            className="mb-4"
          >
            {`function parseWithCustomError(jsonString: string) {
  const result = trySync(() => JSON.parse(jsonString));
  
  if (isTryError(result)) {
    return createTryError(
      'CONFIG_PARSE_ERROR',
      \`Failed to parse configuration: \${result.message}\`,
      { originalError: result, input: jsonString }
    );
  }
  
  return result;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Chaining Operations
          </h3>

          <CodeBlock
            language="typescript"
            title="Chaining Operations"
            className="mb-4"
          >
            {`function processData(input: string) {
  // Parse JSON
  const parseResult = trySync(() => JSON.parse(input));
  if (isTryError(parseResult)) return parseResult;
  
  // Validate structure
  const validateResult = trySync(() => validateSchema(parseResult));
  if (isTryError(validateResult)) return validateResult;
  
  // Transform data
  const transformResult = trySync(() => transformData(validateResult));
  return transformResult;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Multiple Operations
          </h3>

          <CodeBlock
            language="typescript"
            title="Processing Multiple Inputs"
            className="mb-4"
          >
            {`function processMultipleInputs(inputs: string[]) {
  const results = [];
  const errors = [];
  
  for (const input of inputs) {
    const result = trySync(() => JSON.parse(input));
    if (isTryError(result)) {
      errors.push({ input, error: result });
    } else {
      results.push(result);
    }
  }
  
  return { results, errors };
}`}
          </CodeBlock>
        </section>

        {/* Error Handling Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Best Practices
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Do</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Always check for errors before using the result</li>
                <li>• Use type guards for proper type narrowing</li>
                <li>• Provide meaningful error messages</li>
                <li>• Handle errors at the appropriate level</li>
                <li>• Use early returns to avoid deep nesting</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>
                  • Access result properties without checking for errors first
                </li>
                <li>• Ignore error cases in your code</li>
                <li>
                  • Use trySync for async operations (use tryAsync instead)
                </li>
                <li>• Nest trySync calls unnecessarily</li>
                <li>• Throw exceptions inside trySync callbacks</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Performance Notes */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800">
              <strong>Zero Overhead:</strong> trySync has no performance impact
              for successful operations. Error cases have minimal overhead
              compared to traditional exception handling.
            </p>
          </div>

          <CodeBlock
            language="typescript"
            title="Performance Comparison"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Performance comparison
console.time('trySync');
for (let i = 0; i < 1000000; i++) {
  const result = trySync(() => JSON.parse('{"test": true}'));
  if (!isTryError(result)) {
    // Process result
  }
}
console.timeEnd('trySync'); // ~50ms

console.time('try/catch');
for (let i = 0; i < 1000000; i++) {
  try {
    const result = JSON.parse('{"test": true}');
    // Process result
  } catch (error) {
    // Handle error
  }
}
console.timeEnd('try/catch'); // ~50ms (same for success cases)`}
          </CodeBlock>
        </section>

        {/* Related APIs */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related APIs
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">tryAsync</h3>
              <p className="text-slate-600 text-sm mb-3">
                For asynchronous operations that return promises
              </p>
              <a
                href="/docs/api/async"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View tryAsync →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Error Creation
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Creating custom errors and error factories
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
