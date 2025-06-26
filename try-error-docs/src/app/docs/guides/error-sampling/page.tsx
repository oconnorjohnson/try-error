import { CodeBlock } from "../../../../components/EnhancedCodeBlock";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ErrorSamplingPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Error Sampling Guide
        </h1>
        <p className="text-xl text-slate-600">
          Implement intelligent error sampling to control costs and reduce noise
          in production while maintaining visibility into critical issues
        </p>
      </div>

      {/* Introduction */}
      <section className="mb-12">
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Why sample errors?</strong> In high-traffic applications,
            sending every error to monitoring services can be expensive and
            noisy. Sampling helps you balance visibility with cost and
            performance.
          </AlertDescription>
        </Alert>

        <p className="text-slate-600 mb-4">
          try-error's <code>onError</code> hook provides the perfect integration
          point for implementing custom sampling strategies. This guide shows
          various sampling approaches you can use based on your needs.
        </p>
      </section>

      {/* Basic Random Sampling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Basic Random Sampling
        </h2>

        <p className="text-slate-600 mb-4">
          The simplest approach: randomly sample a percentage of errors.
        </p>

        <CodeBlock
          language="typescript"
          title="Random Sampling (10% of errors)"
          showLineNumbers={true}
          className="mb-4"
        >
          {`import { configure } from 'try-error';
import * as Sentry from '@sentry/nextjs';

// Sample 10% of errors randomly
const SAMPLE_RATE = 0.1;

configure({
  onError: (error) => {
    // Always log critical errors
    if (error.type === 'PaymentError' || error.type === 'SecurityError') {
      Sentry.captureException(error);
      return error;
    }

    // Random sampling for other errors
    if (Math.random() < SAMPLE_RATE) {
      Sentry.captureException(error, {
        tags: {
          sampled: true,
          sampleRate: SAMPLE_RATE,
        },
      });
    }

    return error;
  },
});`}
        </CodeBlock>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            When to use random sampling
          </h4>
          <ul className="space-y-1 text-blue-700 text-sm">
            <li>• You have uniform error distribution</li>
            <li>• You want a simple, predictable cost model</li>
            <li>• You don't need to catch every unique error</li>
          </ul>
        </div>
      </section>

      {/* Rate-Based Sampling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Rate-Based Sampling
        </h2>

        <p className="text-slate-600 mb-4">
          Limit the number of errors sent per time window to control costs
          during error spikes.
        </p>

        <CodeBlock
          language="typescript"
          title="Rate Limiter Implementation"
          showLineNumbers={true}
          className="mb-4"
        >
          {`class ErrorRateLimiter {
  private counts = new Map<string, number>();
  private windowStart = Date.now();
  
  constructor(
    private maxPerMinute: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  shouldSample(errorType: string): boolean {
    const now = Date.now();
    
    // Reset window if expired
    if (now - this.windowStart > this.windowMs) {
      this.counts.clear();
      this.windowStart = now;
    }
    
    const count = this.counts.get(errorType) || 0;
    
    if (count >= this.maxPerMinute) {
      return false;
    }
    
    this.counts.set(errorType, count + 1);
    return true;
  }
  
  getRemainingQuota(errorType: string): number {
    const count = this.counts.get(errorType) || 0;
    return Math.max(0, this.maxPerMinute - count);
  }
}

// Usage with try-error
const rateLimiter = new ErrorRateLimiter(100); // 100 errors per minute

configure({
  onError: (error) => {
    if (rateLimiter.shouldSample(error.type)) {
      Sentry.captureException(error, {
        tags: {
          sampled: true,
          samplingMethod: 'rate-limit',
          remainingQuota: rateLimiter.getRemainingQuota(error.type),
        },
      });
    } else {
      // Still log locally or to a cheaper service
      console.warn(\`Rate limited: \${error.type}\`, {
        message: error.message,
        timestamp: error.timestamp,
      });
    }
    
    return error;
  },
});`}
        </CodeBlock>
      </section>

      {/* Intelligent Sampling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Intelligent Sampling Strategies
        </h2>

        <p className="text-slate-600 mb-4">
          More sophisticated approaches that ensure you capture important errors
          while reducing noise.
        </p>

        <Tabs defaultValue="fingerprint" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fingerprint">Error Fingerprinting</TabsTrigger>
            <TabsTrigger value="adaptive">Adaptive Sampling</TabsTrigger>
            <TabsTrigger value="priority">Priority-Based</TabsTrigger>
          </TabsList>

          <TabsContent value="fingerprint">
            <Card>
              <CardHeader>
                <CardTitle>Error Fingerprinting</CardTitle>
                <CardDescription>
                  Sample unique errors more aggressively than duplicates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="typescript"
                  title="Fingerprint-based Sampling"
                  showLineNumbers={true}
                >
                  {`class ErrorFingerprinter {
  private seenErrors = new Map<string, {
    count: number;
    firstSeen: number;
    lastSeen: number;
  }>();
  
  private generateFingerprint(error: TryError): string {
    // Create a unique fingerprint based on error characteristics
    return \`\${error.type}:\${error.message}:\${error.source}\`;
  }
  
  shouldSample(error: TryError): boolean {
    const fingerprint = this.generateFingerprint(error);
    const seen = this.seenErrors.get(fingerprint);
    
    if (!seen) {
      // Always sample first occurrence
      this.seenErrors.set(fingerprint, {
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
      });
      return true;
    }
    
    // Update stats
    seen.count++;
    seen.lastSeen = Date.now();
    
    // Sample logic: decreasing probability for repeated errors
    // 100% for first, 50% for second, 10% for third, 1% after that
    const sampleRates = [1, 0.5, 0.1, 0.01];
    const rate = sampleRates[Math.min(seen.count - 1, sampleRates.length - 1)];
    
    return Math.random() < rate;
  }
  
  getErrorStats(error: TryError) {
    const fingerprint = this.generateFingerprint(error);
    return this.seenErrors.get(fingerprint);
  }
}

const fingerprinter = new ErrorFingerprinter();

configure({
  onError: (error) => {
    const shouldSample = fingerprinter.shouldSample(error);
    const stats = fingerprinter.getErrorStats(error);
    
    if (shouldSample) {
      Sentry.captureException(error, {
        tags: {
          sampled: true,
          errorCount: stats?.count || 1,
          samplingMethod: 'fingerprint',
        },
        extra: {
          firstSeen: stats?.firstSeen,
          lastSeen: stats?.lastSeen,
        },
      });
    }
    
    return error;
  },
});`}
                </CodeBlock>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adaptive">
            <Card>
              <CardHeader>
                <CardTitle>Adaptive Sampling</CardTitle>
                <CardDescription>
                  Automatically adjust sampling rates based on error volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="typescript"
                  title="Adaptive Sampling System"
                  showLineNumbers={true}
                >
                  {`class AdaptiveSampler {
  private errorCounts = new Map<string, number>();
  private totalErrors = 0;
  private windowStart = Date.now();
  
  constructor(
    private targetErrorsPerMinute: number = 1000,
    private windowMs: number = 60000
  ) {}
  
  private resetIfNeeded() {
    const now = Date.now();
    if (now - this.windowStart > this.windowMs) {
      this.errorCounts.clear();
      this.totalErrors = 0;
      this.windowStart = now;
    }
  }
  
  getSampleRate(errorType: string): number {
    this.resetIfNeeded();
    
    // Base sampling rate
    let rate = 1.0;
    
    // Adjust based on total volume
    if (this.totalErrors > this.targetErrorsPerMinute) {
      rate = this.targetErrorsPerMinute / this.totalErrors;
    }
    
    // Adjust based on error type frequency
    const typeCount = this.errorCounts.get(errorType) || 0;
    if (typeCount > 10) {
      // Reduce sampling for frequent errors
      rate *= Math.max(0.1, 10 / typeCount);
    }
    
    return Math.max(0.001, Math.min(1, rate)); // Clamp between 0.1% and 100%
  }
  
  shouldSample(error: TryError): boolean {
    this.resetIfNeeded();
    
    // Update counts
    this.totalErrors++;
    this.errorCounts.set(
      error.type,
      (this.errorCounts.get(error.type) || 0) + 1
    );
    
    // Critical errors always sampled
    const criticalTypes = ['SecurityError', 'PaymentError', 'DataLossError'];
    if (criticalTypes.includes(error.type)) {
      return true;
    }
    
    const rate = this.getSampleRate(error.type);
    return Math.random() < rate;
  }
}

const adaptiveSampler = new AdaptiveSampler(1000); // Target 1000 errors/minute

configure({
  onError: (error) => {
    if (adaptiveSampler.shouldSample(error)) {
      const sampleRate = adaptiveSampler.getSampleRate(error.type);
      
      Sentry.captureException(error, {
        tags: {
          sampled: true,
          sampleRate: sampleRate.toFixed(3),
          samplingMethod: 'adaptive',
        },
      });
    }
    
    return error;
  },
});`}
                </CodeBlock>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priority">
            <Card>
              <CardHeader>
                <CardTitle>Priority-Based Sampling</CardTitle>
                <CardDescription>
                  Sample based on error severity and business impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="typescript"
                  title="Priority Sampling System"
                  showLineNumbers={true}
                >
                  {`interface SamplingRule {
  condition: (error: TryError) => boolean;
  sampleRate: number;
  priority: number;
  description: string;
}

class PrioritySampler {
  private rules: SamplingRule[] = [
    // Critical errors - always sample
    {
      condition: (error) => ['PaymentError', 'SecurityError', 'DataCorruption'].includes(error.type),
      sampleRate: 1.0,
      priority: 100,
      description: 'Critical business errors',
    },
    
    // High-value user errors - sample more
    {
      condition: (error) => error.context?.userTier === 'premium',
      sampleRate: 0.5,
      priority: 90,
      description: 'Premium user errors',
    },
    
    // New errors - sample aggressively
    {
      condition: (error) => {
        const deployment = error.context?.deploymentId;
        const isNewDeployment = deployment && Date.now() - deployment < 3600000; // 1 hour
        return isNewDeployment;
      },
      sampleRate: 0.8,
      priority: 80,
      description: 'New deployment errors',
    },
    
    // API errors with 5xx status - important
    {
      condition: (error) => 
        error.type === 'APIError' && 
        error.context?.statusCode >= 500,
      sampleRate: 0.3,
      priority: 70,
      description: 'Server errors',
    },
    
    // Validation errors - sample less
    {
      condition: (error) => error.type === 'ValidationError',
      sampleRate: 0.01,
      priority: 20,
      description: 'User input errors',
    },
    
    // Default rule
    {
      condition: () => true,
      sampleRate: 0.05,
      priority: 0,
      description: 'Default sampling',
    },
  ];
  
  constructor(customRules?: SamplingRule[]) {
    if (customRules) {
      this.rules = [...customRules, ...this.rules];
    }
    // Sort by priority descending
    this.rules.sort((a, b) => b.priority - a.priority);
  }
  
  shouldSample(error: TryError): { sample: boolean; rule: SamplingRule } {
    // Find the first matching rule (highest priority)
    for (const rule of this.rules) {
      if (rule.condition(error)) {
        const sample = Math.random() < rule.sampleRate;
        return { sample, rule };
      }
    }
    
    // Should never reach here due to default rule
    return { sample: false, rule: this.rules[this.rules.length - 1] };
  }
}

const prioritySampler = new PrioritySampler();

configure({
  onError: (error) => {
    const { sample, rule } = prioritySampler.shouldSample(error);
    
    if (sample) {
      Sentry.captureException(error, {
        tags: {
          sampled: true,
          sampleRate: rule.sampleRate,
          samplingRule: rule.description,
          samplingPriority: rule.priority,
        },
      });
    } else {
      // Log high-priority errors locally even if not sampled
      if (rule.priority >= 70) {
        console.warn(\`High-priority error not sampled: \${error.type}\`, {
          message: error.message,
          rule: rule.description,
        });
      }
    }
    
    return error;
  },
});`}
                </CodeBlock>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* User-Based Sampling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          User-Based Sampling
        </h2>

        <p className="text-slate-600 mb-4">
          Sample all errors from a subset of users for complete user journey
          visibility.
        </p>

        <CodeBlock
          language="typescript"
          title="User-Based Sampling"
          showLineNumbers={true}
          className="mb-4"
        >
          {`class UserSampler {
  private sampledUsers = new Set<string>();
  private userErrorCounts = new Map<string, number>();
  
  constructor(
    private sampleRate: number = 0.01, // 1% of users
    private maxErrorsPerUser: number = 100
  ) {}
  
  private hashUserId(userId: string): number {
    // Simple hash function for consistent sampling
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  isUserSampled(userId: string): boolean {
    if (this.sampledUsers.has(userId)) {
      return true;
    }
    
    // Consistent sampling based on user ID hash
    const hash = this.hashUserId(userId);
    const threshold = this.sampleRate * 0x7FFFFFFF; // Max 32-bit int
    
    if (hash < threshold) {
      this.sampledUsers.add(userId);
      return true;
    }
    
    return false;
  }
  
  shouldSample(error: TryError): boolean {
    const userId = error.context?.userId as string;
    
    if (!userId) {
      // Sample anonymous errors at a lower rate
      return Math.random() < this.sampleRate * 0.1;
    }
    
    if (!this.isUserSampled(userId)) {
      return false;
    }
    
    // Check per-user rate limit
    const count = this.userErrorCounts.get(userId) || 0;
    if (count >= this.maxErrorsPerUser) {
      return false;
    }
    
    this.userErrorCounts.set(userId, count + 1);
    return true;
  }
}

const userSampler = new UserSampler(0.01); // Sample 1% of users

configure({
  onError: (error) => {
    if (userSampler.shouldSample(error)) {
      const userId = error.context?.userId as string;
      
      Sentry.captureException(error, {
        user: userId ? { id: userId } : undefined,
        tags: {
          sampled: true,
          samplingMethod: 'user-based',
          userSampled: userSampler.isUserSampled(userId),
        },
      });
    }
    
    return error;
  },
});`}
        </CodeBlock>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">
            Benefits of user-based sampling
          </h4>
          <ul className="space-y-1 text-green-700 text-sm">
            <li>• Complete error journey for sampled users</li>
            <li>• Better debugging with full context</li>
            <li>• Consistent user experience monitoring</li>
            <li>• Useful for A/B testing error rates</li>
          </ul>
        </div>
      </section>

      {/* Production Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Complete Production Example
        </h2>

        <p className="text-slate-600 mb-4">
          A comprehensive sampling system combining multiple strategies for
          production use.
        </p>

        <CodeBlock
          language="typescript"
          title="lib/error-sampling.ts"
          showLineNumbers={true}
          className="mb-4"
        >
          {`import { configure, TryError } from 'try-error';
import * as Sentry from '@sentry/nextjs';
import { track } from '@vercel/analytics';

// Comprehensive sampling system
class ProductionErrorSampler {
  private fingerprinter = new ErrorFingerprinter();
  private rateLimiter = new ErrorRateLimiter(1000); // 1000/min
  private userSampler = new UserSampler(0.01); // 1% of users
  private adaptiveSampler = new AdaptiveSampler(5000); // 5000/min target
  
  shouldSample(error: TryError): {
    sample: boolean;
    reason: string;
    metadata: Record<string, any>;
  } {
    // 1. Always sample critical errors
    const criticalTypes = ['PaymentError', 'SecurityError', 'DataLossError'];
    if (criticalTypes.includes(error.type)) {
      return {
        sample: true,
        reason: 'critical-error',
        metadata: { priority: 'critical' },
      };
    }
    
    // 2. Check rate limits first (cheapest check)
    if (!this.rateLimiter.shouldSample(error.type)) {
      return {
        sample: false,
        reason: 'rate-limited',
        metadata: {
          remainingQuota: this.rateLimiter.getRemainingQuota(error.type),
        },
      };
    }
    
    // 3. User-based sampling for complete journeys
    const userId = error.context?.userId as string;
    if (userId && this.userSampler.isUserSampled(userId)) {
      return {
        sample: true,
        reason: 'user-sampled',
        metadata: { userId, userSampled: true },
      };
    }
    
    // 4. Fingerprint-based for unique errors
    const isFirstOccurrence = !this.fingerprinter.getErrorStats(error);
    if (isFirstOccurrence || this.fingerprinter.shouldSample(error)) {
      return {
        sample: true,
        reason: 'fingerprint-sampled',
        metadata: {
          errorStats: this.fingerprinter.getErrorStats(error),
          isFirstOccurrence,
        },
      };
    }
    
    // 5. Adaptive sampling for everything else
    if (this.adaptiveSampler.shouldSample(error)) {
      return {
        sample: true,
        reason: 'adaptive-sampled',
        metadata: {
          sampleRate: this.adaptiveSampler.getSampleRate(error.type),
        },
      };
    }
    
    return {
      sample: false,
      reason: 'not-sampled',
      metadata: {},
    };
  }
}

// Initialize the sampler
const sampler = new ProductionErrorSampler();

// Configure try-error with comprehensive sampling
export function setupErrorSampling() {
  configure({
    onError: (error) => {
      const { sample, reason, metadata } = sampler.shouldSample(error);
      
      // Track sampling metrics in analytics
      track('error_sampling', {
        errorType: error.type,
        sampled: sample,
        reason,
        ...metadata,
      });
      
      if (sample) {
        // Send to Sentry with sampling context
        Sentry.captureException(error, {
          tags: {
            sampled: true,
            samplingReason: reason,
            errorType: error.type,
          },
          extra: {
            samplingMetadata: metadata,
            errorContext: error.context,
          },
        });
      } else {
        // Still log locally for debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn(\`Error not sampled (\${reason}):\`, error);
        }
        
        // Consider sending to a cheaper logging service
        // or aggregate locally and batch send
        logToLocalStorage(error, reason);
      }
      
      return error;
    },
  });
}

// Local storage for non-sampled errors (with cleanup)
function logToLocalStorage(error: TryError, reason: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const key = 'try-error-unsampled';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    existing.push({
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      reason,
      // Don't store sensitive context
    });
    
    // Keep only last 100 unsampled errors
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // Ignore localStorage errors
  }
}`}
        </CodeBlock>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Sampling Best Practices
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do's ✅</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Always sample critical/security errors at 100%</li>
                <li>• Use multiple sampling strategies together</li>
                <li>• Track sampling metrics to optimize rates</li>
                <li>• Store unsampled errors locally for debugging</li>
                <li>• Consider user impact when setting rates</li>
                <li>• Test sampling logic thoroughly</li>
                <li>• Document your sampling strategy</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Don'ts ❌</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Don't sample so aggressively you miss issues</li>
                <li>• Don't forget to handle error spikes</li>
                <li>• Don't sample based on sensitive data</li>
                <li>• Don't hardcode sampling rates</li>
                <li>• Don't ignore sampling in development</li>
                <li>• Don't forget to monitor sampling effectiveness</li>
                <li>• Don't apply same rate to all error types</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Monitoring Sampling */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Monitoring Your Sampling
        </h2>

        <p className="text-slate-600 mb-4">
          Track your sampling effectiveness to ensure you're not missing
          important errors.
        </p>

        <CodeBlock
          language="typescript"
          title="Sampling Metrics Dashboard"
          showLineNumbers={true}
          className="mb-4"
        >
          {`// Track sampling metrics
class SamplingMetrics {
  private metrics = {
    total: 0,
    sampled: 0,
    byType: new Map<string, { total: number; sampled: number }>(),
    byReason: new Map<string, number>(),
  };
  
  record(error: TryError, sampled: boolean, reason: string) {
    this.metrics.total++;
    if (sampled) this.metrics.sampled++;
    
    // By type
    const typeMetrics = this.metrics.byType.get(error.type) || { total: 0, sampled: 0 };
    typeMetrics.total++;
    if (sampled) typeMetrics.sampled++;
    this.metrics.byType.set(error.type, typeMetrics);
    
    // By reason
    this.metrics.byReason.set(reason, (this.metrics.byReason.get(reason) || 0) + 1);
  }
  
  getReport() {
    const overallRate = this.metrics.sampled / this.metrics.total;
    
    const byTypeRates = Array.from(this.metrics.byType.entries()).map(([type, metrics]) => ({
      type,
      rate: metrics.sampled / metrics.total,
      total: metrics.total,
      sampled: metrics.sampled,
    }));
    
    return {
      overall: {
        rate: overallRate,
        total: this.metrics.total,
        sampled: this.metrics.sampled,
      },
      byType: byTypeRates.sort((a, b) => b.total - a.total),
      byReason: Object.fromEntries(this.metrics.byReason),
    };
  }
}

// Send metrics to monitoring dashboard
setInterval(() => {
  const report = samplingMetrics.getReport();
  
  // Send to your metrics service
  track('sampling_metrics', report);
  
  // Or log for analysis
  console.log('Sampling Report:', report);
}, 60000); // Every minute`}
        </CodeBlock>

        <Alert>
          <AlertDescription>
            <strong>Remember:</strong> The goal of sampling is to balance
            visibility with cost. Monitor your sampling rates and adjust based
            on:
            <ul className="mt-2 space-y-1">
              <li>
                • Error detection latency (are you catching issues quickly?)
              </li>
              <li>• Cost trends (are you within budget?)</li>
              <li>
                • Signal-to-noise ratio (are you seeing important errors?)
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
