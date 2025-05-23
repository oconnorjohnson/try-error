import { CodeBlock } from "../../../components/EnhancedCodeBlock";

export default function MigrationPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Migration Guide
        </h1>
        <p className="text-xl text-slate-600">
          Gradually adopt try-error in your existing codebase
        </p>
      </div>

      <div className="space-y-8">
        {/* Progressive Adoption */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Progressive Adoption
          </h2>

          <p className="text-slate-600 mb-4">
            try-error is designed for gradual adoption. You can start using it
            in new code while keeping existing try/catch blocks unchanged.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">
              <strong>✅ Safe Migration:</strong> try-error works alongside
              traditional error handling. No need for a big rewrite!
            </p>
          </div>
        </section>

        {/* Before and After Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Before and After
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Synchronous Operations
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2">
                ❌ Before (try/catch)
              </h4>
              <CodeBlock language="typescript" title="Traditional try/catch">
                {`function parseConfig(jsonString: string) {
  try {
    const config = JSON.parse(jsonString);
    return config;
  } catch (error) {
    console.error('Parse failed:', error);
    return null;
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-2">
                ✅ After (try-error)
              </h4>
              <CodeBlock language="typescript" title="try-error Approach">
                {`function parseConfig(jsonString: string) {
  const result = trySync(() => JSON.parse(jsonString));
  if (isTryError(result)) {
    console.error('Parse failed:', result.message);
    return null;
  }
  return result;
}`}
              </CodeBlock>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Asynchronous Operations
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2">
                ❌ Before (try/catch)
              </h4>
              <CodeBlock language="typescript" title="Traditional async/await">
                {`async function fetchUser(id: string) {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-2">
                ✅ After (try-error)
              </h4>
              <CodeBlock language="typescript" title="tryAsync Approach">
                {`async function fetchUser(id: string) {
  const response = await tryAsync(() => 
    fetch(\`/api/users/\${id}\`)
  );
  if (isTryError(response)) {
    console.error('Fetch failed:', response.message);
    return response; // Return the error
  }
  
  const user = await tryAsync(() => response.json());
  return user; // Could be success or error
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Migration Strategies */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Migration Strategies
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            1. Start with New Code
          </h3>
          <p className="text-slate-600 mb-4">
            Begin using try-error for all new functions and modules. This gives
            you immediate benefits without touching existing code.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            2. Migrate Utility Functions
          </h3>
          <p className="text-slate-600 mb-4">
            Convert small utility functions first. These are usually easier to
            test and have fewer dependencies.
          </p>

          <CodeBlock
            language="typescript"
            title="Easy Migration Target"
            className="mb-4"
          >
            {`// Easy migration target
function safeParseInt(value: string) {
  const result = trySync(() => {
    const num = parseInt(value, 10);
    if (isNaN(num)) throw new Error('Not a valid number');
    return num;
  });
  return isTryError(result) ? 0 : result;
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            3. Migrate API Boundaries
          </h3>
          <p className="text-slate-600 mb-4">
            Convert functions that interact with external APIs, databases, or
            file systems. These benefit most from explicit error handling.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            4. Gradual Refactoring
          </h3>
          <p className="text-slate-600 mb-4">
            When you need to modify existing functions, consider converting them
            to try-error at the same time.
          </p>
        </section>

        {/* Interoperability */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Interoperability
          </h2>

          <p className="text-slate-600 mb-4">
            try-error functions can easily work with traditional try/catch code:
          </p>

          <CodeBlock
            language="typescript"
            title="Interoperability Examples"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// try-error function called from try/catch code
function legacyFunction() {
  try {
    const result = newTryErrorFunction();
    if (isTryError(result)) {
      throw new Error(result.message);
    }
    return result;
  } catch (error) {
    console.error('Legacy error handling:', error);
    throw error;
  }
}

// try/catch function called from try-error code
async function newFunction() {
  const result = await tryAsync(() => legacyAsyncFunction());
  if (isTryError(result)) {
    console.error('Legacy function failed:', result.message);
    return null;
  }
  return result;
}`}
          </CodeBlock>
        </section>

        {/* Common Patterns */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Common Migration Patterns
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Error Propagation
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                Before
              </h4>
              <CodeBlock
                language="typescript"
                title="Traditional Error Propagation"
              >
                {`async function processData() {
  try {
    const data = await fetchData();
    const processed = await processStep1(data);
    const result = await processStep2(processed);
    return result;
  } catch (error) {
    throw error; // Re-throw
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                After
              </h4>
              <CodeBlock
                language="typescript"
                title="try-error Error Propagation"
              >
                {`async function processData() {
  const data = await tryAsync(() => fetchData());
  if (isTryError(data)) return data;
  
  const processed = await tryAsync(() => processStep1(data));
  if (isTryError(processed)) return processed;
  
  const result = await tryAsync(() => processStep2(processed));
  return result; // Success or error
}`}
              </CodeBlock>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Default Values
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                Before
              </h4>
              <CodeBlock
                language="typescript"
                title="Traditional Default Values"
              >
                {`function getConfig() {
  try {
    return JSON.parse(configString);
  } catch {
    return defaultConfig;
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                After
              </h4>
              <CodeBlock language="typescript" title="try-error Default Values">
                {`function getConfig() {
  const result = trySync(() => JSON.parse(configString));
  return isTryError(result) ? defaultConfig : result;
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Testing Migration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Testing During Migration
          </h2>

          <p className="text-slate-600 mb-4">
            Your existing tests should continue to work. For new try-error code,
            test both success and error cases:
          </p>

          <CodeBlock
            language="typescript"
            title="Testing try-error Functions"
            showLineNumbers={true}
            className="mb-4"
          >
            {`describe('parseConfig', () => {
  it('should parse valid JSON', () => {
    const result = parseConfig('{"key": "value"}');
    expect(isTryError(result)).toBe(false);
    if (!isTryError(result)) {
      expect(result.key).toBe('value');
    }
  });

  it('should handle invalid JSON', () => {
    const result = parseConfig('invalid json');
    expect(isTryError(result)).toBe(true);
    if (isTryError(result)) {
      expect(result.message).toContain('JSON');
    }
  });
});`}
          </CodeBlock>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next Steps
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Core Concepts
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Understand the philosophy behind try-error
              </p>
              <a
                href="/docs/concepts/philosophy"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn Concepts →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Examples</h3>
              <p className="text-slate-600 text-sm mb-3">
                See real-world migration examples
              </p>
              <a
                href="/docs/examples/real-world"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Examples →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
