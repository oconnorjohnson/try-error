#!/usr/bin/env node

/**
 * RAG Chunk Processor for try-error Documentation
 *
 * Implements the semantic chunking strategy to split documentation into
 * optimal chunks for RAG retrieval systems.
 *
 * Usage:
 *   node chunk-processor.js [--input=path] [--output=path] [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class DocumentParser {
  constructor() {
    this.headerRegex = /^(#{1,6})\s+(.+)$/gm;
    this.codeBlockRegex = /```[\s\S]*?```/gm;
    this.frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    this.linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  }

  parseDocument(filePath) {
    console.log(`Parsing document: ${filePath}`);

    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(process.cwd(), filePath);

    const document = {
      path: relativePath,
      content: content,
      metadata: this.extractMetadata(content),
      headers: this.extractHeaders(content),
      codeBlocks: this.extractCodeBlocks(content),
      links: this.extractLinks(content),
      type: this.determineDocumentType(relativePath, content),
      size: content.length,
      lineCount: content.split("\n").length,
    };

    console.log(`  - Type: ${document.type}`);
    console.log(
      `  - Size: ${document.size} chars, ${document.lineCount} lines`
    );
    console.log(`  - Headers: ${document.headers.length}`);
    console.log(`  - Code blocks: ${document.codeBlocks.length}`);

    return document;
  }

  extractMetadata(content) {
    const match = content.match(this.frontmatterRegex);
    if (!match) return {};

    const frontmatter = match[1];
    const metadata = {};

    // Simple YAML parsing for common patterns
    const lines = frontmatter.split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        // Array value
        metadata[key] = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim());
      } else if (value === "true" || value === "false") {
        // Boolean value
        metadata[key] = value === "true";
      } else if (!isNaN(value)) {
        // Number value
        metadata[key] = parseInt(value, 10);
      } else {
        // String value
        metadata[key] = value;
      }
    }

    return metadata;
  }

  extractHeaders(content) {
    const headers = [];
    let match;

    while ((match = this.headerRegex.exec(content)) !== null) {
      headers.push({
        level: match[1].length,
        title: match[2],
        position: match.index,
        raw: match[0],
      });
    }

    return headers;
  }

  extractCodeBlocks(content) {
    const codeBlocks = [];
    let match;

    while ((match = this.codeBlockRegex.exec(content)) !== null) {
      const block = match[0];
      const lines = block.split("\n");
      const language = lines[0].replace("```", "").trim();

      codeBlocks.push({
        language: language,
        code: lines.slice(1, -1).join("\n"),
        position: match.index,
        raw: block,
      });
    }

    return codeBlocks;
  }

  extractLinks(content) {
    const links = [];
    let match;

    while ((match = this.linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        position: match.index,
        raw: match[0],
      });
    }

    return links;
  }

  determineDocumentType(filePath, content) {
    if (filePath.includes("-deep-dive.md")) {
      return "deep-dive";
    } else if (filePath.includes("functions/")) {
      return "function-reference";
    } else if (
      filePath.includes("architecture.md") ||
      filePath.includes("patterns.md") ||
      filePath.includes("performance.md")
    ) {
      return "conceptual";
    } else {
      return "general";
    }
  }
}

class ChunkGenerator {
  constructor() {
    this.maxChunkSize = 2000; // tokens
    this.minChunkSize = 300; // tokens
    this.averageTokensPerWord = 1.3;
    this.averageWordsPerLine = 8;
  }

  generateChunks(document) {
    console.log(`Generating chunks for: ${document.path}`);

    switch (document.type) {
      case "deep-dive":
        return this.generateDeepDiveChunks(document);
      case "function-reference":
        return this.generateFunctionChunks(document);
      case "conceptual":
        return this.generateConceptualChunks(document);
      default:
        return this.generateGeneralChunks(document);
    }
  }

  generateDeepDiveChunks(document) {
    const chunks = [];
    const h2Headers = document.headers.filter((h) => h.level === 2);

    console.log(`  - Found ${h2Headers.length} H2 sections`);

    for (let i = 0; i < h2Headers.length; i++) {
      const currentHeader = h2Headers[i];
      const nextHeader = h2Headers[i + 1];

      const startPos = currentHeader.position;
      const endPos = nextHeader ? nextHeader.position : document.content.length;

      const sectionContent = document.content.substring(startPos, endPos);
      const sectionSlug = this.createSlug(currentHeader.title);

      // Check if section is too large and needs splitting
      const estimatedTokens = this.estimateTokens(sectionContent);

      if (estimatedTokens > this.maxChunkSize) {
        // Split large sections by H3 headers
        const subChunks = this.splitLargeSection(
          document,
          sectionContent,
          startPos,
          currentHeader.title,
          sectionSlug
        );
        chunks.push(...subChunks);
      } else {
        // Create single chunk for this section
        const chunk = this.createChunk(
          document,
          sectionContent,
          `${this.getDocumentId(document.path)}_${sectionSlug}`,
          currentHeader.title,
          "deep-dive-section"
        );
        chunks.push(chunk);
      }
    }

    console.log(`  - Generated ${chunks.length} chunks`);
    return chunks;
  }

  generateFunctionChunks(document) {
    // Function documents are typically small enough to be single chunks
    const functionName = this.extractFunctionName(document.path);
    const chunkId = `function_${functionName}`;

    const chunk = this.createChunk(
      document,
      document.content,
      chunkId,
      functionName,
      "function-reference"
    );

    // Add function-specific metadata
    chunk.metadata.function_name = functionName;
    chunk.metadata.module = this.inferModule(document.path);
    chunk.metadata.category = this.inferCategory(
      functionName,
      document.content
    );
    chunk.metadata.parameters = this.extractParameters(document.content);
    chunk.metadata.return_type = this.extractReturnType(document.content);

    console.log(`  - Generated 1 function chunk for: ${functionName}`);
    return [chunk];
  }

  generateConceptualChunks(document) {
    const chunks = [];
    const h2Headers = document.headers.filter((h) => h.level === 2);

    if (h2Headers.length === 0) {
      // Single concept document
      const concept = this.extractConceptName(document.path);
      const chunk = this.createChunk(
        document,
        document.content,
        `architecture_${this.createSlug(concept)}`,
        concept,
        "conceptual"
      );
      chunks.push(chunk);
    } else {
      // Multiple concept sections
      for (let i = 0; i < h2Headers.length; i++) {
        const currentHeader = h2Headers[i];
        const nextHeader = h2Headers[i + 1];

        const startPos = currentHeader.position;
        const endPos = nextHeader
          ? nextHeader.position
          : document.content.length;
        const sectionContent = document.content.substring(startPos, endPos);

        const chunk = this.createChunk(
          document,
          sectionContent,
          `architecture_${this.createSlug(currentHeader.title)}`,
          currentHeader.title,
          "conceptual"
        );
        chunks.push(chunk);
      }
    }

    console.log(`  - Generated ${chunks.length} conceptual chunks`);
    return chunks;
  }

  generateGeneralChunks(document) {
    // For general documents, use H2 headers as chunk boundaries
    const chunks = [];
    const h2Headers = document.headers.filter((h) => h.level === 2);

    if (h2Headers.length === 0) {
      // Single chunk for entire document
      const chunk = this.createChunk(
        document,
        document.content,
        this.getDocumentId(document.path),
        path.basename(document.path, ".md"),
        "general"
      );
      chunks.push(chunk);
    } else {
      // Multiple chunks by H2 sections
      for (let i = 0; i < h2Headers.length; i++) {
        const currentHeader = h2Headers[i];
        const nextHeader = h2Headers[i + 1];

        const startPos = currentHeader.position;
        const endPos = nextHeader
          ? nextHeader.position
          : document.content.length;
        const sectionContent = document.content.substring(startPos, endPos);

        const chunk = this.createChunk(
          document,
          sectionContent,
          `${this.getDocumentId(document.path)}_${this.createSlug(
            currentHeader.title
          )}`,
          currentHeader.title,
          "general"
        );
        chunks.push(chunk);
      }
    }

    console.log(`  - Generated ${chunks.length} general chunks`);
    return chunks;
  }

  splitLargeSection(
    document,
    sectionContent,
    startPos,
    sectionTitle,
    sectionSlug
  ) {
    const chunks = [];
    const contentLines = sectionContent.split("\n");

    // Find H3 headers within this section
    const h3Pattern = /^###\s+(.+)$/;
    const h3Headers = [];

    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      const match = line.match(h3Pattern);
      if (match) {
        h3Headers.push({
          title: match[1],
          lineIndex: i,
          position: startPos + contentLines.slice(0, i).join("\n").length,
        });
      }
    }

    if (h3Headers.length === 0) {
      // No H3 headers, split by estimated size
      const targetChunks = Math.ceil(
        this.estimateTokens(sectionContent) / this.maxChunkSize
      );
      const linesPerChunk = Math.floor(contentLines.length / targetChunks);

      for (let i = 0; i < targetChunks; i++) {
        const startLine = i * linesPerChunk;
        const endLine =
          i === targetChunks - 1
            ? contentLines.length
            : (i + 1) * linesPerChunk;
        const chunkContent = contentLines.slice(startLine, endLine).join("\n");

        const chunk = this.createChunk(
          document,
          chunkContent,
          `${this.getDocumentId(document.path)}_${sectionSlug}_part${i + 1}`,
          `${sectionTitle} (Part ${i + 1})`,
          "deep-dive-section"
        );
        chunks.push(chunk);
      }
    } else {
      // Split by H3 headers
      for (let i = 0; i < h3Headers.length; i++) {
        const currentH3 = h3Headers[i];
        const nextH3 = h3Headers[i + 1];

        const startLine = currentH3.lineIndex;
        const endLine = nextH3 ? nextH3.lineIndex : contentLines.length;
        const chunkContent = contentLines.slice(startLine, endLine).join("\n");

        const chunk = this.createChunk(
          document,
          chunkContent,
          `${this.getDocumentId(
            document.path
          )}_${sectionSlug}_${this.createSlug(currentH3.title)}`,
          currentH3.title,
          "deep-dive-section"
        );
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  createChunk(document, content, chunkId, title, type) {
    const cleanContent = this.cleanContent(content);
    const estimatedTokens = this.estimateTokens(cleanContent);
    const lineCount = cleanContent.split("\n").length;

    const chunk = {
      chunk_id: chunkId,
      title: title,
      content: cleanContent,
      metadata: {
        // Core identification
        chunk_id: chunkId,
        source_document: document.path,
        chunk_type: type,
        last_updated: new Date().toISOString(),

        // Content classification
        topics: this.extractTopics(cleanContent),
        complexity: this.inferComplexity(cleanContent),
        includes_code: this.containsCode(cleanContent),
        line_count: lineCount,
        token_count: estimatedTokens,

        // Functional classification
        module: this.inferModule(document.path),
        category: this.inferCategory(title, cleanContent),

        // Query optimization
        search_keywords: this.extractKeywords(cleanContent),
        common_questions: this.generateCommonQuestions(title, type),

        // From original document
        ...document.metadata,
      },
      hash: this.generateHash(cleanContent),
    };

    return chunk;
  }

  cleanContent(content) {
    // Remove frontmatter
    const withoutFrontmatter = content.replace(this.frontmatterRegex, "");

    // Normalize whitespace
    const normalized = withoutFrontmatter
      .replace(/\n{3,}/g, "\n\n") // Multiple newlines to double
      .replace(/[ \t]+/g, " ") // Multiple spaces to single
      .trim();

    return normalized;
  }

  estimateTokens(content) {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount * this.averageTokensPerWord);
  }

  containsCode(content) {
    return content.includes("```") || content.includes("`");
  }

  extractTopics(content) {
    const topics = new Set();

    // Extract from headers
    const headerMatches = content.match(/^#{1,6}\s+(.+)$/gm);
    if (headerMatches) {
      headerMatches.forEach((header) => {
        const title = header.replace(/^#{1,6}\s+/, "");
        topics.add(title.toLowerCase());
      });
    }

    // Extract from code blocks
    const codeBlockMatches = content.match(/```(\w+)/g);
    if (codeBlockMatches) {
      codeBlockMatches.forEach((block) => {
        const language = block.replace("```", "");
        if (language) topics.add(language);
      });
    }

    // Extract common programming terms
    const programmingTerms = [
      "error",
      "async",
      "sync",
      "promise",
      "callback",
      "function",
      "method",
      "typescript",
      "javascript",
      "react",
      "hook",
      "component",
      "validation",
      "testing",
      "performance",
      "optimization",
      "configuration",
      "middleware",
    ];

    programmingTerms.forEach((term) => {
      if (content.toLowerCase().includes(term)) {
        topics.add(term);
      }
    });

    return Array.from(topics);
  }

  inferComplexity(content) {
    const codeBlockCount = (content.match(/```/g) || []).length / 2;
    const advancedTerms = [
      "async",
      "promise",
      "callback",
      "generic",
      "typescript",
    ];
    const advancedTermCount = advancedTerms.filter((term) =>
      content.toLowerCase().includes(term)
    ).length;

    if (codeBlockCount > 3 || advancedTermCount > 2) {
      return "advanced";
    } else if (codeBlockCount > 1 || advancedTermCount > 0) {
      return "intermediate";
    } else {
      return "basic";
    }
  }

  inferModule(filePath) {
    if (filePath.includes("react")) return "react";
    if (filePath.includes("middleware")) return "middleware";
    if (filePath.includes("types")) return "types";
    if (filePath.includes("utils")) return "utils";
    return "core";
  }

  inferCategory(title, content) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    if (titleLower.includes("create") || titleLower.includes("error")) {
      return "error-creation";
    } else if (titleLower.includes("is") || titleLower.includes("check")) {
      return "type-checking";
    } else if (titleLower.includes("validate")) {
      return "validation";
    } else if (
      titleLower.includes("react") ||
      titleLower.includes("hook") ||
      titleLower.includes("component")
    ) {
      return "react-integration";
    } else if (titleLower.includes("test") || titleLower.includes("mock")) {
      return "testing";
    } else if (
      titleLower.includes("performance") ||
      titleLower.includes("optimize")
    ) {
      return "performance";
    } else if (titleLower.includes("config")) {
      return "configuration";
    } else {
      return "utilities";
    }
  }

  extractKeywords(content) {
    const keywords = new Set();

    // Extract function names
    const functionMatches = content.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\(/g);
    if (functionMatches) {
      functionMatches.forEach((match) => {
        const functionName = match.replace("(", "");
        keywords.add(functionName);
      });
    }

    // Extract TypeScript types
    const typeMatches = content.match(/:\s*([A-Z][a-zA-Z0-9_<>|[\]]+)/g);
    if (typeMatches) {
      typeMatches.forEach((match) => {
        const type = match.replace(/:\s*/, "");
        keywords.add(type);
      });
    }

    return Array.from(keywords);
  }

  generateCommonQuestions(title, type) {
    const questions = [];
    const titleLower = title.toLowerCase();

    if (type === "function-reference") {
      questions.push(`How do I use ${title}?`);
      questions.push(`What does ${title} do?`);
      questions.push(`${title} example`);
    } else if (type === "deep-dive-section") {
      questions.push(`How does ${titleLower} work?`);
      questions.push(`${title} best practices`);
      questions.push(`${title} patterns`);
    } else if (type === "conceptual") {
      questions.push(`What is ${titleLower}?`);
      questions.push(`${title} architecture`);
      questions.push(`${title} explanation`);
    }

    return questions;
  }

  extractFunctionName(filePath) {
    const fileName = path.basename(filePath, ".md");
    return fileName;
  }

  extractConceptName(filePath) {
    const fileName = path.basename(filePath, ".md");
    return fileName.replace(/-/g, " ");
  }

  extractParameters(content) {
    const parameters = [];
    const paramMatches = content.match(/\b(\w+):\s*[A-Za-z0-9_<>|[\]]+/g);

    if (paramMatches) {
      paramMatches.forEach((match) => {
        const paramName = match.split(":")[0].trim();
        parameters.push(paramName);
      });
    }

    return parameters;
  }

  extractReturnType(content) {
    const returnMatch = content.match(/returns?\s*:?\s*([A-Za-z0-9_<>|[\]]+)/i);
    return returnMatch ? returnMatch[1] : "unknown";
  }

  getDocumentId(filePath) {
    const fileName = path.basename(filePath, ".md");
    return fileName.replace(/-/g, "_");
  }

  createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  generateHash(content) {
    return crypto.createHash("md5").update(content).digest("hex");
  }

  validateChunkSize(chunk) {
    const tokenCount = chunk.metadata.token_count;
    return tokenCount >= this.minChunkSize && tokenCount <= this.maxChunkSize;
  }
}

class RelationshipMapper {
  constructor() {
    this.functionRelationships = new Map();
    this.conceptRelationships = new Map();
  }

  mapRelationships(chunks) {
    console.log("Mapping relationships between chunks...");

    // Build relationship maps
    this.buildFunctionRelationships(chunks);
    this.buildConceptRelationships(chunks);

    // Add relationships to chunks
    chunks.forEach((chunk) => {
      chunk.metadata.related_chunks = this.findRelatedChunks(chunk, chunks);
      chunk.metadata.related_functions = this.findRelatedFunctions(chunk);
      chunk.metadata.usage_patterns = this.findUsagePatterns(chunk);
      chunk.metadata.cross_references = this.findCrossReferences(chunk, chunks);
    });

    console.log("Relationship mapping complete.");
    return chunks;
  }

  buildFunctionRelationships(chunks) {
    const functionChunks = chunks.filter(
      (c) => c.metadata.chunk_type === "function-reference"
    );

    // Group by category
    const categories = new Map();
    functionChunks.forEach((chunk) => {
      const category = chunk.metadata.category;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push(chunk.metadata.function_name);
    });

    // Store relationships
    categories.forEach((functions, category) => {
      functions.forEach((func) => {
        this.functionRelationships.set(
          func,
          functions.filter((f) => f !== func)
        );
      });
    });
  }

  buildConceptRelationships(chunks) {
    const conceptChunks = chunks.filter(
      (c) => c.metadata.chunk_type === "conceptual"
    );

    conceptChunks.forEach((chunk) => {
      const topics = chunk.metadata.topics || [];
      const related = conceptChunks
        .filter((c) => c.chunk_id !== chunk.chunk_id)
        .filter((c) => {
          const otherTopics = c.metadata.topics || [];
          return topics.some((topic) => otherTopics.includes(topic));
        })
        .map((c) => c.chunk_id);

      this.conceptRelationships.set(chunk.chunk_id, related);
    });
  }

  findRelatedChunks(chunk, allChunks) {
    const related = new Set();

    // Add function relationships
    if (chunk.metadata.function_name) {
      const relatedFunctions =
        this.functionRelationships.get(chunk.metadata.function_name) || [];
      relatedFunctions.forEach((func) => {
        related.add(`function_${func}`);
      });
    }

    // Add concept relationships
    const conceptRelated = this.conceptRelationships.get(chunk.chunk_id) || [];
    conceptRelated.forEach((id) => related.add(id));

    // Add topic-based relationships
    const chunkTopics = chunk.metadata.topics || [];
    allChunks.forEach((otherChunk) => {
      if (otherChunk.chunk_id === chunk.chunk_id) return;

      const otherTopics = otherChunk.metadata.topics || [];
      const commonTopics = chunkTopics.filter((topic) =>
        otherTopics.includes(topic)
      );

      if (commonTopics.length > 0) {
        related.add(otherChunk.chunk_id);
      }
    });

    return Array.from(related).slice(0, 10); // Limit to top 10
  }

  findRelatedFunctions(chunk) {
    const functionName = chunk.metadata.function_name;
    if (!functionName) return [];

    return this.functionRelationships.get(functionName) || [];
  }

  findUsagePatterns(chunk) {
    const patterns = [];
    const content = chunk.content.toLowerCase();

    // Common patterns based on content analysis
    if (content.includes("try {") || content.includes("catch (")) {
      patterns.push("error-handling");
    }
    if (content.includes("async") || content.includes("await")) {
      patterns.push("async-operations");
    }
    if (content.includes("react") || content.includes("hook")) {
      patterns.push("react-integration");
    }
    if (content.includes("test") || content.includes("expect")) {
      patterns.push("testing");
    }
    if (content.includes("performance") || content.includes("optimization")) {
      patterns.push("performance-optimization");
    }

    return patterns;
  }

  findCrossReferences(chunk, allChunks) {
    const references = [];
    const content = chunk.content.toLowerCase();

    // Find references to other chunks
    allChunks.forEach((otherChunk) => {
      if (otherChunk.chunk_id === chunk.chunk_id) return;

      const otherTitle = otherChunk.title.toLowerCase();
      if (content.includes(otherTitle)) {
        references.push(otherChunk.chunk_id);
      }
    });

    return references;
  }
}

class ChunkProcessor {
  constructor(options = {}) {
    this.inputDir = options.inputDir || "llm/rag-docs";
    this.outputDir = options.outputDir || "llm/rag-optimization/chunks";
    this.dryRun = options.dryRun || false;

    this.parser = new DocumentParser();
    this.generator = new ChunkGenerator();
    this.mapper = new RelationshipMapper();

    this.stats = {
      documentsProcessed: 0,
      chunksGenerated: 0,
      totalTokens: 0,
      averageChunkSize: 0,
    };
  }

  async processAllDocuments() {
    console.log("Starting RAG chunk processing...");
    console.log(`Input directory: ${this.inputDir}`);
    console.log(`Output directory: ${this.outputDir}`);
    console.log(`Dry run: ${this.dryRun}\n`);

    // Find all markdown files
    const markdownFiles = this.findMarkdownFiles(this.inputDir);
    console.log(`Found ${markdownFiles.length} markdown files\n`);

    // Process each document
    const allChunks = [];

    for (const filePath of markdownFiles) {
      try {
        const document = this.parser.parseDocument(filePath);
        const chunks = this.generator.generateChunks(document);
        allChunks.push(...chunks);

        this.stats.documentsProcessed++;
        this.stats.chunksGenerated += chunks.length;

        console.log(""); // Empty line for readability
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }

    // Map relationships
    const chunksWithRelationships = this.mapper.mapRelationships(allChunks);

    // Calculate statistics
    this.calculateStatistics(chunksWithRelationships);

    // Save chunks
    if (!this.dryRun) {
      await this.saveChunks(chunksWithRelationships);
    }

    // Print summary
    this.printSummary();

    return chunksWithRelationships;
  }

  findMarkdownFiles(dir) {
    const files = [];

    const scanDirectory = (currentDir) => {
      const entries = fs.readdirSync(currentDir);

      entries.forEach((entry) => {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (path.extname(entry) === ".md") {
          files.push(fullPath);
        }
      });
    };

    scanDirectory(dir);
    return files;
  }

  calculateStatistics(chunks) {
    this.stats.totalTokens = chunks.reduce(
      (sum, chunk) => sum + chunk.metadata.token_count,
      0
    );
    this.stats.averageChunkSize = Math.round(
      this.stats.totalTokens / chunks.length
    );

    // Additional statistics
    this.stats.chunksByType = {};
    this.stats.chunksByComplexity = {};

    chunks.forEach((chunk) => {
      const type = chunk.metadata.chunk_type;
      const complexity = chunk.metadata.complexity;

      this.stats.chunksByType[type] = (this.stats.chunksByType[type] || 0) + 1;
      this.stats.chunksByComplexity[complexity] =
        (this.stats.chunksByComplexity[complexity] || 0) + 1;
    });
  }

  async saveChunks(chunks) {
    console.log(`Saving ${chunks.length} chunks to ${this.outputDir}...`);

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Save individual chunks
    for (const chunk of chunks) {
      const fileName = `${chunk.chunk_id}.json`;
      const filePath = path.join(this.outputDir, fileName);

      fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2));
    }

    // Save index file
    const index = {
      generated_at: new Date().toISOString(),
      total_chunks: chunks.length,
      statistics: this.stats,
      chunks: chunks.map((chunk) => ({
        chunk_id: chunk.chunk_id,
        title: chunk.title,
        type: chunk.metadata.chunk_type,
        token_count: chunk.metadata.token_count,
        complexity: chunk.metadata.complexity,
        topics: chunk.metadata.topics,
      })),
    };

    fs.writeFileSync(
      path.join(this.outputDir, "index.json"),
      JSON.stringify(index, null, 2)
    );

    console.log("Chunks saved successfully.");
  }

  printSummary() {
    console.log("\n=== CHUNK PROCESSING SUMMARY ===");
    console.log(`Documents processed: ${this.stats.documentsProcessed}`);
    console.log(`Chunks generated: ${this.stats.chunksGenerated}`);
    console.log(`Total tokens: ${this.stats.totalTokens.toLocaleString()}`);
    console.log(`Average chunk size: ${this.stats.averageChunkSize} tokens`);

    console.log("\nChunks by type:");
    Object.entries(this.stats.chunksByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log("\nChunks by complexity:");
    Object.entries(this.stats.chunksByComplexity).forEach(
      ([complexity, count]) => {
        console.log(`  ${complexity}: ${count}`);
      }
    );

    console.log("\n=== PROCESSING COMPLETE ===");
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

  const processor = new ChunkProcessor(options);

  processor.processAllDocuments().catch((error) => {
    console.error("Processing failed:", error);
    process.exit(1);
  });
}

module.exports = {
  DocumentParser,
  ChunkGenerator,
  RelationshipMapper,
  ChunkProcessor,
};
