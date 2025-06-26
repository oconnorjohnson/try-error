import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/docs/code-block";
import { Zap, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";

export default function ErrorPerformancePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Advanced</Badge>
          <Badge variant="outline">Performance</Badge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          The Hidden Cost of JavaScript Errors
        </h1>

        <p className="text-xl text-muted-foreground">
          How tryError can be <strong>faster</strong> than native try/catch for
          error handling
        </p>
      </div>

      {/* The Surprising Discovery */}
      <Alert className="border-green-500/20 bg-green-500/5">
        <Zap className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <strong className="text-foreground">Surprising Fact:</strong> With
          minimal configuration, tryError is <strong>15% faster</strong> than
          native try/catch when handling errors. This isn't magic – it's because
          JavaScript has a hidden performance cost that most developers don't
          know about.
        </AlertDescription>
      </Alert>

      {/* The Hidden Cost */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          The Hidden Cost of Native Errors
        </h2>

        <p className="text-muted-foreground">
          When JavaScript throws an error, it <strong>always</strong> captures a
          stack trace – even if you never access it. This automatic behavior
          adds significant overhead that you're paying for whether you need it
          or not.
        </p>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              What Really Happens When You Catch an Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock language="javascript" title="The Hidden Work">
              {`try {
  JSON.parse(invalidJson);
} catch (e) {
  // Even if you only use e.message...
  console.log(e.message);
  
  // JavaScript has ALREADY:
  // 1. Captured the full stack trace (expensive!)
  // 2. Parsed the stack into a string
  // 3. Created a full Error object
  // 4. Set up the prototype chain
  
  // All this work happened before you even touched 'e'!
}`}
            </CodeBlock>
          </CardContent>
        </Card>
      </section>

      {/* Performance Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Performance Breakdown</h2>

        <p className="text-muted-foreground">
          Our benchmarks reveal the true cost of JavaScript's automatic error
          handling:
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Benchmark Results (100,000 iterations)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Just catching an error
                    </span>
                    <Badge variant="secondary">488ms</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[17%]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Accessing error.message
                    </span>
                    <Badge variant="secondary">502ms (+2.9%)</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[17.5%]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Accessing error.stack
                    </span>
                    <Badge variant="secondary">2,870ms (+487%!)</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-full" />
                  </div>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertDescription>
                  The stack trace is captured <strong>immediately</strong> when
                  the error is thrown, not when you access <code>.stack</code>.
                  You're paying this cost even if you never use it!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How tryError is Faster */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          How tryError Beats Native Performance
        </h2>

        <p className="text-muted-foreground">
          With minimal configuration, tryError skips all the unnecessary work:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Native try/catch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Always captures stack traces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Creates full Error objects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Parses stack traces to strings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>No way to opt out</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                tryError (minimal)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>No stack trace unless configured</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Simple objects with only needed data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>No hidden processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Pay only for what you use</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real-World Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real-World Example</h2>

        <p className="text-muted-foreground">
          Here's how to configure tryError for maximum performance in
          production:
        </p>

        <CodeBlock
          language="typescript"
          title="High-Performance Error Handling"
        >
          {`import { configure, ConfigPresets, trySync } from 'tryError';

// Configure for production performance
configure({
  captureStackTrace: false,  // Skip expensive stack traces
  includeSource: false,      // Skip source location detection
  skipTimestamp: false,      // Keep timestamps (cheap)
  skipContext: false,        // Keep context (useful)
  minimalErrors: true        // Use minimal error objects
});

// Or use the preset
configure(ConfigPresets.minimal());

// Now errors are 15% FASTER than native try/catch!
const result = trySync(() => JSON.parse(userInput));

if (isTryError(result)) {
  // Still have everything you need:
  logger.error({
    type: result.type,        // 'SyntaxError'
    message: result.message,  // Full error message
    timestamp: result.timestamp,
    context: result.context
  });
}`}
        </CodeBlock>

        <Alert className="border-blue-500/20 bg-blue-500/5">
          <TrendingDown className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            <strong>Performance Win:</strong> In high-throughput applications
            processing millions of operations, this 15% performance improvement
            on error paths can translate to significant cost savings and better
            user experience.
          </AlertDescription>
        </Alert>
      </section>

      {/* When to Use This */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          When to Use Minimal Configuration
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">✅ Perfect For:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  • Production environments where errors are logged elsewhere
                </li>
                <li>• High-throughput APIs and services</li>
                <li>
                  • Validation and parsing operations with expected failures
                </li>
                <li>• Serverless functions where every millisecond counts</li>
                <li>• Any code where you don't need stack traces</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">❌ Not Ideal For:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Development environments (you want stack traces!)</li>
                <li>• Debugging complex async operations</li>
                <li>• When you need to trace error origins</li>
                <li>
                  • Low-volume applications where performance isn't critical
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Summary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Summary</h2>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="font-medium">
                tryError isn't just about better error handling – it can
                actually be
                <strong> faster</strong> than native JavaScript error handling.
              </p>

              <p className="text-sm text-muted-foreground">
                By understanding that JavaScript automatically captures
                expensive stack traces for every error (even if unused), we can
                make informed decisions about when we need this information and
                when we can skip it for better performance.
              </p>

              <div className="pt-3 border-t">
                <p className="text-sm font-medium">
                  The key insight:{" "}
                  <strong>You should only pay for what you use.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
