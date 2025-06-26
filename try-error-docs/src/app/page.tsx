import { Github } from "lucide-react";
import { CodeBlock } from "@/components/EnhancedCodeBlock";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-6xl p-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6 py-12">
        <div className="px-3 py-1 bg-yellow-900/50 text-yellow-200 rounded-full text-sm border border-yellow-700">
          🚧 Alpha Version - Not Production Ready
        </div>
        <div className="flex flex-row items-center justify-center">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="try-error logo"
            width={96}
            height={96}
            className="w-16 h-16 md:w-24 md:h-24"
          />
          <h1 className="text-2xl lg:text-4xl font-light">try-error</h1>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-slate-100">
          Type-Safe Error Handling
          <br />
          <span className="text-blue-400">Made Simple</span>
        </h1>

        <p className="text-xl text-slate-300 max-w-3xl">
          Lightweight, progressive, type-safe error handling for TypeScript.
          Bridge the gap between try/catch and heavy functional programming with
          <strong> zero-overhead success paths</strong>.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="/docs/quick-start"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started →
          </a>
          <a
            href="/docs"
            className="px-6 py-3 border border-slate-600 text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            View Documentation
          </a>
          <a
            href="https://github.com/oconnorjohnson/try-error"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-600 text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <div className="p-6 border border-slate-700 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-yellow-900/50 rounded-lg flex items-center justify-center">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-slate-100">
              Zero Overhead
            </h3>
          </div>
          <p className="text-slate-300 mb-4">
            Success values are returned directly with no wrapping. Error objects
            only created when needed.
          </p>
          <CodeBlock language="typescript" className="text-sm">
            {`// Success: Direct return
const result = trySync(() => parse(data));
// result is ParsedData | TryError`}
          </CodeBlock>
        </div>

        <div className="p-6 border border-slate-700 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center">
              ✅
            </div>
            <h3 className="text-lg font-semibold text-slate-100">
              Progressive Adoption
            </h3>
          </div>
          <p className="text-slate-300 mb-4">
            Start simple with basic error handling, add complexity as needed. No
            need to rewrite existing code.
          </p>
          <CodeBlock language="typescript" className="text-sm">
            {`// Start simple
const result = trySync(() => operation());
// Add retry, timeout, etc. later`}
          </CodeBlock>
        </div>

        <div className="p-6 border border-slate-700 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center">
              🛡️
            </div>
            <h3 className="text-lg font-semibold text-slate-100">
              TypeScript First
            </h3>
          </div>
          <p className="text-slate-300 mb-4">
            Full type inference, discriminated unions, and strict null checks.
            Built for TypeScript developers.
          </p>
          <CodeBlock language="typescript" className="text-sm">
            {`if (isTryError(result)) {
  // result is TryError
} else {
  // result is success type
}`}
          </CodeBlock>
        </div>
      </div>

      {/* Code Example */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-100">
          See It In Action
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-slate-700 bg-slate-800 rounded-lg">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-red-400">
                ❌ Before: Traditional try/catch
              </h3>
            </div>
            <div className="p-4">
              <CodeBlock language="typescript" className="text-sm">
                {`try {
  const response = await fetch("/api/user");
  const user = await response.json();
  return user;
} catch (error) {
  console.error("Something failed:", error);
  return null;
}`}
              </CodeBlock>
            </div>
          </div>

          <div className="border border-slate-700 bg-slate-800 rounded-lg">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-green-400">
                ✅ After: try-error
              </h3>
            </div>
            <div className="p-4">
              <CodeBlock language="typescript" className="text-sm">
                {`const result = await tryAsync(async () => {
  const response = await fetch("/api/user");
  return response.json();
});

if (isTryError(result)) {
  console.error("API failed:", result.message);
  return null;
}

return result; // Type-safe success value`}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-12 border-t border-slate-700">
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-100">
          Quick Links
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/docs/installation"
            className="p-4 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="font-semibold text-slate-100">Installation</div>
            <div className="text-sm text-slate-300">Get up and running</div>
          </a>

          <a
            href="/docs/api/sync"
            className="p-4 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="font-semibold text-slate-100">API Reference</div>
            <div className="text-sm text-slate-300">Complete function docs</div>
          </a>

          <a
            href="/docs/react"
            className="p-4 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="font-semibold text-slate-100">
              React Integration
            </div>
            <div className="text-sm text-slate-300">Hooks and components</div>
          </a>

          <a
            href="/docs/examples/basic"
            className="p-4 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="font-semibold text-slate-100">Examples</div>
            <div className="text-sm text-slate-300">Real-world usage</div>
          </a>
        </div>
      </div>
    </div>
  );
}
