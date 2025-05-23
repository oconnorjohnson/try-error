import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">try-error</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            A TypeScript-first error handling library that brings Go-style error
            handling to JavaScript/TypeScript with zero runtime overhead.
          </p>

          {/* Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-blue-800">
              🚀 Zero runtime overhead • Type-safe • Go-inspired • Framework
              agnostic
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold">Zero Overhead</h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-600 text-sm">
                No runtime dependencies or performance impact. Pure TypeScript
                types that compile away.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold">Progressive</h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-600 text-sm">
                Adopt gradually in existing codebases. Works alongside
                traditional try/catch.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold">Type Safe</h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-600 text-sm">
                Full TypeScript support with intelligent type inference and
                compile-time safety.
              </p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Traditional vs try-error */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-red-600 flex items-center gap-2 font-semibold mb-4">
                ❌ Traditional Error Handling
              </h3>
            </div>
            <div className="p-6 pt-0">
              <pre className="bg-slate-50 p-4 rounded text-sm overflow-x-auto">
                <code>{`try {
  const result = await fetchUser(id);
  return result.data;
} catch (error) {
  // What type is error? 🤷‍♂️
  console.error(error);
  throw error;
}`}</code>
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-green-600 flex items-center gap-2 font-semibold mb-4">
                ✅ try-error
              </h3>
            </div>
            <div className="p-6 pt-0">
              <pre className="bg-slate-50 p-4 rounded text-sm overflow-x-auto">
                <code>{`const result = await tryAsync(() => 
  fetchUser(id)
);

if (isTryError(result)) {
  // Fully typed error! 🎉
  console.error(result.message);
  return null;
}

return result; // Typed success value`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Quick Start
          </h2>

          <div className="bg-slate-900 text-slate-100 p-6 rounded-lg max-w-2xl mx-auto mb-8">
            <pre className="text-left">
              <code>{`npm install try-error

import { trySync, isTryError } from 'try-error';

const result = trySync(() => JSON.parse(data));
if (isTryError(result)) {
  console.error('Parse failed:', result.message);
} else {
  console.log('Parsed:', result);
}`}</code>
            </pre>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="h-auto p-4 flex flex-col items-start bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Link href="/docs" className="w-full">
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Documentation
                </h3>
                <p className="text-slate-600 text-sm">
                  Complete guides, API reference, and examples
                </p>
              </div>
            </Link>
          </div>

          <div className="h-auto p-4 flex flex-col items-start bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Link
              href="https://github.com/danieljohnson/try-error"
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 mb-2">GitHub</h3>
                <p className="text-slate-600 text-sm">
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
