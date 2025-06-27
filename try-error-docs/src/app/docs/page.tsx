import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Code2,
  Zap,
  Shield,
} from "lucide-react";
import { CodeBlock } from "../../components/EnhancedCodeBlock";

export default function DocsIntroduction() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Getting Started</Badge>
          <Badge variant="outline">Introduction</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Introduction to tryError
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
          Lightweight, progressive, type-safe error handling for TypeScript that
          bridges the gap between traditional try/catch and heavy functional
          programming approaches.
        </p>
      </div>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Alpha Version:</strong> This library is currently in alpha and
          not ready for production use. APIs may change significantly before the
          stable release.
        </AlertDescription>
      </Alert>

      {/* What is tryError */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">What is tryError?</h2>

        <p className="text-sm sm:text-base text-muted-foreground">
          <strong>tryError</strong> provides <em>errors as values</em> with{" "}
          <strong>zero-overhead success paths</strong>,
          <strong>progressive adoption</strong>, and a{" "}
          <strong>developer-first experience</strong>. It allows you to handle
          errors explicitly without the complexity of monads or the verbosity of
          traditional try/catch blocks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <CardTitle className="text-sm sm:text-base">
                  Minimal Overhead
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs sm:text-sm">
                Success path: &lt;3% overhead. Error path: configurable from 20%
                to 120% depending on configuration.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <CardTitle className="text-sm sm:text-base">
                  Progressive
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs sm:text-sm">
                Start simple, add complexity as needed. No need to rewrite
                existing code.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <CardTitle className="text-sm sm:text-base">
                  Type Safe
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs sm:text-sm">
                Full TypeScript support with discriminated unions and type
                inference.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Problem */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">The Problem</h2>

        <p className="text-sm sm:text-base text-muted-foreground">
          Current TypeScript error handling solutions have significant gaps:
        </p>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
            <div className="text-red-500 mt-0.5 text-sm">❌</div>
            <div className="text-xs sm:text-sm">
              <strong>Traditional try/catch:</strong> Verbose, error-prone, poor
              composability, and makes it easy to forget error handling.
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
            <div className="text-red-500 mt-0.5 text-sm">❌</div>
            <div className="text-xs sm:text-sm">
              <strong>Heavy FP libraries:</strong> Foreign feel for JavaScript
              developers, runtime overhead, steep learning curve.
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
            <div className="text-red-500 mt-0.5 text-sm">❌</div>
            <div className="text-xs sm:text-sm">
              <strong>Existing Result libraries:</strong> Missing async support,
              poor developer experience, limited real-world patterns.
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">The Solution</h2>

        <p className="text-sm sm:text-base text-muted-foreground">
          tryError provides a middle ground that feels natural to
          JavaScript/TypeScript developers while providing the benefits of
          explicit error handling.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-red-600 flex items-center gap-2 text-sm sm:text-base">
                <Code2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Before: Traditional try/catch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="typescript"
                title="Traditional Error Handling"
                className="text-xs sm:text-sm"
              >
                {`try {
  const response = await fetch("/api/user");
  const user = await response.json();
  return user;
} catch (error) {
  console.error("Something failed:", error);
  return null;
}`}
              </CodeBlock>
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                Issues: Easy to forget, unclear error types, poor composability
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-green-600 flex items-center gap-2 text-sm sm:text-base">
                <Code2 className="h-4 w-4 sm:h-5 sm:w-5" />
                After: tryError
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="typescript"
                title="tryError Approach"
                className="text-xs sm:text-sm"
              >
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
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                Benefits: Explicit, type-safe, composable, rich error context
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Performance Characteristics */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Performance Characteristics
        </h2>

        <div className="border border-border rounded-lg p-4 sm:p-6 bg-card">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
            Real-World Performance Impact
          </h3>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  Success Path (Common Case)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-500 border-green-500/20 text-xs"
                  >
                    &lt;3% overhead
                  </Badge>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    vs raw try/catch
                  </span>
                </div>
                <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>• Direct value return, no wrapper objects</li>
                  <li>• No performance penalty for successful operations</li>
                  <li>• Ideal for hot paths and performance-critical code</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  Error Path (Exceptional Case)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs"
                  >
                    20%-120% overhead
                  </Badge>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    configurable
                  </span>
                </div>
                <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>• Stack trace capture: ~65% of total overhead</li>
                  <li>• Context cloning: ~25% of total overhead</li>
                  <li>• Source location: ~10% of total overhead</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-4 sm:mt-6 border-blue-500/20 bg-blue-500/5">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <strong className="text-foreground text-sm">
                    Why the Error Overhead?
                  </strong>
                </div>
                <p className="text-xs sm:text-sm">
                  Error overhead is high because tryError captures rich
                  debugging information:
                </p>
                <ul className="space-y-1 text-xs sm:text-sm">
                  <li>
                    • <strong>Stack traces:</strong> Essential for debugging but
                    expensive to capture
                  </li>
                  <li>
                    • <strong>Source location:</strong> Shows exactly where
                    errors occurred
                  </li>
                  <li>
                    • <strong>Context objects:</strong> Preserves state at error
                    time
                  </li>
                  <li>
                    • <strong>Timestamps:</strong> Tracks when errors happened
                  </li>
                </ul>
                <div className="pt-2 border-t border-border mt-2 sm:mt-3">
                  <p className="text-xs sm:text-sm">
                    <strong>
                      This is usually fine because errors should be exceptional!
                    </strong>{" "}
                    If you have high error rates, use{" "}
                    <code className="bg-muted px-1 sm:px-1.5 py-0.5 rounded text-xs font-mono">
                      ConfigPresets.minimal()
                    </code>{" "}
                    for &lt;20% overhead.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Key Benefits</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>Errors as Values:</strong> No hidden control flow,
                explicit error handling
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>Minimal Overhead:</strong> Success path &lt;3%, error
                path configurable (20%-120%)
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>Rich Error Context:</strong> Source location,
                timestamps, custom context
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>Composable:</strong> Chain operations, combine results,
                transform errors
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>TypeScript Native:</strong> Full type inference and
                safety
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>Progressive:</strong> Adopt incrementally, no big
                rewrites
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Advanced Features</h2>

        <p className="text-sm sm:text-base text-muted-foreground">
          tryError goes beyond basic error handling with powerful performance
          optimizations and extensibility features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">
                🚀 Performance Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs sm:text-sm">
                Object pooling, lazy evaluation, and configurable performance
                profiles for high-throughput applications.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">
                🔌 Plugin System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs sm:text-sm">
                Extend tryError with custom error types, middleware, and
                integrations without modifying core.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">
                🎯 Middleware Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs sm:text-sm">
                Intercept and transform errors with composable middleware for
                logging, retry, and monitoring.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs sm:text-sm"
          >
            <a href="/docs/guides/performance-optimization">
              Learn about Performance →
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs sm:text-sm"
          >
            <a href="/docs/guides/middleware">Explore Middleware →</a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs sm:text-sm"
          >
            <a href="/docs/guides/plugins">Discover Plugins →</a>
          </Button>
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Next Steps</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Button
            className="h-auto p-3 sm:p-4 flex flex-col items-start text-left"
            asChild
          >
            <a href="/docs/installation">
              <div className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                Installation <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                Get tryError installed in your project
              </div>
            </a>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 sm:p-4 flex flex-col items-start text-left"
            asChild
          >
            <a href="/docs/quick-start">
              <div className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                Quick Start <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                5-minute tutorial with examples
              </div>
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
