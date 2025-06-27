import {
  Github,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Code2,
  Sparkles,
} from "lucide-react";
import { CodeBlock } from "@/components/EnhancedCodeBlock";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with gradient background */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-brand-secondary/10 to-brand-accent/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="container mx-auto max-w-6xl p-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 py-20">
            {/* Alpha badge with glow effect */}
            <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full text-sm border border-amber-500/30 backdrop-blur-sm animate-fade-in">
              <Sparkles className="inline-block w-4 h-4 mr-1" />
              Alpha Version - Not Production Ready
            </div>

            {/* Logo with subtle animation */}
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-primary/20 blur-3xl" />
              <Image
                src="/logo.png"
                alt="tryError logo"
                width={120}
                height={120}
                className="w-32 h-32 md:w-40 md:h-40 relative z-10"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-slide-in-from-bottom">
              <span className="gradient-text">Type-Safe Error Handling</span>
              <br />
              <span className="text-foreground/80">Made Simple</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl animate-slide-in-from-bottom animation-delay-100">
              Lightweight, progressive, type-safe error handling for TypeScript.
              Bridge the gap between try/catch and heavy functional programming
              with
              <strong className="text-foreground">
                {" "}
                zero-overhead success paths
              </strong>
              .
            </p>

            <div className="flex gap-4 flex-wrap justify-center animate-slide-in-from-bottom animation-delay-200">
              <a
                href="/docs/quick-start"
                className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/docs"
                className="px-8 py-4 border border-border bg-card/50 backdrop-blur-sm rounded-lg hover:bg-card hover:border-primary/50 transition-all duration-300 font-medium"
              >
                View Documentation
              </a>
              <a
                href="https://github.com/oconnorjohnson/tryError"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border bg-card/50 backdrop-blur-sm rounded-lg hover:bg-card hover:border-primary/50 transition-all duration-300 font-medium"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid with enhanced cards */}
      <div className="container mx-auto max-w-6xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-20">
          <div className="group p-8 border border-border bg-card rounded-xl hover:border-primary/50 transition-all duration-300 card-hover animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold">Zero Overhead</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Success values are returned directly with no wrapping. Error
              objects only created when needed.
            </p>
            <div className="rounded-lg overflow-hidden bg-muted/50">
              <CodeBlock language="typescript" className="text-sm">
                {`// Success: Direct return
const result = trySync(() => parse(data));
// result is ParsedData | TryError`}
              </CodeBlock>
            </div>
          </div>

          <div className="group p-8 border border-border bg-card rounded-xl hover:border-primary/50 transition-all duration-300 card-hover animate-fade-in animation-delay-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Progressive Adoption</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Start simple with basic error handling, add complexity as needed.
              No need to rewrite existing code.
            </p>
            <div className="rounded-lg overflow-hidden bg-muted/50">
              <CodeBlock language="typescript" className="text-sm">
                {`// Start simple
const result = trySync(() => operation());
// Add retry, timeout, etc. later`}
              </CodeBlock>
            </div>
          </div>

          <div className="group p-8 border border-border bg-card rounded-xl hover:border-primary/50 transition-all duration-300 card-hover animate-fade-in animation-delay-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">TypeScript First</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Full type inference, discriminated unions, and strict null checks.
              Built for TypeScript developers.
            </p>
            <div className="rounded-lg overflow-hidden bg-muted/50">
              <CodeBlock language="typescript" className="text-sm">
                {`if (isTryError(result)) {
  // result is TryError
} else {
  // result is success type
}`}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example with enhanced styling */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl p-8">
          <h2 className="text-4xl font-bold text-center mb-4 animate-fade-in">
            See It In Action
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg animate-fade-in animation-delay-100">
            Compare traditional error handling with tryError's approach
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-destructive/30 bg-card rounded-xl overflow-hidden animate-slide-in-from-left">
              <div className="p-6 bg-destructive/10 border-b border-destructive/30">
                <h3 className="text-xl font-semibold text-destructive flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Before: Traditional try/catch
                </h3>
              </div>
              <div className="p-6">
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

            <div className="border border-green-500/30 bg-card rounded-xl overflow-hidden animate-slide-in-from-right">
              <div className="p-6 bg-green-500/10 border-b border-green-500/30">
                <h3 className="text-xl font-semibold text-green-500 flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  After: tryError
                </h3>
              </div>
              <div className="p-6">
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
      </div>

      {/* Quick Links with enhanced cards */}
      <div className="container mx-auto max-w-6xl p-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Quick Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="/docs/installation"
            className="group p-6 border border-border bg-card rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              Installation
            </div>
            <div className="text-sm text-muted-foreground">
              Get up and running
            </div>
          </a>

          <a
            href="/docs/api/sync"
            className="group p-6 border border-border bg-card rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              API Reference
            </div>
            <div className="text-sm text-muted-foreground">
              Complete function docs
            </div>
          </a>

          <a
            href="/docs/react"
            className="group p-6 border border-border bg-card rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              React Integration
            </div>
            <div className="text-sm text-muted-foreground">
              Hooks and components
            </div>
          </a>

          <a
            href="/docs/examples/basic"
            className="group p-6 border border-border bg-card rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              Examples
            </div>
            <div className="text-sm text-muted-foreground">
              Real-world usage
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
