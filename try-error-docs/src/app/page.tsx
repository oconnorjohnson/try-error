import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Code, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-6xl p-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6 py-12">
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          🚧 Alpha Version - Not Production Ready
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Type-Safe Error Handling
          <br />
          <span className="text-blue-600">Made Simple</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl">
          Lightweight, progressive, type-safe error handling for TypeScript.
          Bridge the gap between try/catch and heavy functional programming with
          <strong> zero-overhead success paths</strong>.
        </p>

        <div className="flex gap-4">
          <a
            href="/docs/quick-start"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started →
          </a>
          <a
            href="/docs"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              ⚡
            </div>
            <h3 className="text-lg font-semibold">Zero Overhead</h3>
          </div>
          <p className="text-gray-600">
            Success values are returned directly with no wrapping. Error objects
            only created when needed.
          </p>
          <div className="mt-4 bg-gray-100 p-3 rounded text-sm font-mono">
            <div className="text-green-600">// Success: Direct return</div>
            <div>const result = trySync(() =&gt; parse(data));</div>
            <div className="text-green-600">
              // result is ParsedData | TryError
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
            <h3 className="text-lg font-semibold">Progressive Adoption</h3>
          </div>
          <p className="text-gray-600">
            Start simple with basic error handling, add complexity as needed. No
            need to rewrite existing code.
          </p>
          <div className="mt-4 bg-gray-100 p-3 rounded text-sm font-mono">
            <div className="text-green-600">// Start simple</div>
            <div>const result = trySync(() =&gt; operation());</div>
            <div className="text-green-600">
              // Add retry, timeout, etc. later
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              🛡️
            </div>
            <h3 className="text-lg font-semibold">TypeScript First</h3>
          </div>
          <p className="text-gray-600">
            Full type inference, discriminated unions, and strict null checks.
            Built for TypeScript developers.
          </p>
          <div className="mt-4 bg-gray-100 p-3 rounded text-sm font-mono">
            <div>if (isTryError(result)) &#123;</div>
            <div className="ml-2 text-red-600">// result is TryError</div>
            <div>&#125; else &#123;</div>
            <div className="ml-2 text-green-600">// result is success type</div>
            <div>&#125;</div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          See It In Action
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-red-600">
                ❌ Before: Traditional try/catch
              </h3>
            </div>
            <div className="p-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {`try {
  const response = await fetch("/api/user");
  const user = await response.json();
  return user;
} catch (error) {
  console.error("Something failed:", error);
  return null;
}`}
              </pre>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-green-600">
                ✅ After: try-error
              </h3>
            </div>
            <div className="p-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {`const result = await tryAsync(async () => {
  const response = await fetch("/api/user");
  return response.json();
});

if (isTryError(result)) {
  console.error("API failed:", result.message);
  return null;
}

return result; // Type-safe success value`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">Quick Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/docs/installation"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold">Installation</div>
            <div className="text-sm text-gray-600">Get up and running</div>
          </a>

          <a
            href="/docs/api/sync"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold">API Reference</div>
            <div className="text-sm text-gray-600">Complete function docs</div>
          </a>

          <a
            href="/docs/react"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold">React Integration</div>
            <div className="text-sm text-gray-600">Hooks and components</div>
          </a>

          <a
            href="/docs/examples/basic"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold">Examples</div>
            <div className="text-sm text-gray-600">Real-world usage</div>
          </a>
        </div>
      </div>
    </div>
  );
}
