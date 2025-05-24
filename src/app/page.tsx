import Link from "next/link";
import { CodeBlock } from "../../components/EnhancedCodeBlock";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-100 mb-6">try-error</h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A TypeScript-first error handling library that brings Go-style error
            handling to JavaScript/TypeScript with zero runtime overhead.
          </p>

          {/* Alert */}
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-blue-200">
              🚀 Zero runtime overhead • Type-safe • Go-inspired • Framework
              agnostic
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-slate-100">
                  Zero Overhead
                </h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-300 text-sm">
                No runtime dependencies or performance impact. Pure TypeScript
                types that compile away.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-slate-100">
                  Progressive
                </h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-300 text-sm">
                Adopt gradually in existing codebases. Works alongside
                traditional try/catch.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-slate-100">
                  Type Safe
                </h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-300 text-sm">
                Full TypeScript support with intelligent type inference and
                compile-time safety.
              </p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Traditional vs try-error */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <div className="p-6">
              <h3 className="text-red-400 flex items-center gap-2 font-semibold mb-4">
                ❌ Traditional Error Handling
              </h3>
            </div>
            <div className="p-6 pt-0">
              <CodeBlock language="typescript" className="text-sm">
                {`try {
  const result = await fetchUser(id);
  return result.data;
} catch (error) {
  // What type is error? 🤷‍♂️
  console.error(error);
  throw error;
}`}
              </CodeBlock>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <div className="p-6">
              <h3 className="text-green-400 flex items-center gap-2 font-semibold mb-4">
                ✅ try-error
              </h3>
            </div>
            <div className="p-6 pt-0">
              <CodeBlock language="typescript" className="text-sm">
                {`const result = await tryAsync(() => 
  fetchUser(id)
);

if (isTryError(result)) {
  // Fully typed error! 🎉
  console.error(result.message);
  return null;
}

return result; // Typed success value`}
              </CodeBlock>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-8">
            Quick Start
          </h2>

          <div className="max-w-2xl mx-auto mb-8">
            <CodeBlock
              language="bash"
              title="Installation & Usage"
              className="text-left"
            >
              {`npm install try-error

import { trySync, isTryError } from 'try-error';

const result = trySync(() => JSON.parse(data));
if (isTryError(result)) {
  console.error('Parse failed:', result.message);
} else {
  console.log('Parsed:', result);
}`}
            </CodeBlock>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="h-auto p-4 flex flex-col items-start bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
            <Link href="/docs" className="w-full">
              <div className="text-left">
                <h3 className="font-semibold text-slate-100 mb-2">
                  Documentation
                </h3>
                <p className="text-slate-300 text-sm">
                  Complete guides, API reference, and examples
                </p>
              </div>
            </Link>
          </div>

          <div className="h-auto p-4 flex flex-col items-start bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
            <Link
              href="https://github.com/danieljohnson/try-error"
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="text-left">
                <h3 className="font-semibold text-slate-100 mb-2">GitHub</h3>
                <p className="text-slate-300 text-sm">
                  Source code, issues, and contributions
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
