#!/usr/bin/env node

/**
 * Embedding Optimizer for try-error RAG Documentation
 *
 * Enhances chunks with semantic tags, cross-references, and query optimization
 * features to improve retrieval accuracy and relevance.
 *
 * Usage:
 *   node embedding-optimizer.js [--input=path] [--output=path] [--dry-run]
 */

const fs = require("fs");
const path = require("path");

class SemanticAnalyzer {
  constructor() {
    this.conceptMap = new Map();
    this.synonymMap = new Map();
    this.domainTerms = new Set();
    this.initializeDomainKnowledge();
  }

  initializeDomainKnowledge() {
    // Core concepts and their synonyms
    this.conceptMap.set("error-handling", {
      synonyms: ["error management", "exception handling", "error processing"],
      related: ["try-catch", "error-recovery", "error-propagation"],
      patterns: ["error wrapping", "error chaining", "error transformation"],
      context: "fundamental error handling patterns",
    });

    this.conceptMap.set("async-operations", {
      synonyms: [
        "asynchronous operations",
        "async programming",
        "promise handling",
      ],
      related: ["callbacks", "promises", "async-await", "concurrency"],
      patterns: [
        "async error handling",
        "promise chaining",
        "parallel execution",
      ],
      context: "asynchronous programming patterns",
    });

    this.conceptMap.set("type-safety", {
      synonyms: ["type checking", "typescript types", "type validation"],
      related: ["type-guards", "discriminated-unions", "type-predicates"],
      patterns: ["type narrowing", "type assertion", "generic constraints"],
      context: "TypeScript type system integration",
    });

    this.conceptMap.set("react-integration", {
      synonyms: ["react hooks", "react components", "react patterns"],
      related: ["error-boundaries", "useEffect", "useState", "context"],
      patterns: [
        "error boundary patterns",
        "hook patterns",
        "component patterns",
      ],
      context: "React framework integration",
    });

    this.conceptMap.set("performance-optimization", {
      synonyms: ["performance tuning", "optimization", "efficiency"],
      related: ["caching", "memoization", "lazy-evaluation", "pooling"],
      patterns: ["object pooling", "lazy initialization", "cache strategies"],
      context: "performance and optimization techniques",
    });

    this.conceptMap.set("testing-patterns", {
      synonyms: ["test patterns", "testing strategies", "test utilities"],
      related: ["unit-testing", "integration-testing", "mocking", "fixtures"],
      patterns: ["test doubles", "property-based testing", "test utilities"],
      context: "testing and quality assurance",
    });

    this.conceptMap.set("configuration", {
      synonyms: ["config", "settings", "options", "preferences"],
      related: ["presets", "environment-config", "runtime-config"],
      patterns: [
        "configuration patterns",
        "preset patterns",
        "environment detection",
      ],
      context: "configuration and setup",
    });

    // Build synonym mappings
    this.conceptMap.forEach((concept, key) => {
      concept.synonyms.forEach((synonym) => {
        this.synonymMap.set(synonym, key);
      });
    });

    // Domain-specific terms
    this.domainTerms = new Set([
      "tryError",
      "TryError",
      "TryResult",
      "TryState",
      "isTryError",
      "trySync",
      "tryAsync",
      "wrapError",
      "fromThrown",
      "configure",
      "useTry",
      "TryErrorBoundary",
      "ErrorProvider",
      "createError",
      "createMinimalError",
      "createEnhancedError",
      "errorBoundary",
      "errorRecovery",
      "errorReporting",
      "stackTrace",
      "sourceLocation",
      "errorContext",
      "minimal mode",
      "production mode",
      "development mode",
      "object pooling",
      "lazy evaluation",
      "error caching",
      "discriminated union",
      "type guard",
      "type predicate",
      "async error boundary",
      "unhandled rejection",
      "promise rejection",
      "middleware",
      "plugins",
      "error transformation",
      "error serialization",
      "error deserialization",
    ]);
  }

  extractSemanticTags(chunk) {
    const tags = new Set();
    const content = chunk.content.toLowerCase();
    const title = chunk.title.toLowerCase();

    // Extract domain-specific terms
    this.domainTerms.forEach((term) => {
      if (
        content.includes(term.toLowerCase()) ||
        title.includes(term.toLowerCase())
      ) {
        tags.add(term);
      }
    });

    // Extract conceptual tags
    this.conceptMap.forEach((concept, key) => {
      if (this.matchesConcept(content, title, concept)) {
        tags.add(key);
        // Add related concepts
        concept.related.forEach((related) => tags.add(related));
      }
    });

    // Extract pattern tags
    const patterns = this.extractPatterns(content);
    patterns.forEach((pattern) => tags.add(pattern));

    // Extract functional tags
    const functionalTags = this.extractFunctionalTags(content, chunk.metadata);
    functionalTags.forEach((tag) => tags.add(tag));

    return Array.from(tags);
  }

  matchesConcept(content, title, concept) {
    const text = `${content} ${title}`;

    // Check direct mention
    if (text.includes(concept.context)) return true;

    // Check synonyms
    if (concept.synonyms.some((synonym) => text.includes(synonym))) return true;

    // Check patterns
    if (concept.patterns.some((pattern) => text.includes(pattern))) return true;

    // Check related terms (require multiple matches)
    const relatedMatches = concept.related.filter((related) =>
      text.includes(related)
    );
    return relatedMatches.length >= 2;
  }

  extractPatterns(content) {
    const patterns = [];

    // Error handling patterns
    if (content.includes("try {") && content.includes("catch (")) {
      patterns.push("try-catch-pattern");
    }
    if (content.includes("if (isTryError")) {
      patterns.push("error-guard-pattern");
    }
    if (content.includes("wrapError") || content.includes("fromThrown")) {
      patterns.push("error-wrapping-pattern");
    }

    // Async patterns
    if (content.includes("async") && content.includes("await")) {
      patterns.push("async-await-pattern");
    }
    if (content.includes("Promise") && content.includes("then")) {
      patterns.push("promise-chain-pattern");
    }
    if (content.includes("AbortSignal") || content.includes("abort")) {
      patterns.push("cancellation-pattern");
    }

    // React patterns
    if (content.includes("useEffect") || content.includes("useState")) {
      patterns.push("react-hook-pattern");
    }
    if (
      content.includes("ErrorBoundary") ||
      content.includes("componentDidCatch")
    ) {
      patterns.push("error-boundary-pattern");
    }
    if (content.includes("useCallback") || content.includes("useMemo")) {
      patterns.push("react-optimization-pattern");
    }

    // Testing patterns
    if (content.includes("describe") && content.includes("it")) {
      patterns.push("jest-test-pattern");
    }
    if (content.includes("expect") && content.includes("toBe")) {
      patterns.push("assertion-pattern");
    }
    if (content.includes("mock") || content.includes("spy")) {
      patterns.push("mock-pattern");
    }

    // Performance patterns
    if (content.includes("cache") || content.includes("memoiz")) {
      patterns.push("caching-pattern");
    }
    if (content.includes("pool") || content.includes("reuse")) {
      patterns.push("pooling-pattern");
    }
    if (content.includes("lazy") || content.includes("defer")) {
      patterns.push("lazy-pattern");
    }

    return patterns;
  }

  extractFunctionalTags(content, metadata) {
    const tags = [];

    // Based on function signature patterns
    if (content.includes("function") || content.includes("=>")) {
      tags.push("function-definition");
    }
    if (content.includes("interface") || content.includes("type ")) {
      tags.push("type-definition");
    }
    if (content.includes("class") || content.includes("extends")) {
      tags.push("class-definition");
    }

    // Based on usage patterns
    if (content.includes("example") || content.includes("usage")) {
      tags.push("usage-example");
    }
    if (content.includes("best practice") || content.includes("pattern")) {
      tags.push("best-practice");
    }
    if (content.includes("pitfall") || content.includes("gotcha")) {
      tags.push("common-pitfall");
    }
    if (content.includes("migration") || content.includes("upgrade")) {
      tags.push("migration-guide");
    }

    // Based on complexity
    if (metadata.complexity === "advanced") {
      tags.push("advanced-usage");
    } else if (metadata.complexity === "basic") {
      tags.push("basic-usage");
    }

    // Based on content type
    if (metadata.includes_code) {
      tags.push("code-example");
    }
    if (content.includes("performance") || content.includes("benchmark")) {
      tags.push("performance-info");
    }

    return tags;
  }

  generateConceptAliases(chunk) {
    const aliases = new Set();
    const tags = chunk.metadata.semantic_tags || [];

    tags.forEach((tag) => {
      // Add synonyms from concept map
      const concept = this.conceptMap.get(tag);
      if (concept) {
        concept.synonyms.forEach((synonym) => aliases.add(synonym));
      }

      // Add common variations
      aliases.add(tag.replace(/-/g, " "));
      aliases.add(tag.replace(/-/g, "_"));
      aliases.add(tag.replace(/[_-]/g, ""));
    });

    // Add function-specific aliases
    if (chunk.metadata.function_name) {
      const funcName = chunk.metadata.function_name;
      aliases.add(funcName.toLowerCase());
      aliases.add(
        funcName
          .replace(/([A-Z])/g, " $1")
          .trim()
          .toLowerCase()
      );
      aliases.add(funcName.replace(/([A-Z])/g, "_$1").toLowerCase());
    }

    return Array.from(aliases);
  }

  extractQueryIntents(chunk) {
    const intents = [];
    const content = chunk.content.toLowerCase();
    const type = chunk.metadata.chunk_type;

    if (type === "function-reference") {
      intents.push("api-usage");
      intents.push("function-documentation");
      if (content.includes("example")) intents.push("code-example");
      if (content.includes("parameter")) intents.push("parameter-info");
      if (content.includes("return")) intents.push("return-value");
    } else if (type === "deep-dive-section") {
      intents.push("detailed-explanation");
      intents.push("implementation-details");
      if (content.includes("pattern")) intents.push("pattern-explanation");
      if (content.includes("performance")) intents.push("performance-analysis");
      if (content.includes("example")) intents.push("usage-example");
    } else if (type === "conceptual") {
      intents.push("concept-explanation");
      intents.push("architecture-info");
      if (content.includes("pattern")) intents.push("pattern-catalog");
    }

    // Common intents based on content
    if (content.includes("how to") || content.includes("usage")) {
      intents.push("how-to-guide");
    }
    if (
      content.includes("best practice") ||
      content.includes("recommendation")
    ) {
      intents.push("best-practice-guide");
    }
    if (content.includes("error") || content.includes("problem")) {
      intents.push("troubleshooting");
    }
    if (content.includes("test") || content.includes("example")) {
      intents.push("testing-guide");
    }

    return intents;
  }
}

class CrossReferenceBuilder {
  constructor() {
    this.chunks = new Map();
    this.functionIndex = new Map();
    this.conceptIndex = new Map();
    this.patternIndex = new Map();
  }

  buildCrossReferences(chunks) {
    console.log("Building cross-references...");

    // Index all chunks
    chunks.forEach((chunk) => {
      this.chunks.set(chunk.chunk_id, chunk);
      this.indexChunk(chunk);
    });

    // Build references for each chunk
    chunks.forEach((chunk) => {
      chunk.metadata.cross_references = this.findCrossReferences(chunk);
      chunk.metadata.related_chunks = this.findRelatedChunks(chunk);
      chunk.metadata.conceptual_links = this.findConceptualLinks(chunk);
      chunk.metadata.usage_examples = this.findUsageExamples(chunk);
    });

    console.log("Cross-reference building complete.");
    return chunks;
  }

  indexChunk(chunk) {
    // Index by function name
    if (chunk.metadata.function_name) {
      const funcName = chunk.metadata.function_name;
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

    // Index by patterns
    const patterns = chunk.metadata.usage_patterns || [];
    patterns.forEach((pattern) => {
      if (!this.patternIndex.has(pattern)) {
        this.patternIndex.set(pattern, []);
      }
      this.patternIndex.get(pattern).push(chunk.chunk_id);
    });
  }

  findCrossReferences(chunk) {
    const references = new Map();
    const content = chunk.content.toLowerCase();

    // Find function references in content
    this.functionIndex.forEach((chunkIds, funcName) => {
      if (
        content.includes(funcName.toLowerCase()) &&
        !chunkIds.includes(chunk.chunk_id)
      ) {
        references.set(`function:${funcName}`, chunkIds[0]); // Primary reference
      }
    });

    // Find concept references
    this.conceptIndex.forEach((chunkIds, concept) => {
      if (
        content.includes(concept.replace(/-/g, " ")) &&
        !chunkIds.includes(chunk.chunk_id)
      ) {
        references.set(`concept:${concept}`, chunkIds[0]);
      }
    });

    // Convert to array of objects
    return Array.from(references.entries()).map(([key, chunkId]) => ({
      type: key.split(":")[0],
      target: key.split(":")[1],
      chunk_id: chunkId,
    }));
  }

  findRelatedChunks(chunk) {
    const related = new Set();
    const tags = chunk.metadata.semantic_tags || [];

    // Find chunks with similar tags
    tags.forEach((tag) => {
      const relatedChunks = this.conceptIndex.get(tag) || [];
      relatedChunks.forEach((chunkId) => {
        if (chunkId !== chunk.chunk_id) {
          related.add(chunkId);
        }
      });
    });

    // Score and rank related chunks
    const scored = Array.from(related).map((chunkId) => {
      const relatedChunk = this.chunks.get(chunkId);
      const score = this.calculateRelatednessScore(chunk, relatedChunk);
      return { chunk_id: chunkId, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 related chunks
      .map((item) => item.chunk_id);
  }

  findConceptualLinks(chunk) {
    const links = [];
    const tags = chunk.metadata.semantic_tags || [];

    // Group by concept categories
    const categories = {
      "error-handling": tags.filter((tag) => tag.includes("error")),
      "async-operations": tags.filter((tag) => tag.includes("async")),
      "type-safety": tags.filter((tag) => tag.includes("type")),
      "react-integration": tags.filter((tag) => tag.includes("react")),
      performance: tags.filter((tag) => tag.includes("performance")),
      testing: tags.filter((tag) => tag.includes("test")),
    };

    Object.entries(categories).forEach(([category, categoryTags]) => {
      if (categoryTags.length > 0) {
        const relatedChunks = this.conceptIndex.get(category) || [];
        if (relatedChunks.length > 0) {
          links.push({
            category,
            related_chunks: relatedChunks.slice(0, 5),
          });
        }
      }
    });

    return links;
  }

  findUsageExamples(chunk) {
    const examples = [];

    if (chunk.metadata.chunk_type === "function-reference") {
      // Find deep-dive sections that use this function
      const funcName = chunk.metadata.function_name;
      if (funcName) {
        this.chunks.forEach((otherChunk) => {
          if (
            otherChunk.metadata.chunk_type === "deep-dive-section" &&
            otherChunk.content.toLowerCase().includes(funcName.toLowerCase())
          ) {
            examples.push({
              chunk_id: otherChunk.chunk_id,
              title: otherChunk.title,
              context: "detailed-usage",
            });
          }
        });
      }
    } else if (chunk.metadata.chunk_type === "deep-dive-section") {
      // Find function references that relate to this concept
      const tags = chunk.metadata.semantic_tags || [];
      tags.forEach((tag) => {
        const relatedFunctions = this.functionIndex.get(tag) || [];
        relatedFunctions.forEach((chunkId) => {
          const funcChunk = this.chunks.get(chunkId);
          if (funcChunk) {
            examples.push({
              chunk_id: chunkId,
              title: funcChunk.title,
              context: "api-reference",
            });
          }
        });
      });
    }

    return examples.slice(0, 10); // Limit to top 10
  }

  calculateRelatednessScore(chunk1, chunk2) {
    let score = 0;

    // Tag overlap
    const tags1 = new Set(chunk1.metadata.semantic_tags || []);
    const tags2 = new Set(chunk2.metadata.semantic_tags || []);
    const tagOverlap = [...tags1].filter((tag) => tags2.has(tag));
    score += tagOverlap.length * 2;

    // Same category
    if (chunk1.metadata.category === chunk2.metadata.category) {
      score += 3;
    }

    // Same module
    if (chunk1.metadata.module === chunk2.metadata.module) {
      score += 1;
    }

    // Same complexity
    if (chunk1.metadata.complexity === chunk2.metadata.complexity) {
      score += 1;
    }

    // Content similarity (simple keyword matching)
    const content1 = chunk1.content.toLowerCase();
    const content2 = chunk2.content.toLowerCase();
    const words1 = new Set(content1.split(/\s+/));
    const words2 = new Set(content2.split(/\s+/));
    const wordOverlap = [...words1].filter(
      (word) => words2.has(word) && word.length > 3
    );
    score += Math.min(wordOverlap.length / 20, 5); // Cap at 5 points

    return score;
  }
}

class QueryOptimizer {
  constructor() {
    this.questionTemplates = new Map();
    this.intentPatterns = new Map();
    this.initializeQueryPatterns();
  }

  initializeQueryPatterns() {
    // Question templates for different query types
    this.questionTemplates.set("how-to", [
      "How do I use {function}?",
      "How to {action} with {function}?",
      "How can I {action}?",
      "What is the best way to {action}?",
    ]);

    this.questionTemplates.set("what-is", [
      "What is {concept}?",
      "What does {function} do?",
      "What is the purpose of {concept}?",
      "What are the benefits of {concept}?",
    ]);

    this.questionTemplates.set("when-to-use", [
      "When should I use {function}?",
      "When to use {concept}?",
      "In what situations is {concept} useful?",
      "When would I need {function}?",
    ]);

    this.questionTemplates.set("troubleshooting", [
      "How to fix {error}?",
      "Why does {function} fail?",
      "Common problems with {concept}",
      "Troubleshooting {issue}",
    ]);

    this.questionTemplates.set("comparison", [
      "Difference between {concept1} and {concept2}",
      "{function1} vs {function2}",
      "Compare {concept1} and {concept2}",
      "Which is better: {option1} or {option2}?",
    ]);

    // Intent patterns for query classification
    this.intentPatterns.set("api-usage", [
      "function signature",
      "parameters",
      "return value",
      "usage example",
    ]);

    this.intentPatterns.set("implementation-details", [
      "how it works",
      "algorithm",
      "implementation",
      "internal logic",
    ]);

    this.intentPatterns.set("best-practices", [
      "best practice",
      "recommended approach",
      "pattern",
      "guideline",
    ]);

    this.intentPatterns.set("performance", [
      "performance",
      "optimization",
      "efficiency",
      "speed",
      "memory",
    ]);

    this.intentPatterns.set("troubleshooting", [
      "error",
      "problem",
      "issue",
      "fix",
      "debug",
      "troubleshoot",
    ]);
  }

  optimizeChunkForQueries(chunk) {
    console.log(`Optimizing chunk for queries: ${chunk.chunk_id}`);

    // Generate common questions this chunk can answer
    const commonQuestions = this.generateCommonQuestions(chunk);

    // Extract search keywords
    const searchKeywords = this.extractSearchKeywords(chunk);

    // Generate query variations
    const queryVariations = this.generateQueryVariations(chunk);

    // Classify query intents
    const queryIntents = this.classifyQueryIntents(chunk);

    // Generate answer templates
    const answerTemplates = this.generateAnswerTemplates(chunk);

    // Update chunk metadata
    chunk.metadata.common_questions = commonQuestions;
    chunk.metadata.search_keywords = searchKeywords;
    chunk.metadata.query_variations = queryVariations;
    chunk.metadata.query_intents = queryIntents;
    chunk.metadata.answer_templates = answerTemplates;

    return chunk;
  }

  generateCommonQuestions(chunk) {
    const questions = [];
    const type = chunk.metadata.chunk_type;
    const title = chunk.title;
    const funcName = chunk.metadata.function_name;

    if (type === "function-reference") {
      questions.push(`How do I use ${funcName}?`);
      questions.push(`What does ${funcName} do?`);
      questions.push(`${funcName} example`);
      questions.push(`${funcName} parameters`);
      questions.push(`${funcName} return value`);
      questions.push(`When should I use ${funcName}?`);
    } else if (type === "deep-dive-section") {
      questions.push(`How does ${title.toLowerCase()} work?`);
      questions.push(`${title} best practices`);
      questions.push(`${title} patterns`);
      questions.push(`${title} examples`);
      questions.push(`${title} implementation`);
    } else if (type === "conceptual") {
      questions.push(`What is ${title.toLowerCase()}?`);
      questions.push(`${title} explanation`);
      questions.push(`${title} overview`);
      questions.push(`${title} concepts`);
    }

    // Add domain-specific questions
    const tags = chunk.metadata.semantic_tags || [];
    tags.forEach((tag) => {
      if (tag.includes("error")) {
        questions.push(`How to handle ${tag}?`);
        questions.push(`${tag} best practices`);
      }
      if (tag.includes("async")) {
        questions.push(`${tag} patterns`);
        questions.push(`How to use ${tag}?`);
      }
      if (tag.includes("react")) {
        questions.push(`${tag} integration`);
        questions.push(`${tag} hooks`);
      }
    });

    return questions;
  }

  extractSearchKeywords(chunk) {
    const keywords = new Set();
    const content = chunk.content.toLowerCase();
    const title = chunk.title.toLowerCase();

    // Function names
    if (chunk.metadata.function_name) {
      keywords.add(chunk.metadata.function_name);
      keywords.add(chunk.metadata.function_name.toLowerCase());
    }

    // Semantic tags
    const tags = chunk.metadata.semantic_tags || [];
    tags.forEach((tag) => {
      keywords.add(tag);
      keywords.add(tag.replace(/-/g, " "));
    });

    // Technical terms
    const technicalTerms = content.match(/\b[A-Z][a-z]+[A-Z][a-z]+\b/g) || [];
    technicalTerms.forEach((term) => keywords.add(term));

    // Code identifiers
    const codeIdentifiers = content.match(/\b[a-z][a-zA-Z0-9]*\(\)/g) || [];
    codeIdentifiers.forEach((identifier) => {
      keywords.add(identifier.replace("()", ""));
    });

    // Important nouns
    const importantNouns = [
      "error",
      "async",
      "sync",
      "promise",
      "callback",
      "function",
      "type",
      "interface",
      "class",
      "hook",
      "component",
      "boundary",
      "configuration",
      "performance",
      "optimization",
      "test",
      "pattern",
    ];

    importantNouns.forEach((noun) => {
      if (content.includes(noun)) {
        keywords.add(noun);
      }
    });

    return Array.from(keywords);
  }

  generateQueryVariations(chunk) {
    const variations = [];
    const funcName = chunk.metadata.function_name;
    const title = chunk.title;

    if (funcName) {
      // Function name variations
      variations.push(funcName);
      variations.push(funcName.toLowerCase());
      variations.push(funcName.replace(/([A-Z])/g, " $1").trim());
      variations.push(funcName.replace(/([A-Z])/g, "_$1").toLowerCase());
    }

    // Title variations
    variations.push(title);
    variations.push(title.toLowerCase());
    variations.push(title.replace(/[^a-zA-Z0-9\s]/g, ""));

    // Semantic tag variations
    const tags = chunk.metadata.semantic_tags || [];
    tags.forEach((tag) => {
      variations.push(tag);
      variations.push(tag.replace(/-/g, " "));
      variations.push(tag.replace(/_/g, " "));
    });

    return [...new Set(variations)];
  }

  classifyQueryIntents(chunk) {
    const intents = [];
    const content = chunk.content.toLowerCase();
    const type = chunk.metadata.chunk_type;

    // Pattern-based intent classification
    this.intentPatterns.forEach((patterns, intent) => {
      if (patterns.some((pattern) => content.includes(pattern))) {
        intents.push(intent);
      }
    });

    // Type-based intent classification
    if (type === "function-reference") {
      intents.push("api-usage");
    } else if (type === "deep-dive-section") {
      intents.push("implementation-details");
    } else if (type === "conceptual") {
      intents.push("concept-explanation");
    }

    return intents;
  }

  generateAnswerTemplates(chunk) {
    const templates = [];
    const type = chunk.metadata.chunk_type;
    const funcName = chunk.metadata.function_name;

    if (type === "function-reference") {
      templates.push({
        question_pattern: "How do I use {function}?",
        answer_template:
          "To use {function}, you can {usage}. Here is an example: {example}",
        context: "function-usage",
      });

      templates.push({
        question_pattern: "What does {function} do?",
        answer_template: "{function} is used to {purpose}. It {description}",
        context: "function-purpose",
      });
    } else if (type === "deep-dive-section") {
      templates.push({
        question_pattern: "How does {concept} work?",
        answer_template:
          "{concept} works by {mechanism}. The implementation involves {details}",
        context: "concept-explanation",
      });

      templates.push({
        question_pattern: "{concept} best practices",
        answer_template: "Best practices for {concept} include: {practices}",
        context: "best-practices",
      });
    }

    return templates;
  }
}

class EmbeddingOptimizer {
  constructor(options = {}) {
    this.inputDir = options.inputDir || "llm/rag-optimization/chunks";
    this.outputDir =
      options.outputDir || "llm/rag-optimization/optimized-chunks";
    this.dryRun = options.dryRun || false;

    this.analyzer = new SemanticAnalyzer();
    this.crossRefBuilder = new CrossReferenceBuilder();
    this.queryOptimizer = new QueryOptimizer();

    this.stats = {
      chunksProcessed: 0,
      semanticTagsAdded: 0,
      crossReferencesCreated: 0,
      queryOptimizationsAdded: 0,
    };
  }

  async optimizeAllChunks() {
    console.log("Starting embedding optimization...");
    console.log(`Input directory: ${this.inputDir}`);
    console.log(`Output directory: ${this.outputDir}`);
    console.log(`Dry run: ${this.dryRun}\n`);

    // Load all chunks
    const chunks = await this.loadChunks();
    console.log(`Loaded ${chunks.length} chunks\n`);

    // Phase 1: Add semantic tags
    console.log("Phase 1: Adding semantic tags...");
    chunks.forEach((chunk) => {
      chunk.metadata.semantic_tags = this.analyzer.extractSemanticTags(chunk);
      chunk.metadata.concept_aliases =
        this.analyzer.generateConceptAliases(chunk);
      chunk.metadata.query_intents = this.analyzer.extractQueryIntents(chunk);
      this.stats.semanticTagsAdded += chunk.metadata.semantic_tags.length;
    });

    // Phase 2: Build cross-references
    console.log("Phase 2: Building cross-references...");
    const chunksWithRefs = this.crossRefBuilder.buildCrossReferences(chunks);
    this.stats.crossReferencesCreated = chunksWithRefs.reduce(
      (sum, chunk) => sum + (chunk.metadata.cross_references?.length || 0),
      0
    );

    // Phase 3: Optimize for queries
    console.log("Phase 3: Optimizing for queries...");
    chunksWithRefs.forEach((chunk) => {
      this.queryOptimizer.optimizeChunkForQueries(chunk);
      this.stats.queryOptimizationsAdded++;
    });

    // Update statistics
    this.stats.chunksProcessed = chunksWithRefs.length;

    // Save optimized chunks
    if (!this.dryRun) {
      await this.saveOptimizedChunks(chunksWithRefs);
    }

    // Print summary
    this.printSummary();

    return chunksWithRefs;
  }

  async loadChunks() {
    const chunkFiles = fs
      .readdirSync(this.inputDir)
      .filter((file) => file.endsWith(".json") && file !== "index.json");

    const chunks = [];

    chunkFiles.forEach((file) => {
      const filePath = path.join(this.inputDir, file);
      const chunkData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      chunks.push(chunkData);
    });

    return chunks;
  }

  async saveOptimizedChunks(chunks) {
    console.log(`Saving ${chunks.length} optimized chunks...`);

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Save individual chunks
    chunks.forEach((chunk) => {
      const fileName = `${chunk.chunk_id}.json`;
      const filePath = path.join(this.outputDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2));
    });

    // Save optimized index
    const index = {
      generated_at: new Date().toISOString(),
      optimization_version: "1.0.0",
      total_chunks: chunks.length,
      statistics: this.stats,
      semantic_tags: this.collectSemanticTags(chunks),
      cross_references: this.collectCrossReferences(chunks),
      query_patterns: this.collectQueryPatterns(chunks),
    };

    fs.writeFileSync(
      path.join(this.outputDir, "optimized-index.json"),
      JSON.stringify(index, null, 2)
    );

    console.log("Optimized chunks saved successfully.");
  }

  collectSemanticTags(chunks) {
    const tagCounts = new Map();

    chunks.forEach((chunk) => {
      const tags = chunk.metadata.semantic_tags || [];
      tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }

  collectCrossReferences(chunks) {
    const refTypes = new Map();

    chunks.forEach((chunk) => {
      const refs = chunk.metadata.cross_references || [];
      refs.forEach((ref) => {
        refTypes.set(ref.type, (refTypes.get(ref.type) || 0) + 1);
      });
    });

    return Array.from(refTypes.entries()).map(([type, count]) => ({
      type,
      count,
    }));
  }

  collectQueryPatterns(chunks) {
    const patterns = new Map();

    chunks.forEach((chunk) => {
      const intents = chunk.metadata.query_intents || [];
      intents.forEach((intent) => {
        patterns.set(intent, (patterns.get(intent) || 0) + 1);
      });
    });

    return Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([pattern, count]) => ({ pattern, count }));
  }

  printSummary() {
    console.log("\n=== EMBEDDING OPTIMIZATION SUMMARY ===");
    console.log(`Chunks processed: ${this.stats.chunksProcessed}`);
    console.log(`Semantic tags added: ${this.stats.semanticTagsAdded}`);
    console.log(
      `Cross-references created: ${this.stats.crossReferencesCreated}`
    );
    console.log(
      `Query optimizations added: ${this.stats.queryOptimizationsAdded}`
    );
    console.log("\n=== OPTIMIZATION COMPLETE ===");
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg) => {
    if (arg.startsWith("--input=")) {
      options.inputDir = arg.substring(8);
    } else if (arg.startsWith("--output=")) {
      options.outputDir = arg.substring(9);
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  });

  const optimizer = new EmbeddingOptimizer(options);

  optimizer.optimizeAllChunks().catch((error) => {
    console.error("Optimization failed:", error);
    process.exit(1);
  });
}

module.exports = {
  SemanticAnalyzer,
  CrossReferenceBuilder,
  QueryOptimizer,
  EmbeddingOptimizer,
};
