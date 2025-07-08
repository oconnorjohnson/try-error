#!/usr/bin/env node

/**
 * Retrieval Accuracy Validator for try-error RAG Documentation
 *
 * Validates retrieval accuracy using ground truth datasets, measures precision,
 * recall, NDCG, and other IR metrics. Supports A/B testing of different strategies.
 *
 * Usage:
 *   node retrieval-accuracy-validator.js [--strategy=vector|hybrid|pattern] [--metrics=all] [--benchmark]
 */

const fs = require("fs");
const path = require("path");

class GroundTruthDataset {
  constructor() {
    this.dataset = new Map();
    this.categories = new Map();
    this.generateDataset();
  }

  generateDataset() {
    // Create ground truth query-document relevance mappings
    const groundTruthData = [
      {
        query: "How do I use trySync?",
        category: "api-usage",
        expected_chunks: [
          { chunk_id: "function_trySync", relevance: 4 },
          { chunk_id: "trySync_deep_dive_quick-reference", relevance: 4 },
          { chunk_id: "trySync_deep_dive_usage-examples", relevance: 4 },
          {
            chunk_id: "trySync_deep_dive_implementation-details",
            relevance: 3,
          },
          { chunk_id: "trySync_deep_dive_basic-usage", relevance: 3 },
        ],
      },
      {
        query: "trySync vs tryAsync differences",
        category: "comparison",
        expected_chunks: [
          { chunk_id: "trySync_deep_dive_quick-reference", relevance: 4 },
          { chunk_id: "tryAsync_deep_dive_quick-reference", relevance: 4 },
          { chunk_id: "architecture_async-vs-sync", relevance: 4 },
          {
            chunk_id: "trySync_deep_dive_implementation-details",
            relevance: 3,
          },
          {
            chunk_id: "tryAsync_deep_dive_implementation-details",
            relevance: 3,
          },
        ],
      },
      {
        query: "React error boundary setup",
        category: "integration",
        expected_chunks: [
          { chunk_id: "function_TryErrorBoundary", relevance: 4 },
          {
            chunk_id: "TryErrorBoundary_deep_dive_quick-reference",
            relevance: 4,
          },
          {
            chunk_id: "TryErrorBoundary_deep_dive_basic-usage-examples",
            relevance: 4,
          },
          { chunk_id: "function_ErrorBoundaryDemo", relevance: 3 },
          {
            chunk_id: "TryErrorBoundary_deep_dive_implementation-details",
            relevance: 3,
          },
        ],
      },
      {
        query: "configure try-error performance",
        category: "configuration",
        expected_chunks: [
          { chunk_id: "function_configure", relevance: 4 },
          { chunk_id: "configure_deep_dive_quick-reference", relevance: 4 },
          {
            chunk_id: "configure_deep_dive_performance-impact-analysis",
            relevance: 4,
          },
          {
            chunk_id: "configure_deep_dive_configuration-presets",
            relevance: 3,
          },
          { chunk_id: "function_setupPerformance", relevance: 3 },
        ],
      },
      {
        query: "error type checking with isTryError",
        category: "type-checking",
        expected_chunks: [
          { chunk_id: "function_isTryError", relevance: 4 },
          { chunk_id: "isTryError_deep_dive_quick-reference", relevance: 4 },
          {
            chunk_id:
              "isTryError_deep_dive_type-safety-and-typescript-integration",
            relevance: 4,
          },
          {
            chunk_id: "isTryError_deep_dive_runtime-validation-examples",
            relevance: 3,
          },
          { chunk_id: "function_isErrorOfType", relevance: 3 },
        ],
      },
      {
        query: "async error handling patterns",
        category: "patterns",
        expected_chunks: [
          {
            chunk_id: "tryAsync_deep_dive_error-handling-patterns",
            relevance: 4,
          },
          { chunk_id: "tryAsync_deep_dive_advanced-patterns", relevance: 4 },
          { chunk_id: "function_tryAsync", relevance: 4 },
          {
            chunk_id: "useTry_deep_dive_error-handling-patterns",
            relevance: 3,
          },
          {
            chunk_id: "TryErrorBoundary_deep_dive_hook-integration",
            relevance: 3,
          },
        ],
      },
      {
        query: "wrapError usage examples",
        category: "api-usage",
        expected_chunks: [
          { chunk_id: "function_wrapError", relevance: 4 },
          { chunk_id: "wrapError_deep_dive_quick-reference", relevance: 4 },
          {
            chunk_id: "wrapError_deep_dive_basic-usage-examples",
            relevance: 4,
          },
          {
            chunk_id: "wrapError_deep_dive_common-patterns-and-best-practices",
            relevance: 3,
          },
          { chunk_id: "function_fromThrown", relevance: 2 },
        ],
      },
      {
        query: "performance optimization tips",
        category: "optimization",
        expected_chunks: [
          {
            chunk_id: "configure_deep_dive_performance-impact-analysis",
            relevance: 4,
          },
          {
            chunk_id: "trySync_deep_dive_performance-optimization",
            relevance: 4,
          },
          {
            chunk_id: "tryAsync_deep_dive_performance-optimization",
            relevance: 4,
          },
          {
            chunk_id: "useTry_deep_dive_caching-and-performance",
            relevance: 3,
          },
          { chunk_id: "function_setupPerformance", relevance: 3 },
        ],
      },
      {
        query: "testing with try-error",
        category: "testing",
        expected_chunks: [
          { chunk_id: "trySync_deep_dive_testing-strategies", relevance: 4 },
          { chunk_id: "tryAsync_deep_dive_testing-strategies", relevance: 4 },
          {
            chunk_id: "TryErrorBoundary_deep_dive_testing-strategies",
            relevance: 4,
          },
          { chunk_id: "function_setupTesting", relevance: 3 },
          { chunk_id: "useTry_deep_dive_testing-strategies", relevance: 3 },
        ],
      },
      {
        query: "common mistakes and pitfalls",
        category: "troubleshooting",
        expected_chunks: [
          { chunk_id: "trySync_deep_dive_common-pitfalls", relevance: 4 },
          { chunk_id: "tryAsync_deep_dive_common-pitfalls", relevance: 4 },
          { chunk_id: "isTryError_deep_dive_common-pitfalls", relevance: 4 },
          { chunk_id: "configure_deep_dive_common-pitfalls", relevance: 3 },
          { chunk_id: "useTry_deep_dive_common-pitfalls", relevance: 3 },
        ],
      },
    ];

    // Build dataset
    groundTruthData.forEach((item, index) => {
      this.dataset.set(item.query, {
        id: index,
        query: item.query,
        category: item.category,
        expected_chunks: new Map(
          item.expected_chunks.map((chunk) => [chunk.chunk_id, chunk.relevance])
        ),
      });

      // Track categories
      if (!this.categories.has(item.category)) {
        this.categories.set(item.category, []);
      }
      this.categories.get(item.category).push(item.query);
    });

    console.log(
      `Generated ground truth dataset with ${this.dataset.size} queries across ${this.categories.size} categories`
    );
  }

  getDataset() {
    return Array.from(this.dataset.values());
  }

  getQuery(query) {
    return this.dataset.get(query);
  }

  getCategoryQueries(category) {
    return this.categories.get(category) || [];
  }

  getAllCategories() {
    return Array.from(this.categories.keys());
  }
}

class RetrievalStrategy {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  async retrieve(query, chunks, k = 10) {
    throw new Error("retrieve method must be implemented by subclass");
  }
}

class VectorRetrievalStrategy extends RetrievalStrategy {
  constructor(vectorDb) {
    super("vector", "Pure vector similarity search");
    this.vectorDb = vectorDb;
  }

  async retrieve(query, chunks, k = 10) {
    const results = await this.vectorDb.similaritySearch(query, k);
    return results.map((result) => ({
      chunk_id: result.chunk_id,
      score: result.similarity,
      chunk: result.chunk,
    }));
  }
}

class PatternRetrievalStrategy extends RetrievalStrategy {
  constructor(queryPatterns) {
    super("pattern", "Pattern-based query routing");
    this.queryPatterns = queryPatterns;
    this.chunks = new Map();
  }

  setChunks(chunks) {
    chunks.forEach((chunk) => {
      this.chunks.set(chunk.chunk_id, chunk);
    });
  }

  async retrieve(query, chunks, k = 10) {
    // Simple pattern matching implementation
    const queryLower = query.toLowerCase();
    const results = [];

    // Score chunks based on various factors
    chunks.forEach((chunk) => {
      let score = 0;

      // Title match
      if (chunk.title.toLowerCase().includes(queryLower)) {
        score += 0.8;
      }

      // Content match
      const contentMatches = (
        chunk.content.toLowerCase().match(new RegExp(queryLower, "g")) || []
      ).length;
      score += Math.min(contentMatches * 0.1, 0.5);

      // Semantic tag match
      const tags = chunk.metadata.semantic_tags || [];
      const tagMatches = tags.filter((tag) =>
        queryLower.includes(tag.toLowerCase())
      ).length;
      score += tagMatches * 0.3;

      // Function name match
      if (
        chunk.metadata.function_name &&
        queryLower.includes(chunk.metadata.function_name.toLowerCase())
      ) {
        score += 0.6;
      }

      if (score > 0) {
        results.push({
          chunk_id: chunk.chunk_id,
          score: score,
          chunk: chunk,
        });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, k);
  }
}

class HybridRetrievalStrategy extends RetrievalStrategy {
  constructor(
    vectorDb,
    queryPatterns,
    weights = { vector: 0.7, pattern: 0.3 }
  ) {
    super("hybrid", "Hybrid vector + pattern retrieval");
    this.vectorStrategy = new VectorRetrievalStrategy(vectorDb);
    this.patternStrategy = new PatternRetrievalStrategy(queryPatterns);
    this.weights = weights;
  }

  setChunks(chunks) {
    this.patternStrategy.setChunks(chunks);
  }

  async retrieve(query, chunks, k = 10) {
    // Get results from both strategies
    const vectorResults = await this.vectorStrategy.retrieve(
      query,
      chunks,
      k * 2
    );
    const patternResults = await this.patternStrategy.retrieve(
      query,
      chunks,
      k * 2
    );

    // Combine and re-score
    const combinedScores = new Map();

    vectorResults.forEach((result, index) => {
      const positionScore = 1 - index / vectorResults.length;
      const weightedScore = result.score * this.weights.vector * positionScore;
      combinedScores.set(result.chunk_id, {
        chunk_id: result.chunk_id,
        score: weightedScore,
        chunk: result.chunk,
        vector_score: result.score,
        pattern_score: 0,
      });
    });

    patternResults.forEach((result, index) => {
      const positionScore = 1 - index / patternResults.length;
      const weightedScore = result.score * this.weights.pattern * positionScore;

      if (combinedScores.has(result.chunk_id)) {
        const existing = combinedScores.get(result.chunk_id);
        existing.score += weightedScore;
        existing.pattern_score = result.score;
      } else {
        combinedScores.set(result.chunk_id, {
          chunk_id: result.chunk_id,
          score: weightedScore,
          chunk: result.chunk,
          vector_score: 0,
          pattern_score: result.score,
        });
      }
    });

    return Array.from(combinedScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

class RetrievalMetrics {
  static calculatePrecisionAtK(retrievedChunks, groundTruth, k) {
    const topK = retrievedChunks.slice(0, k);
    const relevant = topK.filter((chunk) => groundTruth.has(chunk.chunk_id));
    return relevant.length / k;
  }

  static calculateRecallAtK(retrievedChunks, groundTruth, k) {
    const topK = retrievedChunks.slice(0, k);
    const relevant = topK.filter((chunk) => groundTruth.has(chunk.chunk_id));
    return relevant.length / groundTruth.size;
  }

  static calculateMeanAveragePrecision(retrievedChunks, groundTruth) {
    let sumPrecision = 0;
    let relevantCount = 0;

    for (let i = 0; i < retrievedChunks.length; i++) {
      const chunk = retrievedChunks[i];
      if (groundTruth.has(chunk.chunk_id)) {
        relevantCount++;
        const precision = relevantCount / (i + 1);
        sumPrecision += precision;
      }
    }

    return groundTruth.size > 0 ? sumPrecision / groundTruth.size : 0;
  }

  static calculateNDCG(retrievedChunks, groundTruth, k) {
    const topK = retrievedChunks.slice(0, k);

    // Calculate DCG
    let dcg = 0;
    topK.forEach((chunk, index) => {
      const relevance = groundTruth.get(chunk.chunk_id) || 0;
      const gain = Math.pow(2, relevance) - 1;
      const discount = Math.log2(index + 2);
      dcg += gain / discount;
    });

    // Calculate IDCG (perfect ranking)
    const idealRelevances = Array.from(groundTruth.values()).sort(
      (a, b) => b - a
    );
    let idcg = 0;
    for (let i = 0; i < Math.min(k, idealRelevances.length); i++) {
      const relevance = idealRelevances[i];
      const gain = Math.pow(2, relevance) - 1;
      const discount = Math.log2(i + 2);
      idcg += gain / discount;
    }

    return idcg > 0 ? dcg / idcg : 0;
  }

  static calculateMRR(retrievedChunks, groundTruth) {
    for (let i = 0; i < retrievedChunks.length; i++) {
      if (groundTruth.has(retrievedChunks[i].chunk_id)) {
        return 1 / (i + 1);
      }
    }
    return 0;
  }

  static calculateF1Score(precision, recall) {
    if (precision + recall === 0) return 0;
    return (2 * (precision * recall)) / (precision + recall);
  }
}

class RetrievalAccuracyValidator {
  constructor(vectorDb, queryPatterns) {
    this.vectorDb = vectorDb;
    this.queryPatterns = queryPatterns;
    this.groundTruth = new GroundTruthDataset();
    this.chunks = [];

    // Initialize retrieval strategies
    this.strategies = new Map();
    this.strategies.set("vector", new VectorRetrievalStrategy(vectorDb));
    this.strategies.set("pattern", new PatternRetrievalStrategy(queryPatterns));
    this.strategies.set(
      "hybrid",
      new HybridRetrievalStrategy(vectorDb, queryPatterns)
    );
  }

  async initialize(chunksPath) {
    console.log("Initializing Retrieval Accuracy Validator...");

    // Load chunks
    this.chunks = await this.loadChunks(chunksPath);

    // Set chunks for pattern-based strategies
    this.strategies.get("pattern").setChunks(this.chunks);
    this.strategies.get("hybrid").setChunks(this.chunks);

    console.log(`Loaded ${this.chunks.length} chunks for validation`);
  }

  async loadChunks(chunksPath) {
    const chunkFiles = fs
      .readdirSync(chunksPath)
      .filter((file) => file.endsWith(".json") && file !== "index.json");

    const chunks = [];

    chunkFiles.forEach((file) => {
      const filePath = path.join(chunksPath, file);
      const chunkData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      chunks.push(chunkData);
    });

    return chunks;
  }

  async validateStrategy(strategyName, k = 10) {
    console.log(`\nValidating strategy: ${strategyName}`);

    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${strategyName}`);
    }

    const dataset = this.groundTruth.getDataset();
    const results = [];

    for (const testCase of dataset) {
      console.log(`  Testing query: "${testCase.query}"`);

      const startTime = Date.now();
      const retrievedChunks = await strategy.retrieve(
        testCase.query,
        this.chunks,
        k
      );
      const retrievalTime = Date.now() - startTime;

      // Calculate metrics
      const metrics = this.calculateMetrics(
        retrievedChunks,
        testCase.expected_chunks,
        k
      );

      results.push({
        query: testCase.query,
        category: testCase.category,
        retrieved_chunks: retrievedChunks.map((c) => ({
          chunk_id: c.chunk_id,
          score: c.score,
          relevant: testCase.expected_chunks.has(c.chunk_id),
          relevance: testCase.expected_chunks.get(c.chunk_id) || 0,
        })),
        metrics: metrics,
        retrieval_time: retrievalTime,
      });
    }

    // Calculate aggregate metrics
    const aggregateMetrics = this.calculateAggregateMetrics(results, k);

    return {
      strategy: strategyName,
      individual_results: results,
      aggregate_metrics: aggregateMetrics,
      total_queries: results.length,
    };
  }

  calculateMetrics(retrievedChunks, groundTruth, k) {
    const metrics = {};

    // Precision and Recall at different k values
    [1, 3, 5, 10].forEach((kValue) => {
      if (kValue <= k) {
        metrics[`precision@${kValue}`] = RetrievalMetrics.calculatePrecisionAtK(
          retrievedChunks,
          groundTruth,
          kValue
        );
        metrics[`recall@${kValue}`] = RetrievalMetrics.calculateRecallAtK(
          retrievedChunks,
          groundTruth,
          kValue
        );
      }
    });

    // F1 scores
    if (
      metrics["precision@5"] !== undefined &&
      metrics["recall@5"] !== undefined
    ) {
      metrics["f1@5"] = RetrievalMetrics.calculateF1Score(
        metrics["precision@5"],
        metrics["recall@5"]
      );
    }

    // Mean Average Precision
    metrics["map"] = RetrievalMetrics.calculateMeanAveragePrecision(
      retrievedChunks,
      groundTruth
    );

    // NDCG
    [5, 10].forEach((kValue) => {
      if (kValue <= k) {
        metrics[`ndcg@${kValue}`] = RetrievalMetrics.calculateNDCG(
          retrievedChunks,
          groundTruth,
          kValue
        );
      }
    });

    // Mean Reciprocal Rank
    metrics["mrr"] = RetrievalMetrics.calculateMRR(
      retrievedChunks,
      groundTruth
    );

    return metrics;
  }

  calculateAggregateMetrics(results, k) {
    const aggregateMetrics = {};

    // Get all metric names from first result
    const metricNames = Object.keys(results[0].metrics);

    // Calculate averages
    metricNames.forEach((metricName) => {
      const values = results.map((r) => r.metrics[metricName]);
      aggregateMetrics[metricName] = {
        mean: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        std: this.calculateStandardDeviation(values),
      };
    });

    // Calculate average retrieval time
    const retrievalTimes = results.map((r) => r.retrieval_time);
    aggregateMetrics.average_retrieval_time = {
      mean:
        retrievalTimes.reduce((sum, time) => sum + time, 0) /
        retrievalTimes.length,
      min: Math.min(...retrievalTimes),
      max: Math.max(...retrievalTimes),
    };

    // Category-wise performance
    aggregateMetrics.category_performance =
      this.calculateCategoryPerformance(results);

    return aggregateMetrics;
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance =
      squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateCategoryPerformance(results) {
    const categoryPerformance = {};

    // Group results by category
    const resultsByCategory = new Map();
    results.forEach((result) => {
      if (!resultsByCategory.has(result.category)) {
        resultsByCategory.set(result.category, []);
      }
      resultsByCategory.get(result.category).push(result);
    });

    // Calculate metrics for each category
    resultsByCategory.forEach((categoryResults, category) => {
      const precision5Values = categoryResults.map(
        (r) => r.metrics["precision@5"]
      );
      const ndcg5Values = categoryResults.map((r) => r.metrics["ndcg@5"]);

      categoryPerformance[category] = {
        query_count: categoryResults.length,
        avg_precision_at_5:
          precision5Values.reduce((sum, val) => sum + val, 0) /
          precision5Values.length,
        avg_ndcg_at_5:
          ndcg5Values.reduce((sum, val) => sum + val, 0) / ndcg5Values.length,
      };
    });

    return categoryPerformance;
  }

  async runComparison(strategies = ["vector", "pattern", "hybrid"], k = 10) {
    console.log(`Running comparison of ${strategies.length} strategies...`);

    const comparisonResults = {};

    for (const strategyName of strategies) {
      const result = await this.validateStrategy(strategyName, k);
      comparisonResults[strategyName] = result;
    }

    // Generate comparison summary
    const comparison = this.generateComparisonSummary(comparisonResults);

    return {
      results: comparisonResults,
      comparison: comparison,
      timestamp: new Date().toISOString(),
    };
  }

  generateComparisonSummary(results) {
    const summary = {
      best_strategy: {},
      metric_comparison: {},
      category_winners: {},
    };

    const strategies = Object.keys(results);
    const metrics = ["precision@5", "recall@5", "ndcg@5", "map", "mrr"];

    // Find best strategy for each metric
    metrics.forEach((metric) => {
      let bestStrategy = null;
      let bestScore = -1;

      strategies.forEach((strategy) => {
        const score = results[strategy].aggregate_metrics[metric].mean;
        if (score > bestScore) {
          bestScore = score;
          bestStrategy = strategy;
        }
      });

      summary.best_strategy[metric] = bestStrategy;

      // Create metric comparison
      summary.metric_comparison[metric] = {};
      strategies.forEach((strategy) => {
        summary.metric_comparison[metric][strategy] =
          results[strategy].aggregate_metrics[metric].mean;
      });
    });

    // Find category winners
    const categories = this.groundTruth.getAllCategories();
    categories.forEach((category) => {
      let bestStrategy = null;
      let bestScore = -1;

      strategies.forEach((strategy) => {
        const categoryPerf =
          results[strategy].aggregate_metrics.category_performance[category];
        if (categoryPerf) {
          const score = categoryPerf.avg_ndcg_at_5;
          if (score > bestScore) {
            bestScore = score;
            bestStrategy = strategy;
          }
        }
      });

      summary.category_winners[category] = bestStrategy;
    });

    return summary;
  }

  async saveResults(results, outputPath) {
    const outputFile = path.join(
      outputPath,
      `retrieval-accuracy-results-${Date.now()}.json`
    );

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${outputFile}`);

    return outputFile;
  }

  printComparisonSummary(comparison) {
    console.log("\n=== RETRIEVAL ACCURACY COMPARISON ===");

    console.log("\n--- Best Strategy by Metric ---");
    Object.entries(comparison.best_strategy).forEach(([metric, strategy]) => {
      console.log(`${metric}: ${strategy}`);
    });

    console.log("\n--- Metric Comparison ---");
    Object.entries(comparison.metric_comparison).forEach(
      ([metric, strategies]) => {
        console.log(`\n${metric.toUpperCase()}:`);
        Object.entries(strategies).forEach(([strategy, score]) => {
          console.log(`  ${strategy}: ${(score * 100).toFixed(1)}%`);
        });
      }
    );

    console.log("\n--- Category Winners ---");
    Object.entries(comparison.category_winners).forEach(
      ([category, strategy]) => {
        console.log(`${category}: ${strategy}`);
      }
    );

    console.log("\n=== COMPARISON COMPLETE ===");
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    strategy:
      args.find((arg) => arg.startsWith("--strategy="))?.substring(11) || "all",
    metrics:
      args.find((arg) => arg.startsWith("--metrics="))?.substring(10) || "all",
    benchmark: args.includes("--benchmark"),
    chunksPath:
      args.find((arg) => arg.startsWith("--chunks="))?.substring(9) ||
      "rag-optimization/chunks",
    patternsPath:
      args.find((arg) => arg.startsWith("--patterns="))?.substring(12) ||
      "rag-optimization/query-patterns.json",
  };

  try {
    // Load dependencies (mock vector DB)
    const { VectorDatabase } = require("./llm-integration-tester");
    const vectorDb = new VectorDatabase();
    await vectorDb.initialize(options.chunksPath);

    // Load query patterns
    let queryPatterns = null;
    if (fs.existsSync(options.patternsPath)) {
      queryPatterns = JSON.parse(fs.readFileSync(options.patternsPath, "utf8"));
    }

    // Initialize validator
    const validator = new RetrievalAccuracyValidator(vectorDb, queryPatterns);
    await validator.initialize(options.chunksPath);

    // Run validation
    let results;
    if (options.strategy === "all") {
      results = await validator.runComparison(["vector", "pattern", "hybrid"]);
      validator.printComparisonSummary(results.comparison);
    } else {
      const singleResult = await validator.validateStrategy(options.strategy);
      results = { results: { [options.strategy]: singleResult } };
    }

    // Save results
    await validator.saveResults(results, "rag-integration/results");
  } catch (error) {
    console.error("Validation failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  RetrievalAccuracyValidator,
  GroundTruthDataset,
  RetrievalMetrics,
};
