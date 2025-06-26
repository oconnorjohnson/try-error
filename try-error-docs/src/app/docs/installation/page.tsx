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

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <p className="text-green-800">
              <strong>Performance:</strong> try-error adds &lt;3% overhead to
              successful operations. Error handling overhead (20%-120%) is
              configurable based on your debugging needs. No configuration
              required to start!
            </p>
          </div>
        </section>

        {/* Modular Imports */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Modular Imports for Smaller Bundles
          </h2>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-slate-700 text-sm mb-2">
              <strong>📦 One Package, Multiple Entry Points:</strong>
            </p>
            <p className="text-slate-600 text-sm mb-3">
              You install the same{" "}
              <code className="bg-slate-200 px-1 py-0.5 rounded">
                try-error
              </code>{" "}
              package regardless of which module you use. The different imports
              are just entry points within the package.
            </p>
            <InstallCommand packageName="try-error" className="mt-2" />
          </div>

          <p className="text-slate-600 mb-4">
            After installation, choose the import that best fits your needs.
            Hover over any code block below to copy the import statement:
          </p>

          <div className="grid gap-4 mb-6">
            <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">
                  Full Bundle (Default)
                </h3>
                <span className="text-xs text-slate-500">Hover to copy →</span>
              </div>
              <CodeBlock language="typescript" className="mb-2">
                {`import { trySync, tryAsync, isTryError } from 'try-error';`}
              </CodeBlock>
              <p className="text-sm text-slate-600">
                ~8KB minified • Use when you need both sync and async operations
              </p>
            </div>

            <div className="border border-green-200 bg-green-50 rounded-lg p-4 hover:border-green-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-900">
                  Sync-Only Module
                </h3>
                <span className="text-xs text-green-700">Hover to copy →</span>
              </div>
              <CodeBlock language="typescript" className="mb-2">
                {`import { trySync, isTryError } from 'try-error/sync';`}
              </CodeBlock>
              <p className="text-sm text-green-800">
                ~4KB minified (50% smaller!) • Perfect for CLI tools, scripts,
                or sync-only apps
              </p>
            </div>

            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900">
                  Async-Only Module
                </h3>
                <span className="text-xs text-blue-700">Hover to copy →</span>
              </div>
              <CodeBlock language="typescript" className="mb-2">
                {`import { tryAsync, isTryError } from 'try-error/async';`}
              </CodeBlock>
              <p className="text-sm text-blue-800">
                ~4KB minified (50% smaller!) • Ideal for modern async-first
                applications
              </p>
            </div>

            <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-purple-900">Core Module</h3>
                <span className="text-xs text-purple-700">Hover to copy →</span>
              </div>
              <CodeBlock language="typescript" className="mb-2">
                {`import { isTryError, createError } from 'try-error/core';`}
              </CodeBlock>
              <p className="text-sm text-purple-800">
                ~3KB minified • For building custom error handling utilities
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              <strong>Tree-shaking:</strong> Modern bundlers (webpack, rollup,
              esbuild, vite) will automatically eliminate unused code when using
              modular imports.
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
