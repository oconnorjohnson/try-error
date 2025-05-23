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
    <div className="container mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6 py-12">
        <Badge variant="secondary" className="px-3 py-1">
          🚧 Alpha Version - Not Production Ready
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Type-Safe Error Handling
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-3xl">
          Lightweight, progressive, type-safe error handling for TypeScript.
          Bridge the gap between try/catch and heavy functional programming with
          <strong> zero-overhead success paths</strong>.
        </p>

        <div className="flex gap-4">
          <Button size="lg" asChild>
            <a href="/docs/quick-start">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/docs">View Documentation</a>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Zero Overhead</CardTitle>
            </div>
            <CardDescription>
              Success values are returned directly with no wrapping. Error
              objects only created when needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div className="text-green-600">// Success: Direct return</div>
              <div>const result = trySync(() =&gt; parse(data));</div>
              <div className="text-green-600">
                // result is ParsedData | TryError
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <CardTitle>Progressive Adoption</CardTitle>
            </div>
            <CardDescription>
              Start simple with basic error handling, add complexity as needed.
              No need to rewrite existing code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div className="text-green-600">// Start simple</div>
              <div>const result = trySync(() =&gt; operation());</div>
              <div className="text-green-600">
                // Add retry, timeout, etc. later
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>TypeScript First</CardTitle>
            </div>
            <CardDescription>
              Full type inference, discriminated unions, and strict null checks.
              Built for TypeScript developers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div>if (isTryError(result)) &#123;</div>
              <div className="ml-2 text-red-600">// result is TryError</div>
              <div>&#125; else &#123;</div>
              <div className="ml-2 text-green-600">
                // result is success type
              </div>
              <div>&#125;</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Example */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          See It In Action
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">
                ❌ Before: Traditional try/catch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`try {
  const response = await fetch("/api/user");
  const user = await response.json();
  return user;
} catch (error) {
  console.error("Something failed:", error);
  return null;
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">
                ✅ After: try-error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">Quick Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            asChild
          >
            <a href="/docs/installation">
              <div className="font-semibold">Installation</div>
              <div className="text-sm text-muted-foreground">
                Get up and running
              </div>
            </a>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            asChild
          >
            <a href="/docs/api/sync">
              <div className="font-semibold">API Reference</div>
              <div className="text-sm text-muted-foreground">
                Complete function docs
              </div>
            </a>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            asChild
          >
            <a href="/docs/react">
              <div className="font-semibold">React Integration</div>
              <div className="text-sm text-muted-foreground">
                Hooks and components
              </div>
            </a>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            asChild
          >
            <a href="/docs/examples/basic">
              <div className="font-semibold">Examples</div>
              <div className="text-sm text-muted-foreground">
                Real-world usage
              </div>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
