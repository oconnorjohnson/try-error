import {
  InstallCommand,
  CodeBlock,
} from "../../../components/EnhancedCodeBlock";

export default function InstallationPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Installation</h1>
        <p className="text-xl text-slate-600">
          Get started with try-error in your TypeScript project
        </p>
      </div>

      <div className="space-y-8">
        {/* Package Installation */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Package Installation
          </h2>

          <InstallCommand packageName="try-error" className="mb-4" />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Note:</strong> try-error has zero runtime dependencies and
              works with TypeScript 4.5+
            </p>
          </div>
        </section>

        {/* TypeScript Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TypeScript Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            For the best experience, ensure your{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">
              tsconfig.json
            </code>{" "}
            has strict mode enabled:
          </p>

          <CodeBlock language="json" title="tsconfig.json" className="mb-4">
            {`{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}`}
          </CodeBlock>
        </section>

        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Basic Usage
          </h2>

          <p className="text-slate-600 mb-4">
            Import the functions you need and start handling errors safely:
          </p>

          <CodeBlock
            language="typescript"
            title="Basic Example"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { trySync, tryAsync, isTryError } from 'try-error';

// Synchronous operations
const result = trySync(() => JSON.parse(jsonString));
if (isTryError(result)) {
  console.error('Parse failed:', result.message);
} else {
  console.log('Parsed data:', result);
}

// Asynchronous operations
const asyncResult = await tryAsync(() => fetch('/api/data'));
if (isTryError(asyncResult)) {
  console.error('Fetch failed:', asyncResult.message);
} else {
  const data = await asyncResult.json();
}`}
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
                Quick Start Guide
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn the basics with practical examples
              </p>
              <a
                href="/docs/quick-start"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Read Quick Start →
              </a>
            </div>

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
          </div>
        </section>
      </div>
    </div>
  );
}
