#!/usr/bin/env node

/**
 * Query Patterns System for try-error RAG Documentation
 *
 * Provides structured query templates, common question mappings, and
 * intelligent query routing for optimal RAG retrieval performance.
 *
 * Usage:
 *   node query-patterns.js [--generate] [--test] [--input=path]
 */

const fs = require("fs");
const path = require("path");

class QueryPatternAnalyzer {
  constructor() {
    this.queryCategories = new Map();
    this.questionTemplates = new Map();
    this.conceptMappings = new Map();
    this.initializePatterns();
  }

  initializePatterns() {
    // Define query categories with their patterns
    this.queryCategories.set("how-to-usage", {
      patterns: [
        /^how (?:do|can) i (?:use|implement|setup|configure) (.+)/i,
        /^how to (?:use|implement|setup|configure) (.+)/i,
        /^(?:usage|example|implementation) (?:of|for) (.+)/i,
        /^(.+) usage$/i,
        /^(.+) example$/i,
        /^(.+) implementation$/i,
      ],
      intent: "usage-guidance",
      priority: "high",
      expectedChunkTypes: ["function-reference", "deep-dive-section"],
      responseFormat: "step-by-step",
    });

    this.queryCategories.set("what-is-definition", {
      patterns: [
        /^what is (.+)/i,
        /^what does (.+) do/i,
        /^(.+) definition$/i,
        /^define (.+)/i,
        /^explain (.+)/i,
        /^(.+) explanation$/i,
      ],
      intent: "conceptual-understanding",
      priority: "high",
      expectedChunkTypes: [
        "deep-dive-section",
        "conceptual",
        "function-reference",
      ],
      responseFormat: "definition-with-examples",
    });

    this.queryCategories.set("when-to-use", {
      patterns: [
        /^when (?:should|would) i (?:use|choose) (.+)/i,
        /^when to (?:use|choose) (.+)/i,
        /^(?:use cases|scenarios) (?:for|of) (.+)/i,
        /^best practices (?:for|with) (.+)/i,
        /^(.+) best practices$/i,
      ],
      intent: "decision-guidance",
      priority: "medium",
      expectedChunkTypes: ["deep-dive-section", "conceptual"],
      responseFormat: "scenarios-with-recommendations",
    });

    this.queryCategories.set("troubleshooting", {
      patterns: [
        /^(?:how to )?(?:fix|solve|resolve) (.+)/i,
        /^(.+) (?:error|issue|problem)$/i,
        /^troubleshoot(?:ing)? (.+)/i,
        /^debug(?:ging)? (.+)/i,
        /^(.+) (?:not working|fails|broken)$/i,
        /^why (?:does|is) (.+) (?:not working|failing|broken)/i,
      ],
      intent: "problem-solving",
      priority: "high",
      expectedChunkTypes: ["deep-dive-section", "function-reference"],
      responseFormat: "problem-solution",
    });

    this.queryCategories.set("comparison", {
      patterns: [
        /^(.+) vs (.+)/i,
        /^difference between (.+) and (.+)/i,
        /^compare (.+) (?:and|with) (.+)/i,
        /^(.+) or (.+)/i,
        /^(?:which|what) is better (.+) or (.+)/i,
      ],
      intent: "comparison-analysis",
      priority: "medium",
      expectedChunkTypes: ["deep-dive-section", "conceptual"],
      responseFormat: "comparison-table",
    });

    this.queryCategories.set("performance", {
      patterns: [
        /^(.+) performance$/i,
        /^(?:optimize|optimization) (.+)/i,
        /^(.+) (?:speed|efficiency|benchmark)$/i,
        /^(?:fast|slow|memory) (.+)/i,
        /^performance (?:of|with) (.+)/i,
      ],
      intent: "performance-optimization",
      priority: "medium",
      expectedChunkTypes: ["deep-dive-section", "function-reference"],
      responseFormat: "performance-analysis",
    });

    this.queryCategories.set("integration", {
      patterns: [
        /^(.+) (?:with|in) (?:react|nextjs|express|node)/i,
        /^(?:react|nextjs|express|node) (.+)/i,
        /^integrate (.+) with (.+)/i,
        /^(.+) integration$/i,
        /^framework (.+)/i,
      ],
      intent: "integration-guidance",
      priority: "high",
      expectedChunkTypes: ["deep-dive-section", "function-reference"],
      responseFormat: "integration-steps",
    });

    this.queryCategories.set("api-reference", {
      patterns: [
        /^(.+) parameters$/i,
        /^(.+) (?:signature|interface|type)$/i,
        /^(.+) (?:returns?|return type)$/i,
        /^(.+) (?:throws?|exceptions?)$/i,
        /^(.+) (?:options|config|configuration)$/i,
      ],
      intent: "api-documentation",
      priority: "high",
      expectedChunkTypes: ["function-reference", "deep-dive-section"],
      responseFormat: "api-documentation",
    });

    this.queryCategories.set("testing", {
      patterns: [
        /^(?:test|testing) (.+)/i,
        /^(?:mock|mocking) (.+)/i,
        /^(.+) (?:test|testing)$/i,
        /^(?:unit|integration) test (.+)/i,
        /^test (?:cases|scenarios) (?:for|of) (.+)/i,
      ],
      intent: "testing-guidance",
      priority: "low",
      expectedChunkTypes: ["deep-dive-section", "function-reference"],
      responseFormat: "testing-examples",
    });

    // Initialize concept mappings
    this.initializeConceptMappings();

    // Initialize question templates
    this.initializeQuestionTemplates();
  }

  initializeConceptMappings() {
    // Map common variations to canonical concepts
    this.conceptMappings.set("error handling", "error-handling");
    this.conceptMappings.set("error management", "error-handling");
    this.conceptMappings.set("exception handling", "error-handling");
    this.conceptMappings.set("try catch", "error-handling");

    this.conceptMappings.set("async", "async-operations");
    this.conceptMappings.set("asynchronous", "async-operations");
    this.conceptMappings.set("promise", "async-operations");
    this.conceptMappings.set("await", "async-operations");

    this.conceptMappings.set("react", "react-integration");
    this.conceptMappings.set("hook", "react-integration");
    this.conceptMappings.set("component", "react-integration");
    this.conceptMappings.set("boundary", "react-integration");

    this.conceptMappings.set("type", "type-safety");
    this.conceptMappings.set("typescript", "type-safety");
    this.conceptMappings.set("types", "type-safety");
    this.conceptMappings.set("typing", "type-safety");

    this.conceptMappings.set("performance", "performance-optimization");
    this.conceptMappings.set("speed", "performance-optimization");
    this.conceptMappings.set("optimize", "performance-optimization");
    this.conceptMappings.set("fast", "performance-optimization");

    this.conceptMappings.set("test", "testing-patterns");
    this.conceptMappings.set("testing", "testing-patterns");
    this.conceptMappings.set("mock", "testing-patterns");
    this.conceptMappings.set("jest", "testing-patterns");

    this.conceptMappings.set("config", "configuration");
    this.conceptMappings.set("configuration", "configuration");
    this.conceptMappings.set("setup", "configuration");
    this.conceptMappings.set("options", "configuration");
  }

  initializeQuestionTemplates() {
    // Define templates for generating common questions
    this.questionTemplates.set("function-reference", [
      "How do I use {function}?",
      "What does {function} do?",
      "What are the parameters of {function}?",
      "What does {function} return?",
      "When should I use {function}?",
      "{function} example",
      "{function} usage",
      "{function} documentation",
    ]);

    this.questionTemplates.set("deep-dive-section", [
      "How does {concept} work?",
      "What is {concept}?",
      "{concept} best practices",
      "{concept} patterns",
      "{concept} examples",
      "{concept} implementation",
      "{concept} troubleshooting",
      "{concept} performance",
    ]);

    this.questionTemplates.set("conceptual", [
      "What is {concept}?",
      "{concept} overview",
      "{concept} explanation",
      "{concept} architecture",
      "{concept} design",
      "{concept} philosophy",
    ]);
  }

  analyzeQuery(query) {
    const normalizedQuery = query.toLowerCase().trim();

    // Find matching category
    let matchedCategory = null;
    let matchedGroups = [];

    for (const [category, config] of this.queryCategories.entries()) {
      for (const pattern of config.patterns) {
        const match = normalizedQuery.match(pattern);
        if (match) {
          matchedCategory = category;
          matchedGroups = match.slice(1); // Remove full match
          break;
        }
      }
      if (matchedCategory) break;
    }

    if (!matchedCategory) {
      // Fallback to keyword-based analysis
      return this.analyzeByKeywords(normalizedQuery);
    }

    const categoryConfig = this.queryCategories.get(matchedCategory);

    // Extract key concepts from matched groups
    const concepts = matchedGroups
      .map((group) => this.normalizeConcept(group))
      .filter(Boolean);

    return {
      category: matchedCategory,
      intent: categoryConfig.intent,
      priority: categoryConfig.priority,
      concepts: concepts,
      expectedChunkTypes: categoryConfig.expectedChunkTypes,
      responseFormat: categoryConfig.responseFormat,
      originalQuery: query,
      normalizedQuery: normalizedQuery,
      confidence: 0.9,
    };
  }

  analyzeByKeywords(query) {
    const keywords = query.split(/\s+/);
    const concepts = [];
    const intents = [];

    keywords.forEach((keyword) => {
      const concept = this.conceptMappings.get(keyword);
      if (concept) {
        concepts.push(concept);
      }

      // Intent detection by keywords
      if (["how", "use", "implement", "setup"].includes(keyword)) {
        intents.push("usage-guidance");
      } else if (["what", "explain", "define"].includes(keyword)) {
        intents.push("conceptual-understanding");
      } else if (["fix", "solve", "error", "problem"].includes(keyword)) {
        intents.push("problem-solving");
      } else if (
        ["performance", "optimize", "fast", "slow"].includes(keyword)
      ) {
        intents.push("performance-optimization");
      }
    });

    return {
      category: "keyword-based",
      intent: intents[0] || "general-information",
      priority: "medium",
      concepts: concepts,
      expectedChunkTypes: [
        "function-reference",
        "deep-dive-section",
        "conceptual",
      ],
      responseFormat: "general",
      originalQuery: query,
      normalizedQuery: query,
      confidence: 0.6,
    };
  }

  normalizeConcept(concept) {
    const normalized = concept.toLowerCase().trim();
    return this.conceptMappings.get(normalized) || normalized;
  }

  generateQuestionsForChunk(chunk) {
    const questions = [];
    const chunkType = chunk.metadata.chunk_type;
    const templates = this.questionTemplates.get(chunkType) || [];

    templates.forEach((template) => {
      let question = template;

      // Replace function placeholder
      if (chunk.metadata.function_name) {
        question = question.replace(
          /{function}/g,
          chunk.metadata.function_name
        );
      }

      // Replace concept placeholder
      const concept = chunk.title || chunk.metadata.concept || "this concept";
      question = question.replace(/{concept}/g, concept);

      questions.push(question);
    });

    return questions;
  }
}

class QueryRouter {
  constructor() {
    this.chunkIndex = new Map();
    this.conceptIndex = new Map();
    this.functionIndex = new Map();
    this.routingRules = new Map();
    this.initializeRoutingRules();
  }

  initializeRoutingRules() {
    // Define routing rules for different query types
    this.routingRules.set("how-to-usage", {
      primaryTargets: ["function-reference"],
      secondaryTargets: ["deep-dive-section"],
      maxResults: 5,
      scoringWeights: {
        exactMatch: 10,
        semanticMatch: 7,
        categoryMatch: 5,
        complexityMatch: 3,
      },
    });

    this.routingRules.set("what-is-definition", {
      primaryTargets: ["deep-dive-section", "conceptual"],
      secondaryTargets: ["function-reference"],
      maxResults: 3,
      scoringWeights: {
        exactMatch: 10,
        semanticMatch: 8,
        categoryMatch: 6,
        complexityMatch: 2,
      },
    });

    this.routingRules.set("troubleshooting", {
      primaryTargets: ["deep-dive-section"],
      secondaryTargets: ["function-reference"],
      maxResults: 7,
      scoringWeights: {
        exactMatch: 10,
        semanticMatch: 8,
        categoryMatch: 4,
        complexityMatch: 6,
      },
    });

    this.routingRules.set("api-reference", {
      primaryTargets: ["function-reference"],
      secondaryTargets: ["deep-dive-section"],
      maxResults: 3,
      scoringWeights: {
        exactMatch: 15,
        semanticMatch: 5,
        categoryMatch: 3,
        complexityMatch: 2,
      },
    });

    this.routingRules.set("comparison", {
      primaryTargets: ["deep-dive-section", "conceptual"],
      secondaryTargets: ["function-reference"],
      maxResults: 4,
      scoringWeights: {
        exactMatch: 8,
        semanticMatch: 10,
        categoryMatch: 6,
        complexityMatch: 4,
      },
    });
  }

  indexChunks(chunks) {
    console.log("Indexing chunks for query routing...");

    chunks.forEach((chunk) => {
      this.chunkIndex.set(chunk.chunk_id, chunk);

      // Index by function name
      if (chunk.metadata.function_name) {
        const funcName = chunk.metadata.function_name.toLowerCase();
        if (!this.functionIndex.has(funcName)) {
          this.functionIndex.set(funcName, []);
        }
        this.functionIndex.get(funcName).push(chunk.chunk_id);
      }

      // Index by concepts
      const tags = chunk.metadata.semantic_tags || [];
      tags.forEach((tag) => {
        if (!this.conceptIndex.has(tag)) {
          this.conceptIndex.set(tag, []);
        }
        this.conceptIndex.get(tag).push(chunk.chunk_id);
      });
    });

    console.log(`Indexed ${chunks.length} chunks`);
  }

  routeQuery(queryAnalysis) {
    const rule =
      this.routingRules.get(queryAnalysis.category) ||
      this.routingRules.get("what-is-definition");

    const candidates = this.findCandidateChunks(queryAnalysis, rule);
    const scoredCandidates = this.scoreChunks(candidates, queryAnalysis, rule);

    return scoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, rule.maxResults)
      .map((candidate) => ({
        chunk_id: candidate.chunk_id,
        score: candidate.score,
        match_type: candidate.match_type,
        confidence: candidate.confidence,
        chunk: this.chunkIndex.get(candidate.chunk_id),
      }));
  }

  findCandidateChunks(queryAnalysis, rule) {
    const candidates = new Set();

    // Find exact function matches
    queryAnalysis.concepts.forEach((concept) => {
      if (this.functionIndex.has(concept)) {
        this.functionIndex.get(concept).forEach((chunkId) => {
          candidates.add({
            chunk_id: chunkId,
            match_type: "exact_function",
            match_value: concept,
          });
        });
      }
    });

    // Find concept matches
    queryAnalysis.concepts.forEach((concept) => {
      if (this.conceptIndex.has(concept)) {
        this.conceptIndex.get(concept).forEach((chunkId) => {
          candidates.add({
            chunk_id: chunkId,
            match_type: "concept",
            match_value: concept,
          });
        });
      }
    });

    // Find chunks by type
    const targetTypes = [...rule.primaryTargets, ...rule.secondaryTargets];
    this.chunkIndex.forEach((chunk, chunkId) => {
      if (targetTypes.includes(chunk.metadata.chunk_type)) {
        candidates.add({
          chunk_id: chunkId,
          match_type: "type",
          match_value: chunk.metadata.chunk_type,
        });
      }
    });

    return Array.from(candidates);
  }

  scoreChunks(candidates, queryAnalysis, rule) {
    return candidates.map((candidate) => {
      const chunk = this.chunkIndex.get(candidate.chunk_id);
      let score = 0;
      let confidence = 0.5;

      // Exact match scoring
      if (candidate.match_type === "exact_function") {
        score += rule.scoringWeights.exactMatch;
        confidence += 0.4;
      }

      // Semantic match scoring
      const semanticScore = this.calculateSemanticScore(chunk, queryAnalysis);
      score += semanticScore * rule.scoringWeights.semanticMatch;
      confidence += semanticScore * 0.3;

      // Category match scoring
      if (rule.primaryTargets.includes(chunk.metadata.chunk_type)) {
        score += rule.scoringWeights.categoryMatch;
        confidence += 0.2;
      } else if (rule.secondaryTargets.includes(chunk.metadata.chunk_type)) {
        score += rule.scoringWeights.categoryMatch * 0.5;
        confidence += 0.1;
      }

      // Complexity match scoring
      const complexityScore = this.calculateComplexityScore(
        chunk,
        queryAnalysis
      );
      score += complexityScore * rule.scoringWeights.complexityMatch;

      return {
        chunk_id: candidate.chunk_id,
        score: score,
        match_type: candidate.match_type,
        confidence: Math.min(confidence, 1.0),
      };
    });
  }

  calculateSemanticScore(chunk, queryAnalysis) {
    const chunkTags = new Set(chunk.metadata.semantic_tags || []);
    const queryConcepts = new Set(queryAnalysis.concepts);

    // Calculate overlap
    const overlap = [...queryConcepts].filter((concept) =>
      chunkTags.has(concept)
    );

    if (queryConcepts.size === 0) return 0;

    return overlap.length / queryConcepts.size;
  }

  calculateComplexityScore(chunk, queryAnalysis) {
    // Simple complexity scoring based on intent
    const chunkComplexity = chunk.metadata.complexity || "basic";
    const complexityScores = {
      basic: 1,
      intermediate: 2,
      advanced: 3,
    };

    const intentComplexity = {
      "usage-guidance": 1,
      "conceptual-understanding": 2,
      "problem-solving": 3,
      "performance-optimization": 3,
    };

    const chunkScore = complexityScores[chunkComplexity] || 1;
    const intentScore = intentComplexity[queryAnalysis.intent] || 2;

    // Prefer matching complexity levels
    return 1 - Math.abs(chunkScore - intentScore) / 3;
  }
}

class QueryPatternsGenerator {
  constructor() {
    this.analyzer = new QueryPatternAnalyzer();
    this.router = new QueryRouter();
    this.commonQuestions = new Map();
    this.queryMappings = new Map();
  }

  async generatePatterns(chunksPath) {
    console.log("Generating query patterns...");

    // Load chunks
    const chunks = await this.loadChunks(chunksPath);

    // Index chunks for routing
    this.router.indexChunks(chunks);

    // Generate common questions for each chunk
    chunks.forEach((chunk) => {
      const questions = this.analyzer.generateQuestionsForChunk(chunk);
      this.commonQuestions.set(chunk.chunk_id, questions);
    });

    // Generate query mappings
    this.generateQueryMappings(chunks);

    // Generate pattern statistics
    const stats = this.generateStatistics(chunks);

    return {
      patterns: this.createPatternDatabase(),
      mappings: Object.fromEntries(this.queryMappings),
      statistics: stats,
      generated_at: new Date().toISOString(),
    };
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

  generateQueryMappings(chunks) {
    chunks.forEach((chunk) => {
      const questions = this.commonQuestions.get(chunk.chunk_id) || [];

      questions.forEach((question) => {
        const queryAnalysis = this.analyzer.analyzeQuery(question);
        const routedResults = this.router.routeQuery(queryAnalysis);

        this.queryMappings.set(question, {
          primary_chunks: routedResults.slice(0, 3).map((r) => r.chunk_id),
          category: queryAnalysis.category,
          intent: queryAnalysis.intent,
          concepts: queryAnalysis.concepts,
          confidence: queryAnalysis.confidence,
        });
      });
    });
  }

  createPatternDatabase() {
    return {
      categories: Object.fromEntries(this.analyzer.queryCategories),
      templates: Object.fromEntries(this.analyzer.questionTemplates),
      concept_mappings: Object.fromEntries(this.analyzer.conceptMappings),
      routing_rules: Object.fromEntries(this.router.routingRules),
    };
  }

  generateStatistics(chunks) {
    const stats = {
      total_chunks: chunks.length,
      chunks_by_type: {},
      questions_by_category: {},
      concepts_by_frequency: {},
      complexity_distribution: {},
    };

    // Count chunks by type
    chunks.forEach((chunk) => {
      const type = chunk.metadata.chunk_type;
      stats.chunks_by_type[type] = (stats.chunks_by_type[type] || 0) + 1;

      const complexity = chunk.metadata.complexity || "unknown";
      stats.complexity_distribution[complexity] =
        (stats.complexity_distribution[complexity] || 0) + 1;
    });

    // Count questions by category
    this.queryMappings.forEach((mapping, question) => {
      const category = mapping.category;
      stats.questions_by_category[category] =
        (stats.questions_by_category[category] || 0) + 1;
    });

    // Count concepts by frequency
    chunks.forEach((chunk) => {
      const tags = chunk.metadata.semantic_tags || [];
      tags.forEach((tag) => {
        stats.concepts_by_frequency[tag] =
          (stats.concepts_by_frequency[tag] || 0) + 1;
      });
    });

    // Sort by frequency
    stats.concepts_by_frequency = Object.fromEntries(
      Object.entries(stats.concepts_by_frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50) // Top 50 concepts
    );

    return stats;
  }

  async savePatterns(patterns, outputPath) {
    const outputFile = path.join(outputPath, "query-patterns.json");

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(patterns, null, 2));
    console.log(`Query patterns saved to: ${outputFile}`);
  }

  testQuery(query, patterns) {
    const queryAnalysis = this.analyzer.analyzeQuery(query);
    const routedResults = this.router.routeQuery(queryAnalysis);

    return {
      query: query,
      analysis: queryAnalysis,
      results: routedResults,
      suggestions: this.generateSuggestions(queryAnalysis, patterns),
    };
  }

  generateSuggestions(queryAnalysis, patterns) {
    const suggestions = [];

    // Suggest similar questions
    const category = queryAnalysis.category;
    if (patterns.mappings) {
      const similarQuestions = Object.keys(patterns.mappings)
        .filter((q) => patterns.mappings[q].category === category)
        .slice(0, 5);

      suggestions.push({
        type: "similar_questions",
        items: similarQuestions,
      });
    }

    // Suggest related concepts
    if (queryAnalysis.concepts.length > 0) {
      const relatedConcepts = Object.keys(patterns.patterns.concept_mappings)
        .filter((concept) =>
          queryAnalysis.concepts.includes(
            patterns.patterns.concept_mappings[concept]
          )
        )
        .slice(0, 5);

      suggestions.push({
        type: "related_concepts",
        items: relatedConcepts,
      });
    }

    return suggestions;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    generate: args.includes("--generate"),
    test: args.includes("--test"),
    inputPath:
      args.find((arg) => arg.startsWith("--input="))?.substring(8) ||
      "rag-optimization/chunks",
  };

  const generator = new QueryPatternsGenerator();

  if (options.generate) {
    console.log("Generating query patterns...");
    const patterns = await generator.generatePatterns(options.inputPath);
    await generator.savePatterns(patterns, "rag-optimization");

    console.log("\n=== QUERY PATTERNS GENERATED ===");
    console.log(
      `Total patterns: ${Object.keys(patterns.patterns.categories).length}`
    );
    console.log(`Query mappings: ${Object.keys(patterns.mappings).length}`);
    console.log(
      `Concept mappings: ${
        Object.keys(patterns.patterns.concept_mappings).length
      }`
    );
    console.log("=== GENERATION COMPLETE ===");
  }

  if (options.test) {
    console.log("Testing query patterns...");

    // Load patterns
    const patternsPath = path.join("rag-optimization", "query-patterns.json");
    const patterns = JSON.parse(fs.readFileSync(patternsPath, "utf8"));

    // Test queries
    const testQueries = [
      "How do I use trySync?",
      "What is error handling?",
      "tryAsync vs trySync",
      "How to fix TypeError?",
      "React error boundary example",
      "Performance optimization",
      "Configure try-error",
    ];

    testQueries.forEach((query) => {
      console.log(`\n--- Testing: "${query}" ---`);
      const result = generator.testQuery(query, patterns);
      console.log(`Category: ${result.analysis.category}`);
      console.log(`Intent: ${result.analysis.intent}`);
      console.log(`Concepts: ${result.analysis.concepts.join(", ")}`);
      console.log(`Results: ${result.results.length} chunks found`);

      if (result.results.length > 0) {
        console.log("Top result:", result.results[0].chunk_id);
        console.log("Score:", result.results[0].score);
      }
    });
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}

module.exports = {
  QueryPatternAnalyzer,
  QueryRouter,
  QueryPatternsGenerator,
};
