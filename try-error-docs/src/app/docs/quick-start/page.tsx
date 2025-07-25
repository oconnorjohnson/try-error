import { CodeBlock } from "../../../components/EnhancedCodeBlock";

export default function QuickStartPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
          Quick Start
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-600">
          Learn the essentials of tryError with practical examples
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Basic Synchronous Operations */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
            Synchronous Operations
          </h2>

          <p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Use{" "}
            <code className="bg-slate-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">
              trySync
            </code>{" "}
            for operations that might throw:
          </p>

          <CodeBlock
            language="typescript"
            title="Synchronous Examples"
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            {`import { trySync, isTryError } from '@try-error/core';

// JSON parsing
const parseResult = trySync(() => JSON.parse(jsonString));
if (isTryError(parseResult)) {
  console.error('Invalid JSON:', parseResult.message);
  return null;
}
console.log('Parsed:', parseResult);

// File operations (Node.js)
const fileResult = trySync(() => fs.readFileSync('config.json', 'utf8'));
if (isTryError(fileResult)) {
  console.error('File read failed:', fileResult.message);
  return defaultConfig;
}
return JSON.parse(fileResult);`}
          </CodeBlock>
        </section>

        {/* Asynchronous Operations */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
            Asynchronous Operations
          </h2>

          <p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Use{" "}
            <code className="bg-slate-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">
              tryAsync
            </code>{" "}
            for async operations:
          </p>

          <CodeBlock
            language="typescript"
            title="Async Examples"
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            {`import { tryAsync, isTryError } from '@try-error/core';

// API calls
const fetchUser = async (id: string) => {
  const result = await tryAsync(() => fetch(\`/api/users/\${id}\`));
  if (isTryError(result)) {
    console.error('Fetch failed:', result.message);
    return null;
  }
  
  const jsonResult = await tryAsync(() => result.json());
  if (isTryError(jsonResult)) {
    console.error('JSON parse failed:', jsonResult.message);
    return null;
  }
  
  return jsonResult;
};

// Database operations
const saveUser = async (user: User) => {
  const result = await tryAsync(() => db.users.create(user));
  if (isTryError(result)) {
    console.error('Save failed:', result.message);
    throw new Error('Failed to save user');
  }
  return result;
};`}
          </CodeBlock>
        </section>

        {/* Error Handling Patterns */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
            Common Patterns
          </h2>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">
            Early Returns
          </h3>
          <CodeBlock
            language="typescript"
            title="Early Return Pattern"
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            {`function processData(input: string) {
  const parseResult = trySync(() => JSON.parse(input));
  if (isTryError(parseResult)) {
    return { error: 'Invalid JSON', data: null };
  }
  
  const validateResult = trySync(() => validateSchema(parseResult));
  if (isTryError(validateResult)) {
    return { error: 'Validation failed', data: null };
  }
  
  return { error: null, data: validateResult };
}`}
          </CodeBlock>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">
            Default Values
          </h3>
          <CodeBlock
            language="typescript"
            title="Default Values Pattern"
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            {`function getConfig() {
  const result = trySync(() => JSON.parse(configString));
  return isTryError(result) ? defaultConfig : result;
}

// Or with async
async function getUserPreferences(userId: string) {
  const result = await tryAsync(() => fetchPreferences(userId));
  return isTryError(result) ? defaultPreferences : result;
}`}
          </CodeBlock>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">
            Error Aggregation
          </h3>
          <CodeBlock
            language="typescript"
            title="Error Aggregation Pattern"
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            {`async function validateForm(data: FormData) {
  const errors: string[] = [];
  
  const emailResult = trySync(() => validateEmail(data.email));
  if (isTryError(emailResult)) {
    errors.push(\`Email: \${emailResult.message}\`);
  }
  
  const phoneResult = trySync(() => validatePhone(data.phone));
  if (isTryError(phoneResult)) {
    errors.push(\`Phone: \${phoneResult.message}\`);
  }
  
  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] };
}`}
          </CodeBlock>
        </section>

        {/* Type Safety */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
            Type Safety
          </h2>

          <p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base">
            tryError provides full TypeScript support with intelligent type
            inference:
          </p>

          <CodeBlock
            language="typescript"
            title="Type Safety Examples"
            showLineNumbers={true}
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            {`// Return type is automatically inferred
const result = trySync(() => JSON.parse(jsonString));
// result: TryResult<any, TryError>

if (isTryError(result)) {
  // result is TryError here
  console.log(result.message, result.stack);
} else {
  // result is the parsed value here
  console.log(result.someProperty);
}

// Custom types work too
interface User {
  id: string;
  name: string;
}

const userResult = trySync((): User => {
  return JSON.parse(userJson);
});
// userResult: TryResult<User, TryError>`}
          </CodeBlock>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
            Next Steps
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="border border-slate-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                Core Concepts
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-2 sm:mb-3">
                Learn the philosophy and design principles
              </p>
              <a
                href="/docs/concepts/philosophy"
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
              >
                Read Concepts →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                API Reference
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-2 sm:mb-3">
                Complete API documentation
              </p>
              <a
                href="/docs/api/sync"
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
              >
                View API →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                Examples
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-2 sm:mb-3">
                Real-world usage examples
              </p>
              <a
                href="/docs/examples/basic"
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
              >
                See Examples →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
