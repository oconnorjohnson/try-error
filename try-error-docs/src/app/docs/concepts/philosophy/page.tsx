import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function PhilosophyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Error Handling Philosophy
        </h1>
        <p className="text-xl text-slate-600">
          Understanding the principles and design decisions behind tryError
        </p>
      </div>

      <div className="space-y-8">
        {/* Core Principles */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Core Principles
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Errors are Values
              </h3>
              <p className="text-slate-600">
                Errors should be treated as first-class values that can be
                passed around, inspected, and handled explicitly. This makes
                error handling visible in the type system and forces developers
                to consider failure cases.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Progressive Enhancement
              </h3>
              <p className="text-slate-600">
                You shouldn't need to rewrite your entire codebase to get
                benefits. tryError works alongside existing error handling
                patterns, allowing gradual adoption.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Minimal Runtime Cost
              </h3>
              <p className="text-slate-600">
                Error handling shouldn't slow down your application. tryError
                adds &lt;3% overhead for successful operations. Error paths have
                configurable overhead (20%-120%) based on debugging needs - this
                is acceptable because errors should be exceptional.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Developer Experience First
              </h3>
              <p className="text-slate-600">
                The API should feel natural to JavaScript/TypeScript developers.
                No need to learn complex functional programming concepts or
                monadic patterns.
              </p>
            </div>
          </div>
        </section>

        {/* The Problem with Exceptions */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            The Problem with Exceptions
          </h2>

          <p className="text-slate-600 mb-4">
            Traditional exception handling has several issues that tryError
            addresses:
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              ❌ Problems with try/catch
            </h3>
            <ul className="space-y-2 text-red-700">
              <li>
                • <strong>Invisible in types:</strong> Functions don't declare
                what errors they might throw
              </li>
              <li>
                • <strong>Easy to ignore:</strong> Forgotten catch blocks lead
                to unhandled exceptions
              </li>
              <li>
                • <strong>Performance cost:</strong> Exception throwing and
                stack unwinding is expensive
              </li>
              <li>
                • <strong>Control flow:</strong> Exceptions break normal program
                flow unpredictably
              </li>
              <li>
                • <strong>Type uncertainty:</strong> catch blocks receive{" "}
                <code>unknown</code> or <code>any</code>
              </li>
            </ul>
          </div>

          <CodeBlock
            language="typescript"
            title="Problems with Traditional Error Handling"
            className="mb-4"
          >
            {`// What errors can this function throw? 🤷‍♂️
async function fetchUserData(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return validateUser(data);
}

// Calling code has no guidance
try {
  const user = await fetchUserData('123');
  // What if the network fails?
  // What if the JSON is invalid?
  // What if validation fails?
} catch (error) {
  // What type is error? What should we do?
  console.error(error);
}`}
          </CodeBlock>
        </section>

        {/* The tryError Solution */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            The tryError Solution
          </h2>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              ✅ Benefits of tryError
            </h3>
            <ul className="space-y-2 text-green-700">
              <li>
                • <strong>Visible in types:</strong> Return types show both
                success and error possibilities
              </li>
              <li>
                • <strong>Explicit handling:</strong> You must check for errors
                before accessing values
              </li>
              <li>
                • <strong>Minimal overhead:</strong> &lt;3% cost for success
                path, configurable error overhead
              </li>
              <li>
                • <strong>Predictable flow:</strong> Errors are returned, not
                thrown
              </li>
              <li>
                • <strong>Type safety:</strong> Errors have known structure and
                properties
              </li>
            </ul>
          </div>

          <CodeBlock
            language="typescript"
            title="tryError Solution"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Clear error handling contract
async function fetchUserData(id: string): Promise<TryResult<User, TryError>> {
  const response = await tryAsync(() => fetch(\`/api/users/\${id}\`));
  if (isTryError(response)) return response;
  
  const data = await tryAsync(() => response.json());
  if (isTryError(data)) return data;
  
  const user = trySync(() => validateUser(data));
  return user; // TryResult<User, TryError>
}

// Calling code has clear guidance
const result = await fetchUserData('123');
if (isTryError(result)) {
  // Handle specific error types
  console.error('Failed to fetch user:', result.message);
  return;
}

// TypeScript knows result is User here
console.log('User name:', result.name);`}
          </CodeBlock>
        </section>

        {/* Design Decisions */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Design Decisions
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Why Union Types Instead of Monads?
          </h3>
          <p className="text-slate-600 mb-4">
            While functional programming languages often use Result/Either
            monads, tryError uses simple union types because they're more
            familiar to JavaScript developers and integrate better with existing
            TypeScript patterns.
          </p>

          <CodeBlock
            language="typescript"
            title="Union Types vs Monads"
            className="mb-4"
          >
            {`// Simple union type - familiar to TS developers
type TryResult<T, E> = T | E;

// vs. Monadic approach - requires learning new patterns
interface Result<T, E> {
  map<U>(fn: (value: T) => U): Result<U, E>;
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  // ... many more methods
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Why Not Just Use Result Libraries?
          </h3>
          <p className="text-slate-600 mb-4">
            Existing Result libraries often require a paradigm shift and have
            steep learning curves. tryError provides similar benefits with a
            more approachable API that feels natural to JavaScript developers.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Rich Error Context (With Trade-offs)
          </h3>
          <p className="text-slate-600 mb-4">
            tryError errors include rich context like stack traces, timestamps,
            and source information to aid in debugging. This causes higher error
            path overhead (20%-120%) but is configurable. The trade-off is worth
            it because errors should be rare, and debugging time saved outweighs
            runtime cost.
          </p>

          <CodeBlock
            language="typescript"
            title="TryError Interface"
            className="mb-4"
          >
            {`interface TryError {
  readonly type: 'TryError';
  readonly message: string;
  readonly stack?: string;
  readonly source: string;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error | TryError;
}`}
          </CodeBlock>
        </section>

        {/* When to Use tryError */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            When to Use tryError
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                ✅ Great for:
              </h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• API calls and network operations</li>
                <li>• File system operations</li>
                <li>• Data parsing and validation</li>
                <li>• Database operations</li>
                <li>• User input processing</li>
                <li>• Configuration loading</li>
                <li>• Any operation that might fail</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-600 mb-3">
                ⚠️ Consider alternatives for:
              </h3>
              <ul className="space-y-2 text-red-700 text-sm">
                <li>• Programming errors (use assertions)</li>
                <li>• Truly exceptional conditions</li>
                <li>
                  • Library code that needs to integrate with existing
                  exception-based APIs
                </li>
                <li>
                  • Performance-critical hot paths where even type checking
                  matters
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                TryResult vs Exceptions
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Detailed comparison with traditional error handling
              </p>
              <a
                href="/docs/concepts/tryresult-vs-exceptions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Compare Approaches →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Error Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                Understanding TryError structure and custom errors
              </p>
              <a
                href="/docs/concepts/error-types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn Error Types →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Quick Start</h3>
              <p className="text-slate-600 text-sm mb-3">
                Start using tryError in your project
              </p>
              <a
                href="/docs/quick-start"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Get Started →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
