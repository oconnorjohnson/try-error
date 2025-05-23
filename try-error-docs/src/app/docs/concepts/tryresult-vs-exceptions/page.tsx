import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function TryResultVsExceptionsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          TryResult vs Exceptions
        </h1>
        <p className="text-xl text-slate-600">
          A detailed comparison between try-error and traditional exception
          handling
        </p>
      </div>

      <div className="space-y-8">
        {/* Quick Comparison Table */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Quick Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-4 py-2 text-left">
                    Aspect
                  </th>
                  <th className="border border-slate-300 px-4 py-2 text-left">
                    try-error
                  </th>
                  <th className="border border-slate-300 px-4 py-2 text-left">
                    Exceptions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 font-medium">
                    Type Safety
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-green-600">
                    ✅ Errors visible in types
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-red-600">
                    ❌ Invisible to type system
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-medium">
                    Performance
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-green-600">
                    ✅ Zero overhead success path
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-red-600">
                    ❌ Stack unwinding cost
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 font-medium">
                    Explicit Handling
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-green-600">
                    ✅ Must check before use
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-red-600">
                    ❌ Easy to forget catch
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-medium">
                    Control Flow
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-green-600">
                    ✅ Predictable returns
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-red-600">
                    ❌ Unpredictable jumps
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 font-medium">
                    Learning Curve
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-yellow-600">
                    ⚠️ New patterns to learn
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-green-600">
                    ✅ Familiar to most devs
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-medium">
                    Ecosystem
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-yellow-600">
                    ⚠️ Newer approach
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-green-600">
                    ✅ Universal support
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Comparisons */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Detailed Comparisons
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Type Safety
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2">
                ❌ Exceptions
              </h4>
              <CodeBlock language="typescript" title="Exception-based Approach">
                {`// No indication of possible errors
function parseJSON(input: string): object {
  return JSON.parse(input); // Might throw!
}

// Caller has no type-level guidance
const result = parseJSON(userInput);
// What if it throws? TypeScript can't help`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-2">
                ✅ try-error
              </h4>
              <CodeBlock language="typescript" title="try-error Approach">
                {`// Clear error possibility in return type
function parseJSON(input: string): TryResult<object, TryError> {
  return trySync(() => JSON.parse(input));
}

// Caller must handle both cases
const result = parseJSON(userInput);
if (isTryError(result)) {
  // Handle error case
} else {
  // Use successful result
}`}
              </CodeBlock>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Performance
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800">
              <strong>Performance Impact:</strong> Exception throwing involves
              stack unwinding, which is expensive. try-error has zero overhead
              for success cases and minimal overhead for errors.
            </p>
          </div>

          <CodeBlock
            language="typescript"
            title="Performance Comparison"
            showLineNumbers={true}
            className="mb-6"
          >
            {`// Exception performance cost
try {
  const result = riskyOperation(); // If this throws...
  return result;
} catch (error) {
  // Stack unwinding happened here (expensive)
  return null;
}

// try-error performance
const result = trySync(() => riskyOperation());
if (isTryError(result)) {
  // No stack unwinding, just a return value
  return null;
}
return result; // Zero overhead for success`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Error Propagation
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                Exceptions
              </h4>
              <CodeBlock language="typescript" title="Exception Propagation">
                {`async function processData() {
  try {
    const step1 = await fetchData();
    const step2 = await processStep1(step1);
    const step3 = await processStep2(step2);
    return step3;
  } catch (error) {
    // Which step failed? Hard to tell
    console.error('Something failed:', error);
    throw error;
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                try-error
              </h4>
              <CodeBlock language="typescript" title="try-error Propagation">
                {`async function processData() {
  const step1 = await tryAsync(() => fetchData());
  if (isTryError(step1)) return step1;
  
  const step2 = await tryAsync(() => processStep1(step1));
  if (isTryError(step2)) return step2;
  
  const step3 = await tryAsync(() => processStep2(step2));
  return step3; // Clear which step succeeded/failed
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* When to Use Each */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            When to Use Each Approach
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                ✅ Use try-error for:
              </h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• New code where you control the API</li>
                <li>
                  • Operations that commonly fail (network, parsing, validation)
                </li>
                <li>• When you want explicit error handling</li>
                <li>• Performance-critical code</li>
                <li>• When type safety is important</li>
                <li>• Complex error handling logic</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                ✅ Use exceptions for:
              </h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>• Integrating with existing exception-based APIs</li>
                <li>• Truly exceptional conditions</li>
                <li>• When you need to bubble up through many layers</li>
                <li>• Library code that needs to match ecosystem patterns</li>
                <li>• Programming errors (assertions)</li>
                <li>• Legacy codebases where consistency matters</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Migration Strategies */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Hybrid Approaches
          </h2>

          <p className="text-slate-600 mb-4">
            You don't have to choose one or the other. Here are strategies for
            using both:
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Boundary Pattern
          </h3>
          <CodeBlock
            language="typescript"
            title="Boundary Pattern"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Use try-error internally, exceptions at boundaries
class UserService {
  // Internal methods use try-error
  private async fetchUserData(id: string): Promise<TryResult<User, TryError>> {
    const result = await tryAsync(() => this.api.getUser(id));
    return result;
  }
  
  // Public API uses exceptions for compatibility
  async getUser(id: string): Promise<User> {
    const result = await this.fetchUserData(id);
    if (isTryError(result)) {
      throw new Error(\`Failed to fetch user: \${result.message}\`);
    }
    return result;
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Adapter Pattern
          </h3>
          <CodeBlock
            language="typescript"
            title="Adapter Pattern"
            className="mb-4"
          >
            {`// Wrap exception-based APIs with try-error
function safeFetch(url: string): Promise<TryResult<Response, TryError>> {
  return tryAsync(() => fetch(url));
}

// Convert try-error to exceptions when needed
function throwingParse(json: string): object {
  const result = trySync(() => JSON.parse(json));
  if (isTryError(result)) {
    throw new Error(result.message);
  }
  return result;
}`}
          </CodeBlock>
        </section>

        {/* Performance Benchmarks */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance Considerations
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800">
              <strong>Benchmark Results:</strong> In typical scenarios,
              try-error shows 2-10x better performance for error cases and
              identical performance for success cases compared to try/catch.
            </p>
          </div>

          <CodeBlock
            language="typescript"
            title="Performance Benchmark Example"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Performance comparison example
// Exception version: ~100ms for 1000 errors
function parseWithExceptions(inputs: string[]) {
  const results = [];
  for (const input of inputs) {
    try {
      results.push(JSON.parse(input));
    } catch {
      results.push(null);
    }
  }
  return results;
}

// try-error version: ~20ms for 1000 errors
function parseWithTryError(inputs: string[]) {
  const results = [];
  for (const input of inputs) {
    const result = trySync(() => JSON.parse(input));
    results.push(isTryError(result) ? null : result);
  }
  return results;
}`}
          </CodeBlock>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Error Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about TryError structure and custom error types
              </p>
              <a
                href="/docs/concepts/error-types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Explore Error Types →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Migration Guide
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Step-by-step guide to adopting try-error
              </p>
              <a
                href="/docs/migration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Start Migration →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                API Reference
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Complete API documentation and examples
              </p>
              <a
                href="/docs/api/sync"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View API Docs →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
