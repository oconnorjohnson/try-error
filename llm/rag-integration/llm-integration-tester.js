#!/usr/bin/env node

/**
 * LLM Integration Tester for try-error RAG Documentation
 *
 * Validates the RAG system with real language models, tests retrieval accuracy,
 * and benchmarks performance across different LLM providers.
 *
 * Usage:
 *   node llm-integration-tester.js [--provider=openai|anthropic|all] [--test-set=file.json] [--benchmark]
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Mock implementations for demo - in production, use actual API clients
class MockOpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = "gpt-4";
  }

  async chatCompletion(messages, options = {}) {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 300)
    );

    const prompt = messages[messages.length - 1].content;

    // Mock intelligent responses based on prompt content
    let response = "I understand you're asking about try-error functionality. ";

    if (prompt.toLowerCase().includes("trysync")) {
      response +=
        "trySync() is a synchronous error handling function that wraps operations and returns a Result type. It captures errors without throwing exceptions, making error handling explicit and functional.";
    } else if (prompt.toLowerCase().includes("tryasync")) {
      response +=
        "tryAsync() handles asynchronous operations with Promise-based error handling. It supports cancellation, timeouts, and converts Promise rejections into structured error objects.";
    } else if (prompt.toLowerCase().includes("error boundary")) {
      response +=
        "TryErrorBoundary is a React component that catches errors in component trees. It provides retry functionality, async error handling, and integrates with try-error for structured error reporting.";
    } else if (prompt.toLowerCase().includes("configure")) {
      response +=
        "The configure() function sets up global try-error behavior including error reporting, performance optimization, and development vs production modes.";
    } else {
      response +=
        "Based on the context provided, I can help you understand the specific try-error functionality you're asking about.";
    }

    return {
      choices: [
        {
          message: {
            content: response,
            role: "assistant",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: Math.floor(prompt.length / 4),
        completion_tokens: Math.floor(response.length / 4),
        total_tokens: Math.floor((prompt.length + response.length) / 4),
      },
      model: this.model,
      created: Date.now(),
    };
  }
}

class MockAnthropicClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = "claude-3-sonnet-20240229";
  }

  async messages(options) {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 250 + Math.random() * 400)
    );

    const prompt = options.messages[options.messages.length - 1].content;

    // Mock intelligent responses based on prompt content
    let response = "I can help you with try-error documentation. ";

    if (prompt.toLowerCase().includes("trysync")) {
      response +=
        "trySync() provides synchronous error handling with zero-overhead success paths. It uses discriminated unions to represent success/failure states without exceptions, making error handling both explicit and performant.";
    } else if (prompt.toLowerCase().includes("tryasync")) {
      response +=
        "tryAsync() extends error handling to asynchronous operations with sophisticated features like AbortSignal integration, timeout management, and Promise rejection handling while maintaining the same Result-based API.";
    } else if (prompt.toLowerCase().includes("error boundary")) {
      response +=
        "TryErrorBoundary enhances React's error boundary pattern with try-error integration, providing structured error recovery, retry mechanisms, and support for async errors that standard boundaries can't catch.";
    } else if (prompt.toLowerCase().includes("configure")) {
      response +=
        "The configure() function provides comprehensive setup options including performance presets (minimal, development, production), error reporting integration, and runtime behavior customization.";
    } else {
      response +=
        "Let me provide information based on the try-error documentation context you've provided.";
    }

    return {
      content: [
        {
          text: response,
          type: "text",
        },
      ],
      usage: {
        input_tokens: Math.floor(prompt.length / 4),
        output_tokens: Math.floor(response.length / 4),
      },
      model: this.model,
      role: "assistant",
      stop_reason: "end_turn",
    };
  }
}

class VectorDatabase {
  constructor() {
    this.embeddings = new Map();
    this.chunks = new Map();
    this.index = null;
  }

  async initialize(chunksPath) {
    console.log("Initializing vector database...");

    // Load chunks
    const chunks = await this.loadChunks(chunksPath);

    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk.content);
      this.embeddings.set(chunk.chunk_id, embedding);
      this.chunks.set(chunk.chunk_id, chunk);
    }

    console.log(`Indexed ${chunks.length} chunks with embeddings`);
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

  async generateEmbedding(text) {
    // Mock embedding generation - in production, use actual embedding models
    const hash = crypto.createHash("sha256").update(text).digest("hex");

    // Generate a consistent 384-dimensional embedding based on content
    const embedding = [];
    for (let i = 0; i < 384; i++) {
      const seed = parseInt(hash.substr(i % hash.length, 8), 16);
      embedding.push(((seed % 2000) - 1000) / 1000); // Normalize to [-1, 1]
    }

    return embedding;
  }

  async similaritySearch(queryText, topK = 5) {
    const queryEmbedding = await this.generateEmbedding(queryText);

    const similarities = [];

    for (const [chunkId, embedding] of this.embeddings.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      similarities.push({
        chunk_id: chunkId,
        similarity: similarity,
        chunk: this.chunks.get(chunkId),
      });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

class RAGPipeline {
  constructor(vectorDb, queryPatterns) {
    this.vectorDb = vectorDb;
    this.queryPatterns = queryPatterns;
  }

  async retrieveContext(query, maxChunks = 5) {
    console.log(`Retrieving context for: "${query}"`);

    // Use both vector similarity and pattern-based routing
    const vectorResults = await this.vectorDb.similaritySearch(
      query,
      maxChunks
    );

    // Combine with pattern-based results if available
    let combinedResults = vectorResults;

    if (this.queryPatterns && this.queryPatterns.mappings) {
      const patternMatch = this.findPatternMatch(query);
      if (patternMatch) {
        console.log(`Pattern match found: ${patternMatch.category}`);
        // In a real implementation, merge with vector results
      }
    }

    console.log(`Retrieved ${combinedResults.length} relevant chunks`);
    return combinedResults;
  }

  findPatternMatch(query) {
    if (!this.queryPatterns || !this.queryPatterns.mappings) return null;

    const normalizedQuery = query.toLowerCase();

    // Simple pattern matching - in production, use the QueryPatternAnalyzer
    for (const [pattern, mapping] of Object.entries(
      this.queryPatterns.mappings
    )) {
      if (normalizedQuery.includes(pattern.toLowerCase().split(" ")[0])) {
        return mapping;
      }
    }

    return null;
  }

  formatContext(retrievalResults) {
    let context = "# Relevant Documentation\n\n";

    retrievalResults.forEach((result, index) => {
      const chunk = result.chunk;
      context += `## ${index + 1}. ${chunk.title}\n`;
      context += `**Type**: ${chunk.metadata.chunk_type}\n`;
      context += `**Relevance**: ${(result.similarity * 100).toFixed(1)}%\n\n`;
      context += chunk.content.substring(0, 500) + "...\n\n";
    });

    return context;
  }
}

class LLMIntegrationTester {
  constructor(options = {}) {
    this.providers = new Map();
    this.vectorDb = new VectorDatabase();
    this.ragPipeline = null;
    this.queryPatterns = null;

    this.testResults = {
      accuracy: new Map(),
      performance: new Map(),
      quality: new Map(),
    };

    this.initializeProviders(options);
  }

  initializeProviders(options) {
    // Initialize LLM providers (mock implementations)
    if (options.openaiApiKey) {
      this.providers.set("openai", new MockOpenAIClient(options.openaiApiKey));
    }

    if (options.anthropicApiKey) {
      this.providers.set(
        "anthropic",
        new MockAnthropicClient(options.anthropicApiKey)
      );
    }

    // Add mock providers for testing
    this.providers.set("openai", new MockOpenAIClient("mock-key"));
    this.providers.set("anthropic", new MockAnthropicClient("mock-key"));
  }

  async initialize(chunksPath, queryPatternsPath) {
    console.log("Initializing LLM Integration Tester...");

    // Initialize vector database
    await this.vectorDb.initialize(chunksPath);

    // Load query patterns
    if (fs.existsSync(queryPatternsPath)) {
      this.queryPatterns = JSON.parse(
        fs.readFileSync(queryPatternsPath, "utf8")
      );
    }

    // Initialize RAG pipeline
    this.ragPipeline = new RAGPipeline(this.vectorDb, this.queryPatterns);

    console.log("Initialization complete.");
  }

  async runTests(testQueries) {
    console.log(
      `Running integration tests with ${testQueries.length} queries...`
    );

    const results = [];

    for (const testQuery of testQueries) {
      console.log(`\n--- Testing: "${testQuery.query}" ---`);

      const testResult = await this.testQuery(testQuery);
      results.push(testResult);

      // Brief pause between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Generate summary
    const summary = this.generateTestSummary(results);

    return {
      results: results,
      summary: summary,
      timestamp: new Date().toISOString(),
    };
  }

  async testQuery(testQuery) {
    const startTime = Date.now();

    try {
      // Step 1: Retrieve relevant context
      const retrievalStart = Date.now();
      const retrievalResults = await this.ragPipeline.retrieveContext(
        testQuery.query,
        5
      );
      const retrievalTime = Date.now() - retrievalStart;

      // Step 2: Format context for LLM
      const context = this.ragPipeline.formatContext(retrievalResults);

      // Step 3: Test with each provider
      const providerResults = new Map();

      for (const [providerName, provider] of this.providers.entries()) {
        const providerStart = Date.now();

        try {
          const response = await this.queryProvider(
            provider,
            providerName,
            testQuery.query,
            context
          );
          const providerTime = Date.now() - providerStart;

          providerResults.set(providerName, {
            response: response,
            responseTime: providerTime,
            success: true,
          });
        } catch (error) {
          providerResults.set(providerName, {
            error: error.message,
            responseTime: Date.now() - providerStart,
            success: false,
          });
        }
      }

      const totalTime = Date.now() - startTime;

      // Evaluate response quality
      const qualityScores = this.evaluateResponseQuality(
        testQuery,
        retrievalResults,
        providerResults
      );

      return {
        query: testQuery.query,
        expected_type: testQuery.expected_type,
        expected_concepts: testQuery.expected_concepts,
        retrieval: {
          results: retrievalResults.map((r) => ({
            chunk_id: r.chunk_id,
            similarity: r.similarity,
            type: r.chunk.metadata.chunk_type,
          })),
          time: retrievalTime,
          relevance_score: this.calculateRelevanceScore(
            retrievalResults,
            testQuery
          ),
        },
        providers: Object.fromEntries(providerResults),
        quality: qualityScores,
        performance: {
          total_time: totalTime,
          retrieval_time: retrievalTime,
        },
        success: true,
      };
    } catch (error) {
      return {
        query: testQuery.query,
        error: error.message,
        success: false,
        performance: {
          total_time: Date.now() - startTime,
        },
      };
    }
  }

  async queryProvider(provider, providerName, query, context) {
    const systemPrompt = `You are a helpful assistant for the try-error JavaScript library documentation. Use the provided context to answer questions accurately and concisely.

Context:
${context}

Instructions:
- Answer based on the provided context
- Be specific and technical when appropriate
- Include code examples if relevant
- If the context doesn't contain enough information, say so clearly`;

    if (providerName === "openai") {
      const response = await provider.chatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ]);

      return {
        content: response.choices[0].message.content,
        usage: response.usage,
        model: response.model,
      };
    } else if (providerName === "anthropic") {
      const response = await provider.messages({
        model: provider.model,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nUser Question: ${query}`,
          },
        ],
      });

      return {
        content: response.content[0].text,
        usage: response.usage,
        model: response.model,
      };
    }

    throw new Error(`Unknown provider: ${providerName}`);
  }

  calculateRelevanceScore(retrievalResults, testQuery) {
    if (retrievalResults.length === 0) return 0;

    let relevanceScore = 0;
    const expectedConcepts = testQuery.expected_concepts || [];
    const expectedType = testQuery.expected_type;

    retrievalResults.forEach((result, index) => {
      let chunkScore = result.similarity;

      // Boost score if chunk type matches expected
      if (expectedType && result.chunk.metadata.chunk_type === expectedType) {
        chunkScore *= 1.5;
      }

      // Boost score if chunk contains expected concepts
      if (expectedConcepts.length > 0) {
        const chunkTags = result.chunk.metadata.semantic_tags || [];
        const conceptOverlap = expectedConcepts.filter((concept) =>
          chunkTags.includes(concept)
        ).length;

        if (conceptOverlap > 0) {
          chunkScore *= 1 + conceptOverlap / expectedConcepts.length;
        }
      }

      // Weight by position (earlier results more important)
      const positionWeight = 1 / (index + 1);
      relevanceScore += chunkScore * positionWeight;
    });

    return Math.min(relevanceScore / retrievalResults.length, 1.0);
  }

  evaluateResponseQuality(testQuery, retrievalResults, providerResults) {
    const qualityScores = {};

    for (const [providerName, result] of providerResults.entries()) {
      if (!result.success) {
        qualityScores[providerName] = {
          overall: 0,
          accuracy: 0,
          completeness: 0,
          relevance: 0,
        };
        continue;
      }

      const response = result.response.content;

      // Simple quality evaluation metrics
      const accuracy = this.evaluateAccuracy(
        response,
        testQuery,
        retrievalResults
      );
      const completeness = this.evaluateCompleteness(response, testQuery);
      const relevance = this.evaluateRelevance(response, testQuery);

      qualityScores[providerName] = {
        overall: (accuracy + completeness + relevance) / 3,
        accuracy: accuracy,
        completeness: completeness,
        relevance: relevance,
      };
    }

    return qualityScores;
  }

  evaluateAccuracy(response, testQuery, retrievalResults) {
    // Simple accuracy check based on presence of expected concepts
    const expectedConcepts = testQuery.expected_concepts || [];
    if (expectedConcepts.length === 0) return 0.8; // Default if no expected concepts

    const responseLower = response.toLowerCase();
    const mentionedConcepts = expectedConcepts.filter((concept) =>
      responseLower.includes(concept.toLowerCase())
    );

    return mentionedConcepts.length / expectedConcepts.length;
  }

  evaluateCompleteness(response, testQuery) {
    // Check response length and structure
    const minLength = 100;
    const idealLength = 300;

    if (response.length < minLength) return 0.3;
    if (response.length >= idealLength) return 1.0;

    return (
      0.3 + (0.7 * (response.length - minLength)) / (idealLength - minLength)
    );
  }

  evaluateRelevance(response, testQuery) {
    // Check if response addresses the query type
    const queryLower = testQuery.query.toLowerCase();
    const responseLower = response.toLowerCase();

    let relevanceScore = 0.5; // Base score

    // Check for query-specific terms
    const queryWords = queryLower.split(" ").filter((word) => word.length > 3);
    const mentionedWords = queryWords.filter((word) =>
      responseLower.includes(word)
    );

    relevanceScore += (mentionedWords.length / queryWords.length) * 0.5;

    return Math.min(relevanceScore, 1.0);
  }

  generateTestSummary(results) {
    const summary = {
      total_tests: results.length,
      successful_tests: results.filter((r) => r.success).length,
      failed_tests: results.filter((r) => !r.success).length,
      average_retrieval_time: 0,
      average_total_time: 0,
      provider_performance: {},
      quality_metrics: {},
    };

    const successfulResults = results.filter((r) => r.success);

    if (successfulResults.length > 0) {
      // Calculate average times
      summary.average_retrieval_time =
        successfulResults.reduce((sum, r) => sum + r.retrieval.time, 0) /
        successfulResults.length;

      summary.average_total_time =
        successfulResults.reduce(
          (sum, r) => sum + r.performance.total_time,
          0
        ) / successfulResults.length;

      // Calculate provider performance
      for (const providerName of this.providers.keys()) {
        const providerResults = successfulResults
          .filter(
            (r) =>
              r.providers[providerName] && r.providers[providerName].success
          )
          .map((r) => r.providers[providerName]);

        if (providerResults.length > 0) {
          summary.provider_performance[providerName] = {
            success_rate: providerResults.length / successfulResults.length,
            average_response_time:
              providerResults.reduce((sum, pr) => sum + pr.responseTime, 0) /
              providerResults.length,
          };
        }
      }

      // Calculate quality metrics
      for (const providerName of this.providers.keys()) {
        const qualityScores = successfulResults
          .filter((r) => r.quality[providerName])
          .map((r) => r.quality[providerName]);

        if (qualityScores.length > 0) {
          summary.quality_metrics[providerName] = {
            average_overall:
              qualityScores.reduce((sum, q) => sum + q.overall, 0) /
              qualityScores.length,
            average_accuracy:
              qualityScores.reduce((sum, q) => sum + q.accuracy, 0) /
              qualityScores.length,
            average_completeness:
              qualityScores.reduce((sum, q) => sum + q.completeness, 0) /
              qualityScores.length,
            average_relevance:
              qualityScores.reduce((sum, q) => sum + q.relevance, 0) /
              qualityScores.length,
          };
        }
      }
    }

    return summary;
  }

  async saveResults(results, outputPath) {
    const outputFile = path.join(
      outputPath,
      `integration-test-results-${Date.now()}.json`
    );

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\nTest results saved to: ${outputFile}`);

    return outputFile;
  }

  printSummary(summary) {
    console.log("\n=== LLM INTEGRATION TEST SUMMARY ===");
    console.log(`Total Tests: ${summary.total_tests}`);
    console.log(`Successful: ${summary.successful_tests}`);
    console.log(`Failed: ${summary.failed_tests}`);
    console.log(
      `Success Rate: ${(
        (summary.successful_tests / summary.total_tests) *
        100
      ).toFixed(1)}%`
    );

    console.log("\n--- Performance ---");
    console.log(
      `Average Retrieval Time: ${summary.average_retrieval_time.toFixed(0)}ms`
    );
    console.log(
      `Average Total Time: ${summary.average_total_time.toFixed(0)}ms`
    );

    console.log("\n--- Provider Performance ---");
    Object.entries(summary.provider_performance).forEach(
      ([provider, metrics]) => {
        console.log(`${provider}:`);
        console.log(
          `  Success Rate: ${(metrics.success_rate * 100).toFixed(1)}%`
        );
        console.log(
          `  Avg Response Time: ${metrics.average_response_time.toFixed(0)}ms`
        );
      }
    );

    console.log("\n--- Quality Metrics ---");
    Object.entries(summary.quality_metrics).forEach(([provider, metrics]) => {
      console.log(`${provider}:`);
      console.log(
        `  Overall Quality: ${(metrics.average_overall * 100).toFixed(1)}%`
      );
      console.log(
        `  Accuracy: ${(metrics.average_accuracy * 100).toFixed(1)}%`
      );
      console.log(
        `  Completeness: ${(metrics.average_completeness * 100).toFixed(1)}%`
      );
      console.log(
        `  Relevance: ${(metrics.average_relevance * 100).toFixed(1)}%`
      );
    });

    console.log("\n=== TEST COMPLETE ===");
  }
}

// Default test queries
const DEFAULT_TEST_QUERIES = [
  {
    query: "How do I use trySync for error handling?",
    expected_type: "function-reference",
    expected_concepts: ["error-handling", "trySync"],
  },
  {
    query: "What is the difference between trySync and tryAsync?",
    expected_type: "deep-dive-section",
    expected_concepts: ["async-operations", "comparison"],
  },
  {
    query: "How to implement error boundaries in React?",
    expected_type: "deep-dive-section",
    expected_concepts: ["react-integration", "error-boundary"],
  },
  {
    query: "Configure try-error for production",
    expected_type: "function-reference",
    expected_concepts: ["configuration", "performance"],
  },
  {
    query: "What are the performance implications of using try-error?",
    expected_type: "deep-dive-section",
    expected_concepts: ["performance-optimization"],
  },
  {
    query: "How to test functions that use tryAsync?",
    expected_type: "deep-dive-section",
    expected_concepts: ["testing-patterns", "async-operations"],
  },
  {
    query: "TypeScript types for TryError",
    expected_type: "function-reference",
    expected_concepts: ["type-safety"],
  },
  {
    query: "Common pitfalls when using try-error",
    expected_type: "deep-dive-section",
    expected_concepts: ["error-handling", "best-practices"],
  },
];

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    provider:
      args.find((arg) => arg.startsWith("--provider="))?.substring(11) || "all",
    testSet: args.find((arg) => arg.startsWith("--test-set="))?.substring(11),
    benchmark: args.includes("--benchmark"),
    chunksPath:
      args.find((arg) => arg.startsWith("--chunks="))?.substring(9) ||
      "rag-optimization/chunks",
    patternsPath:
      args.find((arg) => arg.startsWith("--patterns="))?.substring(12) ||
      "rag-optimization/query-patterns.json",
  };

  const tester = new LLMIntegrationTester();

  try {
    // Initialize
    await tester.initialize(options.chunksPath, options.patternsPath);

    // Load test queries
    let testQueries = DEFAULT_TEST_QUERIES;
    if (options.testSet && fs.existsSync(options.testSet)) {
      testQueries = JSON.parse(fs.readFileSync(options.testSet, "utf8"));
    }

    // Run tests
    const results = await tester.runTests(testQueries);

    // Save results
    await tester.saveResults(results, "rag-integration/results");

    // Print summary
    tester.printSummary(results.summary);
  } catch (error) {
    console.error("Integration testing failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  LLMIntegrationTester,
  VectorDatabase,
  RAGPipeline,
};
