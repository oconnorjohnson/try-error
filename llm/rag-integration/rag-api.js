#!/usr/bin/env node

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { RAGVectorDatabase } from "./vector-database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Production-Ready RAG API Implementation
 */
class RAGApi {
  constructor(options = {}) {
    this.app = express();
    this.port = options.port || process.env.PORT || 3000;
    this.vectorDb = new RAGVectorDatabase(options.vectorDb || {});
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      searchQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
    this.cache = new Map();
    this.cacheTtl = options.cacheTtl || 300000; // 5 minutes

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
      })
    );

    // CORS
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || [
          "http://localhost:3000",
        ],
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: "Too many requests from this IP, please try again later.",
      },
    });
    this.app.use("/api/", limiter);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging and metrics
    this.app.use((req, res, next) => {
      const start = Date.now();
      this.metrics.totalRequests++;

      res.on("finish", () => {
        const duration = Date.now() - start;
        this.metrics.averageResponseTime =
          (this.metrics.averageResponseTime + duration) / 2;

        if (res.statusCode >= 200 && res.statusCode < 400) {
          this.metrics.successfulRequests++;
        } else {
          this.metrics.failedRequests++;
        }
      });

      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Readiness check
    this.app.get("/ready", async (req, res) => {
      try {
        const dbStats = this.vectorDb.getStats();
        res.json({
          status: "ready",
          vectorDb: {
            documents: dbStats.totalDocuments,
            dimension: dbStats.dimension,
            averageMagnitude: dbStats.averageEmbeddingMagnitude,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(503).json({
          status: "not ready",
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Metrics endpoint
    this.app.get("/metrics", (req, res) => {
      res.json({
        ...this.metrics,
        cacheSize: this.cache.size,
        cacheHitRate:
          this.metrics.cacheHits /
            (this.metrics.cacheHits + this.metrics.cacheMisses) || 0,
        vectorDbStats: this.vectorDb.getStats(),
        timestamp: new Date().toISOString(),
      });
    });

    // Main search endpoint
    this.app.post("/api/search", async (req, res) => {
      try {
        const { query, options = {} } = req.body;

        if (!query || typeof query !== "string") {
          return res.status(400).json({
            error: "Query is required and must be a string",
            code: "INVALID_QUERY",
          });
        }

        const result = await this.search(query, options);
        res.json(result);
      } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
          error: "Internal server error",
          code: "SEARCH_ERROR",
          message: error.message,
        });
      }
    });

    // Batch search endpoint
    this.app.post("/api/search/batch", async (req, res) => {
      try {
        const { queries, options = {} } = req.body;

        if (!Array.isArray(queries) || queries.length === 0) {
          return res.status(400).json({
            error: "Queries must be a non-empty array",
            code: "INVALID_QUERIES",
          });
        }

        if (queries.length > 10) {
          return res.status(400).json({
            error: "Maximum 10 queries allowed per batch",
            code: "BATCH_LIMIT_EXCEEDED",
          });
        }

        const results = await Promise.all(
          queries.map((query) => this.search(query, options))
        );

        res.json({
          results,
          count: results.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Batch search error:", error);
        res.status(500).json({
          error: "Internal server error",
          code: "BATCH_SEARCH_ERROR",
          message: error.message,
        });
      }
    });

    // Document recommendation endpoint
    this.app.get("/api/recommendations/:documentId", async (req, res) => {
      try {
        const { documentId } = req.params;
        const { maxResults = 5 } = req.query;

        const recommendations = await this.vectorDb.getRecommendations(
          documentId,
          { maxResults: parseInt(maxResults) }
        );

        res.json({
          documentId,
          recommendations,
          count: recommendations.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Recommendations error:", error);
        res.status(500).json({
          error: "Internal server error",
          code: "RECOMMENDATIONS_ERROR",
          message: error.message,
        });
      }
    });

    // Document retrieval endpoint
    this.app.get("/api/documents/:documentId", async (req, res) => {
      try {
        const { documentId } = req.params;

        const document = this.vectorDb.getDocument(documentId);

        if (!document) {
          return res.status(404).json({
            error: "Document not found",
            code: "DOCUMENT_NOT_FOUND",
            documentId,
          });
        }

        res.json({
          document,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Document retrieval error:", error);
        res.status(500).json({
          error: "Internal server error",
          code: "DOCUMENT_RETRIEVAL_ERROR",
          message: error.message,
        });
      }
    });

    // Statistics endpoint
    this.app.get("/api/stats", async (req, res) => {
      try {
        const stats = this.vectorDb.getStats();

        res.json({
          ...stats,
          apiMetrics: this.metrics,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({
          error: "Internal server error",
          code: "STATS_ERROR",
          message: error.message,
        });
      }
    });

    // Index management endpoint
    this.app.post("/api/index/rebuild", async (req, res) => {
      try {
        console.log("Starting index rebuild...");
        const result = await this.vectorDb.indexChunks();

        res.json({
          message: "Index rebuild completed",
          result,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Index rebuild error:", error);
        res.status(500).json({
          error: "Index rebuild failed",
          code: "INDEX_REBUILD_ERROR",
          message: error.message,
        });
      }
    });

    // Cache management endpoint
    this.app.post("/api/cache/clear", (req, res) => {
      try {
        this.cache.clear();
        this.metrics.cacheHits = 0;
        this.metrics.cacheMisses = 0;

        res.json({
          message: "Cache cleared successfully",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Cache clear error:", error);
        res.status(500).json({
          error: "Cache clear failed",
          code: "CACHE_CLEAR_ERROR",
          message: error.message,
        });
      }
    });

    // API documentation endpoint
    this.app.get("/api/docs", (req, res) => {
      res.json({
        title: "RAG Documentation API",
        version: "1.0.0",
        description: "Production-ready RAG API for try-error documentation",
        endpoints: {
          "GET /health": "Health check endpoint",
          "GET /ready": "Readiness check endpoint",
          "GET /metrics": "API metrics and statistics",
          "POST /api/search": "Search documentation with query",
          "POST /api/search/batch": "Batch search with multiple queries",
          "GET /api/recommendations/:documentId":
            "Get document recommendations",
          "GET /api/documents/:documentId": "Retrieve specific document",
          "GET /api/stats": "Vector database statistics",
          "POST /api/index/rebuild": "Rebuild search index",
          "POST /api/cache/clear": "Clear search cache",
        },
        timestamp: new Date().toISOString(),
      });
    });

    // Serve static files (if any)
    this.app.use("/static", express.static(path.join(__dirname, "public")));

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: "Endpoint not found",
        code: "NOT_FOUND",
        path: req.path,
        method: req.method,
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error("Unhandled error:", err);

      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    });
  }

  /**
   * Enhanced search with caching and metrics
   */
  async search(query, options = {}) {
    const start = Date.now();
    this.metrics.searchQueries++;

    // Check cache first
    const cacheKey = `${query}:${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      this.metrics.cacheHits++;
      return {
        ...cached,
        cached: true,
        responseTime: Date.now() - start,
      };
    }

    this.metrics.cacheMisses++;

    // Perform search
    const results = await this.vectorDb.ragSearch(query, {
      maxResults: options.maxResults || 5,
      threshold: options.threshold || 0.6,
      includeMetadata: options.includeMetadata !== false,
      ...options,
    });

    // Format results
    const formattedResults = results.map((result) => ({
      id: result.id,
      title: result.metadata?.title || "Untitled",
      content: this.truncateContent(result.metadata?.text || "", 500),
      score: result.relevanceScore,
      type: result.metadata?.type,
      source: result.metadata?.source,
      tags: result.metadata?.tags || [],
      related: result.metadata?.related || [],
      complexity: result.metadata?.complexity,
      usage_patterns: result.metadata?.usage_patterns || [],
    }));

    const response = {
      query,
      results: formattedResults,
      count: formattedResults.length,
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      cached: false,
    };

    // Cache the results
    this.setCache(cacheKey, response);

    return response;
  }

  /**
   * Truncate content to specified length
   */
  truncateContent(content, maxLength) {
    if (content.length <= maxLength) return content;

    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    return lastSpace > 0
      ? truncated.substring(0, lastSpace) + "..."
      : truncated + "...";
  }

  /**
   * Get item from cache
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.cacheTtl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set item in cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Initialize the API
   */
  async initialize() {
    console.log("🚀 Initializing RAG API...");

    try {
      // Initialize vector database
      console.log("📊 Checking vector database...");
      const stats = this.vectorDb.getStats();

      if (stats.totalDocuments === 0) {
        console.log("📚 No documents found, indexing chunks...");
        await this.vectorDb.indexChunks();
        console.log("✅ Chunks indexed successfully");
      } else {
        console.log(
          `📚 Found ${stats.totalDocuments} documents in vector database`
        );
      }

      console.log("✅ RAG API initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize RAG API:", error);
      return false;
    }
  }

  /**
   * Start the server
   */
  async start() {
    const initialized = await this.initialize();

    if (!initialized) {
      console.error("❌ Failed to initialize API, exiting...");
      process.exit(1);
    }

    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 RAG API server running on port ${this.port}`);
      console.log(`📚 Health check: http://localhost:${this.port}/health`);
      console.log(`📊 Metrics: http://localhost:${this.port}/metrics`);
      console.log(`📖 API docs: http://localhost:${this.port}/api/docs`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => this.shutdown());
    process.on("SIGINT", () => this.shutdown());
  }

  /**
   * Graceful shutdown
   */
  shutdown() {
    console.log("🛑 Shutting down RAG API...");

    if (this.server) {
      this.server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    }
  }
}

/**
 * CLI Interface
 */
async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log(`
🚀 RAG API Server

Usage:
  node rag-api.js <command> [options]

Commands:
  start        Start the API server
  test         Run API tests
  benchmark    Run performance benchmarks

Examples:
  node rag-api.js start
  node rag-api.js test
  node rag-api.js benchmark
`);
    process.exit(1);
  }

  switch (command) {
    case "start":
      const api = new RAGApi();
      await api.start();
      break;

    case "test":
      await runTests();
      break;

    case "benchmark":
      await runBenchmarks();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

/**
 * Run API tests
 */
async function runTests() {
  console.log("🧪 Running API Tests...\n");

  const api = new RAGApi({ port: 3001 });
  await api.start();

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "Search Endpoint", fn: testSearchEndpoint },
    { name: "Batch Search", fn: testBatchSearch },
    { name: "Recommendations", fn: testRecommendations },
    { name: "Metrics", fn: testMetrics },
    { name: "Error Handling", fn: testErrorHandling },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔄 Running ${test.name}...`);
      await test.fn();
      console.log(`✅ ${test.name} passed`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  api.shutdown();

  if (failed > 0) {
    process.exit(1);
  }
}

/**
 * Test functions
 */
async function testHealthCheck() {
  const response = await fetch("http://localhost:3001/health");
  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (data.status !== "healthy") {
    throw new Error(`Expected healthy status, got ${data.status}`);
  }
}

async function testSearchEndpoint() {
  const response = await fetch("http://localhost:3001/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "error handling" }),
  });

  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!data.results || !Array.isArray(data.results)) {
    throw new Error("Expected results array");
  }

  if (typeof data.responseTime !== "number") {
    throw new Error("Expected responseTime to be a number");
  }
}

async function testBatchSearch() {
  const response = await fetch("http://localhost:3001/api/search/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queries: ["error handling", "async operations"],
    }),
  });

  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!data.results || data.results.length !== 2) {
    throw new Error("Expected 2 results");
  }
}

async function testRecommendations() {
  // First get a document ID from search
  const searchResponse = await fetch("http://localhost:3001/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "trySync" }),
  });

  const searchData = await searchResponse.json();

  if (searchData.results.length === 0) {
    throw new Error("No search results to test recommendations");
  }

  const documentId = searchData.results[0].id;

  const response = await fetch(
    `http://localhost:3001/api/recommendations/${documentId}`
  );
  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!data.recommendations || !Array.isArray(data.recommendations)) {
    throw new Error("Expected recommendations array");
  }
}

async function testMetrics() {
  const response = await fetch("http://localhost:3001/metrics");
  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (typeof data.totalRequests !== "number") {
    throw new Error("Expected totalRequests to be a number");
  }
}

async function testErrorHandling() {
  // Test invalid query
  const response = await fetch("http://localhost:3001/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: null }),
  });

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== "INVALID_QUERY") {
    throw new Error(`Expected INVALID_QUERY error code, got ${data.code}`);
  }
}

/**
 * Run performance benchmarks
 */
async function runBenchmarks() {
  console.log("🏃 Running Performance Benchmarks...\n");

  const api = new RAGApi({ port: 3002 });
  await api.start();

  const queries = [
    "error handling",
    "async operations",
    "configuration",
    "React components",
    "performance optimization",
  ];

  // Warm up
  console.log("🔥 Warming up...");
  for (let i = 0; i < 10; i++) {
    await fetch("http://localhost:3002/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: queries[i % queries.length] }),
    });
  }

  // Benchmark single requests
  console.log("\n📊 Single Request Benchmark:");
  const singleStart = Date.now();
  const singlePromises = [];

  for (let i = 0; i < 100; i++) {
    singlePromises.push(
      fetch("http://localhost:3002/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queries[i % queries.length] }),
      })
    );
  }

  await Promise.all(singlePromises);
  const singleDuration = Date.now() - singleStart;

  console.log(`  Total time: ${singleDuration}ms`);
  console.log(
    `  Requests per second: ${((100 / singleDuration) * 1000).toFixed(2)}`
  );
  console.log(
    `  Average response time: ${(singleDuration / 100).toFixed(2)}ms`
  );

  // Benchmark concurrent requests
  console.log("\n📊 Concurrent Request Benchmark:");
  const concurrentStart = Date.now();
  const concurrentPromises = [];

  for (let i = 0; i < 50; i++) {
    concurrentPromises.push(
      fetch("http://localhost:3002/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queries[i % queries.length] }),
      })
    );
  }

  await Promise.all(concurrentPromises);
  const concurrentDuration = Date.now() - concurrentStart;

  console.log(`  Total time: ${concurrentDuration}ms`);
  console.log(
    `  Concurrent requests per second: ${(
      (50 / concurrentDuration) *
      1000
    ).toFixed(2)}`
  );
  console.log(
    `  Average response time: ${(concurrentDuration / 50).toFixed(2)}ms`
  );

  // Get final metrics
  const metricsResponse = await fetch("http://localhost:3002/metrics");
  const metrics = await metricsResponse.json();

  console.log("\n📈 Final Metrics:");
  console.log(`  Total requests: ${metrics.totalRequests}`);
  console.log(
    `  Success rate: ${(
      (metrics.successfulRequests / metrics.totalRequests) *
      100
    ).toFixed(2)}%`
  );
  console.log(`  Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%`);
  console.log(
    `  Average response time: ${metrics.averageResponseTime.toFixed(2)}ms`
  );

  api.shutdown();
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RAGApi };
