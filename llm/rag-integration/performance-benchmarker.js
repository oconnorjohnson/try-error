#!/usr/bin/env node

/**
 * Performance Benchmarker for try-error RAG Documentation
 *
 * Comprehensive performance testing including query response times, throughput,
 * memory usage, and scalability benchmarks under different loads.
 *
 * Usage:
 *   node performance-benchmarker.js [--load=light|medium|heavy] [--duration=60] [--concurrent=10]
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memory: [],
      cpu: [],
      timestamps: [],
    };
    this.monitoring = false;
    this.interval = null;
  }

  startMonitoring(intervalMs = 1000) {
    if (this.monitoring) return;

    this.monitoring = true;
    this.metrics.memory = [];
    this.metrics.cpu = [];
    this.metrics.timestamps = [];

    const startCpuUsage = process.cpuUsage();
    let lastCpuUsage = startCpuUsage;

    this.interval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const currentCpuUsage = process.cpuUsage(lastCpuUsage);
      const timestamp = Date.now();

      // Calculate CPU percentage
      const totalCpuTime = currentCpuUsage.user + currentCpuUsage.system;
      const cpuPercent = (totalCpuTime / 1000 / intervalMs) * 100;

      this.metrics.memory.push({
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      });

      this.metrics.cpu.push(cpuPercent);
      this.metrics.timestamps.push(timestamp);

      lastCpuUsage = process.cpuUsage();
    }, intervalMs);
  }

  stopMonitoring() {
    if (!this.monitoring) return;

    this.monitoring = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getMetrics() {
    return {
      memory: this.metrics.memory,
      cpu: this.metrics.cpu,
      timestamps: this.metrics.timestamps,
      duration:
        this.metrics.timestamps.length > 0
          ? this.metrics.timestamps[this.metrics.timestamps.length - 1] -
            this.metrics.timestamps[0]
          : 0,
    };
  }

  getAverageMetrics() {
    if (this.metrics.memory.length === 0) return null;

    const avgMemory = {
      rss: this.average(this.metrics.memory.map((m) => m.rss)),
      heapTotal: this.average(this.metrics.memory.map((m) => m.heapTotal)),
      heapUsed: this.average(this.metrics.memory.map((m) => m.heapUsed)),
      external: this.average(this.metrics.memory.map((m) => m.external)),
      arrayBuffers: this.average(
        this.metrics.memory.map((m) => m.arrayBuffers)
      ),
    };

    const avgCpu = this.average(this.metrics.cpu);

    return {
      memory: avgMemory,
      cpu: avgCpu,
      samples: this.metrics.memory.length,
    };
  }

  average(array) {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }
}

class LoadGenerator {
  constructor() {
    this.testQueries = [
      "How do I use trySync for error handling?",
      "What is the difference between trySync and tryAsync?",
      "How to implement error boundaries in React?",
      "Configure try-error for production",
      "What are the performance implications?",
      "How to test functions that use tryAsync?",
      "TypeScript types for TryError",
      "Common pitfalls when using try-error",
      "wrapError usage examples",
      "async error handling patterns",
      "performance optimization tips",
      "fromThrown automatic detection",
      "isTryError type checking",
      "useTry React hook patterns",
      "TryErrorBoundary integration",
      "configure presets and options",
      "error reporting integration",
      "minimal mode configuration",
      "testing strategies and mocking",
      "migration from try-catch",
    ];
  }

  generateQuery() {
    return this.testQueries[
      Math.floor(Math.random() * this.testQueries.length)
    ];
  }

  async generateLoad(queryFunction, config) {
    const { concurrent, duration, strategy } = config;
    const endTime = Date.now() + duration * 1000;
    const results = [];

    console.log(
      `Generating ${strategy} load: ${concurrent} concurrent queries for ${duration}s`
    );

    const workers = [];

    // Start concurrent workers
    for (let i = 0; i < concurrent; i++) {
      workers.push(this.startWorker(i, queryFunction, endTime, results));
    }

    // Wait for all workers to complete
    await Promise.all(workers);

    return results;
  }

  async startWorker(workerId, queryFunction, endTime, results) {
    let queryCount = 0;

    while (Date.now() < endTime) {
      const query = this.generateQuery();
      const startTime = Date.now();

      try {
        await queryFunction(query);
        const responseTime = Date.now() - startTime;

        results.push({
          workerId,
          queryCount: queryCount++,
          query,
          responseTime,
          success: true,
          timestamp: startTime,
        });
      } catch (error) {
        const responseTime = Date.now() - startTime;

        results.push({
          workerId,
          queryCount: queryCount++,
          query,
          responseTime,
          success: false,
          error: error.message,
          timestamp: startTime,
        });
      }

      // Small delay to prevent overwhelming
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

class BenchmarkSuite {
  constructor() {
    this.monitor = new PerformanceMonitor();
    this.loadGenerator = new LoadGenerator();
    this.vectorDb = null;
    this.queryPatterns = null;
    this.ragPipeline = null;
  }

  async initialize(chunksPath, patternsPath) {
    console.log("Initializing benchmark suite...");

    // Load dependencies
    const { VectorDatabase, RAGPipeline } = require("./llm-integration-tester");

    this.vectorDb = new VectorDatabase();
    await this.vectorDb.initialize(chunksPath);

    if (fs.existsSync(patternsPath)) {
      this.queryPatterns = JSON.parse(fs.readFileSync(patternsPath, "utf8"));
    }

    this.ragPipeline = new RAGPipeline(this.vectorDb, this.queryPatterns);

    console.log("Benchmark suite initialized.");
  }

  async benchmarkBasicRetrieval() {
    console.log("\n=== Basic Retrieval Benchmark ===");

    const testQueries = [
      "How do I use trySync?",
      "What is error handling?",
      "React error boundary",
      "Performance optimization",
      "TypeScript integration",
    ];

    const results = {
      vector_search: [],
      rag_retrieval: [],
    };

    // Benchmark vector search
    console.log("Benchmarking vector search...");
    for (const query of testQueries) {
      const times = [];

      // Warm up
      await this.vectorDb.similaritySearch(query, 5);

      // Run multiple iterations
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await this.vectorDb.similaritySearch(query, 5);
        times.push(Date.now() - startTime);
      }

      results.vector_search.push({
        query,
        times,
        avg: times.reduce((sum, t) => sum + t, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      });
    }

    // Benchmark RAG retrieval
    console.log("Benchmarking RAG retrieval...");
    for (const query of testQueries) {
      const times = [];

      // Warm up
      await this.ragPipeline.retrieveContext(query, 5);

      // Run multiple iterations
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await this.ragPipeline.retrieveContext(query, 5);
        times.push(Date.now() - startTime);
      }

      results.rag_retrieval.push({
        query,
        times,
        avg: times.reduce((sum, t) => sum + t, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      });
    }

    return results;
  }

  async benchmarkThroughput(config) {
    console.log(`\n=== Throughput Benchmark (${config.name}) ===`);

    this.monitor.startMonitoring(500);

    const queryFunction = async (query) => {
      return await this.ragPipeline.retrieveContext(query, 5);
    };

    const startTime = Date.now();
    const loadResults = await this.loadGenerator.generateLoad(
      queryFunction,
      config
    );
    const totalTime = Date.now() - startTime;

    this.monitor.stopMonitoring();

    // Calculate metrics
    const successfulQueries = loadResults.filter((r) => r.success);
    const failedQueries = loadResults.filter((r) => !r.success);

    const responseTimes = successfulQueries.map((r) => r.responseTime);
    const throughput = successfulQueries.length / (totalTime / 1000);

    const performanceMetrics = this.monitor.getAverageMetrics();

    return {
      config,
      total_queries: loadResults.length,
      successful_queries: successfulQueries.length,
      failed_queries: failedQueries.length,
      success_rate: successfulQueries.length / loadResults.length,
      throughput_qps: throughput,
      response_times: {
        avg:
          responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length,
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        p50: this.percentile(responseTimes, 50),
        p95: this.percentile(responseTimes, 95),
        p99: this.percentile(responseTimes, 99),
      },
      resource_usage: performanceMetrics,
      duration_actual: totalTime / 1000,
    };
  }

  async benchmarkScalability() {
    console.log("\n=== Scalability Benchmark ===");

    const concurrencyLevels = [1, 5, 10, 20, 50];
    const duration = 30; // seconds
    const results = [];

    for (const concurrent of concurrencyLevels) {
      console.log(`Testing with ${concurrent} concurrent queries...`);

      const config = {
        name: `concurrent-${concurrent}`,
        concurrent,
        duration,
        strategy: "scalability",
      };

      const result = await this.benchmarkThroughput(config);
      results.push(result);

      // Brief pause between tests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return results;
  }

  async benchmarkMemoryUsage() {
    console.log("\n=== Memory Usage Benchmark ===");

    const queries = [];
    for (let i = 0; i < 1000; i++) {
      queries.push(this.loadGenerator.generateQuery());
    }

    // Record initial memory
    const initialMemory = process.memoryUsage();

    this.monitor.startMonitoring(100);

    // Process many queries to test memory usage
    console.log("Processing 1000 queries...");
    for (const query of queries) {
      await this.ragPipeline.retrieveContext(query, 5);

      // Occasional garbage collection
      if (queries.indexOf(query) % 100 === 0) {
        if (global.gc) {
          global.gc();
        }
      }
    }

    this.monitor.stopMonitoring();

    const finalMemory = process.memoryUsage();
    const performanceMetrics = this.monitor.getMetrics();

    return {
      initial_memory: initialMemory,
      final_memory: finalMemory,
      memory_growth: {
        rss: finalMemory.rss - initialMemory.rss,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      },
      performance_metrics: performanceMetrics,
      queries_processed: queries.length,
    };
  }

  percentile(arr, p) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
  }

  async runFullBenchmark(config = {}) {
    const {
      includeBasic = true,
      includeThroughput = true,
      includeScalability = true,
      includeMemory = true,
      customLoads = [],
    } = config;

    console.log("Starting comprehensive performance benchmark...");

    const results = {
      system_info: this.getSystemInfo(),
      timestamp: new Date().toISOString(),
      benchmarks: {},
    };

    try {
      // Basic retrieval benchmark
      if (includeBasic) {
        results.benchmarks.basic_retrieval =
          await this.benchmarkBasicRetrieval();
      }

      // Throughput benchmarks
      if (includeThroughput) {
        const throughputConfigs = [
          {
            name: "light-load",
            concurrent: 5,
            duration: 30,
            strategy: "light",
          },
          {
            name: "medium-load",
            concurrent: 15,
            duration: 30,
            strategy: "medium",
          },
          {
            name: "heavy-load",
            concurrent: 30,
            duration: 30,
            strategy: "heavy",
          },
        ];

        results.benchmarks.throughput = [];
        for (const config of throughputConfigs) {
          const result = await this.benchmarkThroughput(config);
          results.benchmarks.throughput.push(result);
        }
      }

      // Scalability benchmark
      if (includeScalability) {
        results.benchmarks.scalability = await this.benchmarkScalability();
      }

      // Memory usage benchmark
      if (includeMemory) {
        results.benchmarks.memory_usage = await this.benchmarkMemoryUsage();
      }

      // Custom load tests
      for (const customLoad of customLoads) {
        const result = await this.benchmarkThroughput(customLoad);
        if (!results.benchmarks.custom) results.benchmarks.custom = [];
        results.benchmarks.custom.push(result);
      }
    } catch (error) {
      console.error("Benchmark failed:", error);
      results.error = error.message;
    }

    return results;
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory_total: os.totalmem(),
      memory_free: os.freemem(),
      load_avg: os.loadavg(),
      node_version: process.version,
      uptime: os.uptime(),
    };
  }

  async saveResults(results, outputPath) {
    const outputFile = path.join(
      outputPath,
      `performance-benchmark-${Date.now()}.json`
    );

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\nBenchmark results saved to: ${outputFile}`);

    return outputFile;
  }

  printSummary(results) {
    console.log("\n=== PERFORMANCE BENCHMARK SUMMARY ===");

    // System info
    console.log("\n--- System Information ---");
    const sys = results.system_info;
    console.log(`Platform: ${sys.platform} (${sys.arch})`);
    console.log(`CPUs: ${sys.cpus}`);
    console.log(
      `Memory: ${(sys.memory_total / 1024 / 1024 / 1024).toFixed(1)}GB total`
    );
    console.log(`Node.js: ${sys.node_version}`);

    // Basic retrieval
    if (results.benchmarks.basic_retrieval) {
      console.log("\n--- Basic Retrieval Performance ---");
      const basic = results.benchmarks.basic_retrieval;

      const vectorAvg =
        basic.vector_search.reduce((sum, r) => sum + r.avg, 0) /
        basic.vector_search.length;
      const ragAvg =
        basic.rag_retrieval.reduce((sum, r) => sum + r.avg, 0) /
        basic.rag_retrieval.length;

      console.log(`Vector Search: ${vectorAvg.toFixed(1)}ms average`);
      console.log(`RAG Retrieval: ${ragAvg.toFixed(1)}ms average`);
    }

    // Throughput
    if (results.benchmarks.throughput) {
      console.log("\n--- Throughput Performance ---");
      results.benchmarks.throughput.forEach((result) => {
        console.log(`${result.config.name}:`);
        console.log(
          `  Throughput: ${result.throughput_qps.toFixed(1)} queries/sec`
        );
        console.log(
          `  Success Rate: ${(result.success_rate * 100).toFixed(1)}%`
        );
        console.log(
          `  Avg Response Time: ${result.response_times.avg.toFixed(1)}ms`
        );
        console.log(
          `  P95 Response Time: ${result.response_times.p95.toFixed(1)}ms`
        );

        if (result.resource_usage) {
          console.log(
            `  Memory Used: ${(
              result.resource_usage.memory.heapUsed /
              1024 /
              1024
            ).toFixed(1)}MB`
          );
          console.log(`  CPU Usage: ${result.resource_usage.cpu.toFixed(1)}%`);
        }
      });
    }

    // Scalability
    if (results.benchmarks.scalability) {
      console.log("\n--- Scalability Analysis ---");
      results.benchmarks.scalability.forEach((result) => {
        console.log(`${result.config.concurrent} concurrent:`);
        console.log(`  Throughput: ${result.throughput_qps.toFixed(1)} qps`);
        console.log(
          `  P95 Response: ${result.response_times.p95.toFixed(1)}ms`
        );
      });
    }

    // Memory usage
    if (results.benchmarks.memory_usage) {
      console.log("\n--- Memory Usage ---");
      const mem = results.benchmarks.memory_usage;
      console.log(
        `Initial Memory: ${(mem.initial_memory.heapUsed / 1024 / 1024).toFixed(
          1
        )}MB`
      );
      console.log(
        `Final Memory: ${(mem.final_memory.heapUsed / 1024 / 1024).toFixed(
          1
        )}MB`
      );
      console.log(
        `Memory Growth: ${(mem.memory_growth.heapUsed / 1024 / 1024).toFixed(
          1
        )}MB`
      );
      console.log(`Queries Processed: ${mem.queries_processed}`);
    }

    console.log("\n=== BENCHMARK COMPLETE ===");
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    load:
      args.find((arg) => arg.startsWith("--load="))?.substring(7) || "medium",
    duration: parseInt(
      args.find((arg) => arg.startsWith("--duration="))?.substring(11) || "30"
    ),
    concurrent: parseInt(
      args.find((arg) => arg.startsWith("--concurrent="))?.substring(13) || "10"
    ),
    chunksPath:
      args.find((arg) => arg.startsWith("--chunks="))?.substring(9) ||
      "rag-optimization/chunks",
    patternsPath:
      args.find((arg) => arg.startsWith("--patterns="))?.substring(12) ||
      "rag-optimization/query-patterns.json",
  };

  try {
    const benchmarker = new BenchmarkSuite();
    await benchmarker.initialize(options.chunksPath, options.patternsPath);

    // Configure benchmark based on load option
    let benchmarkConfig = {};

    if (options.load === "light") {
      benchmarkConfig = {
        includeBasic: true,
        includeThroughput: true,
        includeScalability: false,
        includeMemory: false,
      };
    } else if (options.load === "heavy") {
      benchmarkConfig = {
        includeBasic: true,
        includeThroughput: true,
        includeScalability: true,
        includeMemory: true,
      };
    } else {
      // medium (default)
      benchmarkConfig = {
        includeBasic: true,
        includeThroughput: true,
        includeScalability: true,
        includeMemory: false,
      };
    }

    // Run benchmark
    const results = await benchmarker.runFullBenchmark(benchmarkConfig);

    // Save and display results
    await benchmarker.saveResults(results, "rag-integration/results");
    benchmarker.printSummary(results);
  } catch (error) {
    console.error("Benchmark failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  BenchmarkSuite,
  PerformanceMonitor,
  LoadGenerator,
};
