#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vector Database Integration System
 * Provides embedding generation, storage, and similarity search
 */

class VectorDatabase {
  constructor(options = {}) {
    this.dimension = options.dimension || 1536; // OpenAI ada-002 dimension
    this.storageDir =
      options.storageDir || path.join(__dirname, "vector-storage");
    this.indexFile = path.join(this.storageDir, "index.json");
    this.embeddings = new Map();
    this.metadata = new Map();
    this.index = null;
    this.maxResults = options.maxResults || 10;
    this.similarityThreshold = options.similarityThreshold || 0.7;

    this.initializeStorage();
  }

  initializeStorage() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    this.loadIndex();
  }

  /**
   * Generate embeddings for text (mock implementation)
   * In production, this would call OpenAI's embedding API
   */
  async generateEmbedding(text) {
    // Mock embedding generation - creates consistent embeddings based on text hash
    const hash = crypto.createHash("sha256").update(text).digest("hex");
    const embedding = [];

    for (let i = 0; i < this.dimension; i++) {
      const seed = parseInt(hash.substring(i % 64, (i % 64) + 8), 16);
      embedding.push((seed / 0xffffffff) * 2 - 1); // Normalize to [-1, 1]
    }

    // Add some semantic-based variation
    const words = text.toLowerCase().split(/\s+/);
    const semanticBoost =
      words.reduce((acc, word) => {
        const wordHash = crypto.createHash("md5").update(word).digest("hex");
        return acc + parseInt(wordHash.substring(0, 8), 16) / 0xffffffff;
      }, 0) / words.length;

    return embedding.map((val) => val * (0.8 + semanticBoost * 0.4));
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error("Vector dimensions must match");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Add document with embedding to the database
   */
  async addDocument(id, text, metadata = {}) {
    const embedding = await this.generateEmbedding(text);

    this.embeddings.set(id, embedding);
    this.metadata.set(id, {
      ...metadata,
      text,
      id,
      timestamp: Date.now(),
    });

    await this.saveIndex();
    return id;
  }

  /**
   * Search for similar documents
   */
  async search(query, options = {}) {
    const queryEmbedding = await this.generateEmbedding(query);
    const maxResults = options.maxResults || this.maxResults;
    const threshold = options.threshold || this.similarityThreshold;

    const results = [];

    for (const [id, embedding] of this.embeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);

      if (similarity >= threshold) {
        results.push({
          id,
          similarity,
          metadata: this.metadata.get(id),
        });
      }
    }

    // Sort by similarity score (descending)
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, maxResults);
  }

  /**
   * Hybrid search combining vector similarity and keyword matching
   */
  async hybridSearch(query, options = {}) {
    const vectorResults = await this.search(query, options);
    const keywordResults = this.keywordSearch(query, options);

    // Combine and rerank results
    const combined = new Map();

    // Add vector results with weight
    vectorResults.forEach((result) => {
      combined.set(result.id, {
        ...result,
        vectorScore: result.similarity,
        keywordScore: 0,
        combinedScore: result.similarity * 0.7,
      });
    });

    // Add keyword results with weight
    keywordResults.forEach((result) => {
      if (combined.has(result.id)) {
        const existing = combined.get(result.id);
        existing.keywordScore = result.score;
        existing.combinedScore =
          existing.vectorScore * 0.7 + result.score * 0.3;
      } else {
        combined.set(result.id, {
          ...result,
          vectorScore: 0,
          keywordScore: result.score,
          combinedScore: result.score * 0.3,
        });
      }
    });

    // Sort by combined score
    const finalResults = Array.from(combined.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, options.maxResults || this.maxResults);

    return finalResults;
  }

  /**
   * Keyword-based search for comparison
   */
  keywordSearch(query, options = {}) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results = [];

    for (const [id, metadata] of this.metadata) {
      const text = metadata.text.toLowerCase();
      let score = 0;

      queryTerms.forEach((term) => {
        const regex = new RegExp(term, "gi");
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
        }
      });

      if (score > 0) {
        results.push({
          id,
          score: score / queryTerms.length,
          metadata,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Get document by ID
   */
  getDocument(id) {
    return this.metadata.get(id);
  }

  /**
   * Remove document from database
   */
  async removeDocument(id) {
    this.embeddings.delete(id);
    this.metadata.delete(id);
    await this.saveIndex();
  }

  /**
   * Get database statistics
   */
  getStats() {
    return {
      totalDocuments: this.embeddings.size,
      dimension: this.dimension,
      averageEmbeddingMagnitude: this.getAverageEmbeddingMagnitude(),
      storageSize: this.getStorageSize(),
    };
  }

  getAverageEmbeddingMagnitude() {
    if (this.embeddings.size === 0) return 0;

    let totalMagnitude = 0;
    for (const embedding of this.embeddings.values()) {
      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0)
      );
      totalMagnitude += magnitude;
    }

    return totalMagnitude / this.embeddings.size;
  }

  getStorageSize() {
    try {
      const stats = fs.statSync(this.indexFile);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Save index to disk
   */
  async saveIndex() {
    const index = {
      metadata: Object.fromEntries(this.metadata),
      embeddings: Object.fromEntries(this.embeddings),
      config: {
        dimension: this.dimension,
        maxResults: this.maxResults,
        similarityThreshold: this.similarityThreshold,
      },
    };

    await fs.promises.writeFile(this.indexFile, JSON.stringify(index, null, 2));
  }

  /**
   * Load index from disk
   */
  loadIndex() {
    try {
      if (fs.existsSync(this.indexFile)) {
        const data = JSON.parse(fs.readFileSync(this.indexFile, "utf8"));

        this.metadata = new Map(Object.entries(data.metadata || {}));
        this.embeddings = new Map(Object.entries(data.embeddings || {}));

        if (data.config) {
          this.dimension = data.config.dimension || this.dimension;
          this.maxResults = data.config.maxResults || this.maxResults;
          this.similarityThreshold =
            data.config.similarityThreshold || this.similarityThreshold;
        }
      }
    } catch (error) {
      console.warn("Failed to load index:", error.message);
    }
  }

  /**
   * Clear all data
   */
  async clear() {
    this.embeddings.clear();
    this.metadata.clear();
    await this.saveIndex();
  }
}

/**
 * RAG Vector Database Integration
 */
class RAGVectorDatabase extends VectorDatabase {
  constructor(options = {}) {
    super(options);
    this.chunksFile = path.join(
      __dirname,
      "../rag-optimization/chunks/index.json"
    );
    this.enhancedChunksFile = path.join(
      __dirname,
      "../rag-optimization/enhanced-chunks.json"
    );
  }

  /**
   * Index all chunks from the RAG optimization phase
   */
  async indexChunks() {
    console.log("🔄 Indexing chunks into vector database...");

    let chunks = [];

    // Try to load enhanced chunks first, fall back to regular chunks
    try {
      if (fs.existsSync(this.enhancedChunksFile)) {
        chunks = JSON.parse(fs.readFileSync(this.enhancedChunksFile, "utf8"));
        console.log("📚 Loaded enhanced chunks");
      } else if (fs.existsSync(this.chunksFile)) {
        chunks = JSON.parse(fs.readFileSync(this.chunksFile, "utf8"));
        console.log("📚 Loaded regular chunks");
      } else {
        throw new Error("No chunks file found");
      }
    } catch (error) {
      console.error("❌ Failed to load chunks:", error.message);
      return;
    }

    const startTime = Date.now();
    let indexed = 0;

    for (const chunk of chunks) {
      try {
        await this.addDocument(chunk.id, chunk.content, {
          type: chunk.type,
          title: chunk.title,
          source: chunk.source,
          tokens: chunk.tokens,
          semanticTags: chunk.semanticTags || [],
          crossReferences: chunk.crossReferences || [],
          queryOptimizations: chunk.queryOptimizations || [],
        });

        indexed++;

        if (indexed % 50 === 0) {
          console.log(`  📝 Indexed ${indexed}/${chunks.length} chunks`);
        }
      } catch (error) {
        console.error(`❌ Failed to index chunk ${chunk.id}:`, error.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Indexed ${indexed} chunks in ${duration}ms`);

    return { indexed, duration };
  }

  /**
   * Enhanced RAG search with semantic understanding
   */
  async ragSearch(query, options = {}) {
    const searchOptions = {
      maxResults: options.maxResults || 5,
      threshold: options.threshold || 0.6,
      includeMetadata: true,
      ...options,
    };

    // Perform hybrid search
    const results = await this.hybridSearch(query, searchOptions);

    // Enhanced ranking based on semantic tags and cross-references
    const enhancedResults = results.map((result) => {
      let relevanceBoost = 0;

      // Boost based on semantic tags
      if (result.metadata.semanticTags) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const tagMatches = result.metadata.semanticTags.filter((tag) =>
          queryTerms.some((term) => tag.toLowerCase().includes(term))
        );
        relevanceBoost += tagMatches.length * 0.1;
      }

      // Boost based on cross-references
      if (result.metadata.crossReferences) {
        relevanceBoost += result.metadata.crossReferences.length * 0.05;
      }

      return {
        ...result,
        relevanceScore: result.combinedScore + relevanceBoost,
        debug: {
          originalScore: result.combinedScore,
          relevanceBoost,
          semanticTags: result.metadata.semanticTags?.slice(0, 5) || [],
          crossReferences: result.metadata.crossReferences?.slice(0, 3) || [],
        },
      };
    });

    // Re-sort by enhanced relevance
    enhancedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return enhancedResults;
  }

  /**
   * Get contextual recommendations based on document
   */
  async getRecommendations(documentId, options = {}) {
    const document = this.getDocument(documentId);
    if (!document) {
      return [];
    }

    // Use document content and cross-references for recommendations
    const recommendationQuery = document.text.substring(0, 500);
    const results = await this.ragSearch(recommendationQuery, {
      maxResults: options.maxResults || 3,
      threshold: 0.5,
    });

    // Filter out the original document
    return results.filter((result) => result.id !== documentId);
  }
}

/**
 * CLI Interface
 */
async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log(`
🔍 Vector Database Integration Tool

Usage:
  node vector-database.js <command> [options]

Commands:
  index        Index all RAG chunks into vector database
  search       Search the vector database
  stats        Show database statistics
  clear        Clear all data
  test         Run comprehensive tests

Examples:
  node vector-database.js index
  node vector-database.js search "how to use trySync"
  node vector-database.js stats
  node vector-database.js test
`);
    process.exit(1);
  }

  const db = new RAGVectorDatabase();

  try {
    switch (command) {
      case "index":
        await db.indexChunks();
        break;

      case "search":
        const query = process.argv[3];
        if (!query) {
          console.error("❌ Please provide a search query");
          process.exit(1);
        }

        console.log(`🔍 Searching for: "${query}"`);
        const results = await db.ragSearch(query);

        console.log(`\n📊 Found ${results.length} results:`);
        results.forEach((result, index) => {
          console.log(`\n${index + 1}. ${result.metadata.title || result.id}`);
          console.log(`   Score: ${result.relevanceScore.toFixed(3)}`);
          console.log(`   Type: ${result.metadata.type}`);
          console.log(`   Source: ${result.metadata.source}`);
          console.log(
            `   Content: ${result.metadata.text.substring(0, 200)}...`
          );
        });
        break;

      case "stats":
        const stats = db.getStats();
        console.log("📊 Database Statistics:");
        console.log(`  Documents: ${stats.totalDocuments}`);
        console.log(`  Dimension: ${stats.dimension}`);
        console.log(
          `  Average Magnitude: ${stats.averageEmbeddingMagnitude.toFixed(4)}`
        );
        console.log(`  Storage Size: ${stats.storageSize} bytes`);
        break;

      case "clear":
        await db.clear();
        console.log("✅ Database cleared");
        break;

      case "test":
        await runTests(db);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

/**
 * Comprehensive test suite
 */
async function runTests(db) {
  console.log("🧪 Running Vector Database Tests...\n");

  const tests = [
    { name: "Basic Operations", fn: testBasicOperations },
    { name: "Similarity Search", fn: testSimilaritySearch },
    { name: "Hybrid Search", fn: testHybridSearch },
    { name: "RAG Integration", fn: testRAGIntegration },
    { name: "Performance", fn: testPerformance },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔄 Running ${test.name}...`);
      await test.fn(db);
      console.log(`✅ ${test.name} passed`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function testBasicOperations(db) {
  // Clear database
  await db.clear();

  // Add document
  const docId = await db.addDocument(
    "test-1",
    "This is a test document about try-catch error handling"
  );
  if (docId !== "test-1") throw new Error("Document ID mismatch");

  // Get document
  const doc = db.getDocument("test-1");
  if (!doc) throw new Error("Document not found");

  // Remove document
  await db.removeDocument("test-1");
  const removedDoc = db.getDocument("test-1");
  if (removedDoc) throw new Error("Document not removed");
}

async function testSimilaritySearch(db) {
  await db.clear();

  // Add test documents
  await db.addDocument("doc-1", "Error handling with try-catch blocks");
  await db.addDocument("doc-2", "Asynchronous programming with promises");
  await db.addDocument("doc-3", "Error management in JavaScript applications");

  // Search for similar documents
  const results = await db.search("error handling");

  if (results.length === 0) throw new Error("No results found");
  if (results[0].similarity <= 0) throw new Error("Invalid similarity score");

  // Results should be sorted by similarity
  for (let i = 1; i < results.length; i++) {
    if (results[i].similarity > results[i - 1].similarity) {
      throw new Error("Results not sorted by similarity");
    }
  }
}

async function testHybridSearch(db) {
  await db.clear();

  // Add test documents with different relevance patterns
  await db.addDocument(
    "hybrid-1",
    "trySync function for synchronous error handling"
  );
  await db.addDocument("hybrid-2", "async await pattern with error management");
  await db.addDocument("hybrid-3", "synchronous operations with try-catch");

  // Test hybrid search
  const results = await db.hybridSearch("synchronous error");

  if (results.length === 0) throw new Error("No hybrid search results");
  if (!results[0].hasOwnProperty("combinedScore"))
    throw new Error("Missing combined score");
  if (!results[0].hasOwnProperty("vectorScore"))
    throw new Error("Missing vector score");
  if (!results[0].hasOwnProperty("keywordScore"))
    throw new Error("Missing keyword score");
}

async function testRAGIntegration(db) {
  // Test RAG-specific search
  const results = await db.ragSearch("error handling configuration");

  // Should return enhanced results with relevance scores
  if (results.length > 0) {
    const result = results[0];
    if (!result.hasOwnProperty("relevanceScore"))
      throw new Error("Missing relevance score");
    if (!result.hasOwnProperty("debug"))
      throw new Error("Missing debug information");
  }

  // Test recommendations
  if (results.length > 0) {
    const recommendations = await db.getRecommendations(results[0].id);
    // Should not include the original document
    if (recommendations.some((rec) => rec.id === results[0].id)) {
      throw new Error("Recommendations include original document");
    }
  }
}

async function testPerformance(db) {
  const startTime = Date.now();

  // Add multiple documents
  for (let i = 0; i < 100; i++) {
    await db.addDocument(
      `perf-${i}`,
      `Performance test document ${i} with various content`
    );
  }

  const indexTime = Date.now() - startTime;

  // Search performance
  const searchStart = Date.now();
  const results = await db.search("performance test");
  const searchTime = Date.now() - searchStart;

  console.log(
    `    📊 Performance: ${indexTime}ms indexing, ${searchTime}ms search`
  );

  if (indexTime > 5000) throw new Error("Indexing too slow");
  if (searchTime > 100) throw new Error("Search too slow");
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { VectorDatabase, RAGVectorDatabase };
