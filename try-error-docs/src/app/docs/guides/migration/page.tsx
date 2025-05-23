import {
  CodeBlock,
  InstallCommand,
} from "../../../../components/EnhancedCodeBlock";

export default function MigrationGuidesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Migration Guides
        </h1>
        <p className="text-xl text-slate-600">
          Step-by-step guides for migrating from other error handling approaches
          to try-error
        </p>
      </div>

      <div className="space-y-8">
        {/* From try/catch */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Migrating from try/catch
          </h2>

          <p className="text-slate-600 mb-4">
            The most common migration scenario - moving from traditional
            try/catch blocks to try-error.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-2">
              Before (try/catch)
            </h3>
            <CodeBlock
              language="typescript"
              title="Traditional try/catch Approach"
              showLineNumbers={true}
            >
              {`async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null; // Lost error information
  }
}

// Usage
const user = await fetchUser('123');
if (!user) {
  // Can't tell if user doesn't exist or if there was an error
  console.log('No user found or error occurred');
}`}
            </CodeBlock>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">
              After (try-error)
            </h3>
            <CodeBlock
              language="typescript"
              title="try-error Approach"
              showLineNumbers={true}
            >
              {`import { tryAsync, isTryError } from 'try-error';

async function fetchUser(id: string): Promise<TryResult<User, TryError>> {
  return tryAsync(async () => {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return await response.json();
  });
}

// Usage
const result = await fetchUser('123');
if (isTryError(result)) {
  console.error('Failed to fetch user:', result.message);
  // Full error context available
  console.log('Error details:', result.context);
} else {
  console.log('User found:', result.name);
}`}
            </CodeBlock>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Migration Benefits
            </h4>
            <ul className="space-y-1 text-blue-700 text-sm">
              <li>• Explicit error handling - no silent failures</li>
              <li>• Rich error context preserved</li>
              <li>• Type-safe error handling</li>
              <li>• Better debugging information</li>
              <li>• Consistent error patterns across codebase</li>
            </ul>
          </div>
        </section>

        {/* From Result libraries */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Migrating from neverthrow
          </h2>

          <p className="text-slate-600 mb-4">
            If you're coming from neverthrow or similar Result libraries,
            try-error offers a more JavaScript-native approach.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-2">
              Before (neverthrow)
            </h3>
            <CodeBlock
              language="typescript"
              title="neverthrow Result Pattern"
              showLineNumbers={true}
            >
              {`import { Result, ok, err } from 'neverthrow';

async function fetchUser(id: string): Promise<Result<User, Error>> {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      return err(new Error(\`HTTP \${response.status}\`));
    }
    const user = await response.json();
    return ok(user);
  } catch (error) {
    return err(error as Error);
  }
}

// Usage - requires learning Result API
const result = await fetchUser('123');
result.match(
  (user) => console.log('User:', user),
  (error) => console.error('Error:', error.message)
);`}
            </CodeBlock>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">
              After (try-error)
            </h3>
            <CodeBlock
              language="typescript"
              title="try-error Equivalent"
              showLineNumbers={true}
            >
              {`import { tryAsync, isTryError } from 'try-error';

async function fetchUser(id: string): Promise<TryResult<User, TryError>> {
  return tryAsync(async () => {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    return await response.json();
  });
}

// Usage - familiar JavaScript patterns
const result = await fetchUser('123');
if (isTryError(result)) {
  console.error('Error:', result.message);
} else {
  console.log('User:', result);
}`}
            </CodeBlock>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Key Differences
            </h4>
            <ul className="space-y-1 text-blue-700 text-sm">
              <li>• No need to learn monadic patterns (map, flatMap, etc.)</li>
              <li>• Uses familiar JavaScript error throwing</li>
              <li>• Simpler type system - just union types</li>
              <li>• Better integration with existing JavaScript code</li>
              <li>• Rich error context out of the box</li>
            </ul>
          </div>
        </section>

        {/* From fp-ts */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Migrating from fp-ts Either
          </h2>

          <p className="text-slate-600 mb-4">
            Moving from fp-ts Either to try-error for teams wanting functional
            error handling without the complexity.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-2">
              Before (fp-ts)
            </h3>
            <CodeBlock
              language="typescript"
              title="fp-ts Either Pattern"
              showLineNumbers={true}
            >
              {`import { Either, left, right, fold } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { TaskEither, tryCatch } from 'fp-ts/TaskEither';

const fetchUser = (id: string): TaskEither<Error, User> =>
  tryCatch(
    () => fetch(\`/api/users/\${id}\`).then(r => r.json()),
    (reason) => new Error(String(reason))
  );

// Usage - requires fp-ts knowledge
pipe(
  await fetchUser('123')(),
  fold(
    (error) => console.error('Error:', error.message),
    (user) => console.log('User:', user)
  )
);`}
            </CodeBlock>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">
              After (try-error)
            </h3>
            <CodeBlock language="typescript" title="try-error Equivalent">
              {`import { tryAsync, isTryError } from 'try-error';

const fetchUser = (id: string) =>
  tryAsync(() => fetch(\`/api/users/\${id}\`).then(r => r.json()));

// Usage - straightforward JavaScript
const result = await fetchUser('123');
if (isTryError(result)) {
  console.error('Error:', result.message);
} else {
  console.log('User:', result);
}`}
            </CodeBlock>
          </div>
        </section>

        {/* Step-by-step migration process */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Step-by-Step Migration Process
          </h2>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                1. Install try-error
              </h3>
              <InstallCommand packageName="try-error" />
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                2. Identify Migration Candidates
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                Look for these patterns in your codebase:
              </p>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• Functions that return null/undefined on error</li>
                <li>• try/catch blocks that swallow errors</li>
                <li>• Inconsistent error handling patterns</li>
                <li>• Functions that throw but callers don't handle errors</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                3. Start with Leaf Functions
              </h3>
              <p className="text-slate-600 text-sm">
                Begin migration with functions that don't call other functions -
                typically API calls, file operations, or parsing functions.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                4. Update Function Signatures
              </h3>
              <CodeBlock
                language="typescript"
                title="Function Signature Updates"
              >
                {`// Before
function parseJson(str: string): any | null

// After  
function parseJson(str: string): TryResult<any, TryError>`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                5. Update Callers Gradually
              </h3>
              <p className="text-slate-600 text-sm">
                Work your way up the call stack, updating callers to handle the
                new return types. You can mix try-error with existing patterns
                during migration.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                6. Add Error Context
              </h3>
              <p className="text-slate-600 text-sm">
                Enhance your error handling by adding context information to
                help with debugging.
              </p>
            </div>
          </div>
        </section>

        {/* Common Migration Patterns */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Common Migration Patterns
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Pattern 1: Null Returns → TryResult
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Before</h4>
                  <CodeBlock language="typescript" title="Null Return Pattern">
                    {`function findUser(id: string): User | null {
  try {
    return database.findById(id);
  } catch {
    return null;
  }
}`}
                  </CodeBlock>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">After</h4>
                  <CodeBlock language="typescript" title="TryResult Pattern">
                    {`function findUser(id: string): TryResult<User, TryError> {
  return trySync(() => database.findById(id));
}`}
                  </CodeBlock>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Pattern 2: Boolean Success → TryResult
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Before</h4>
                  <CodeBlock
                    language="typescript"
                    title="Boolean Success Pattern"
                  >
                    {`function saveUser(user: User): boolean {
  try {
    database.save(user);
    return true;
  } catch {
    return false;
  }
}`}
                  </CodeBlock>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">After</h4>
                  <CodeBlock language="typescript" title="TryResult Pattern">
                    {`function saveUser(user: User): TryResult<void, TryError> {
  return trySync(() => database.save(user));
}`}
                  </CodeBlock>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Migration Checklist */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Migration Checklist
          </h2>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Install try-error package</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Identify functions with poor error handling
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Start with leaf functions (no dependencies)
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Update function return types</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Replace try/catch with trySync/tryAsync
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Update callers to handle TryResult
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Add error context where helpful</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Update tests to verify error handling
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Document new error handling patterns
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Quick Start</h3>
              <p className="text-slate-600 text-sm mb-3">
                Get up and running with try-error quickly
              </p>
              <a
                href="/docs/quick-start"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Quick Start →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Best Practices
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn the recommended patterns and practices
              </p>
              <a
                href="/docs/advanced/performance"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Best Practices →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
