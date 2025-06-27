#!/usr/bin/env ts-node

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface FunctionDoc {
  name: string;
  signature: string;
  parameters: ParameterDoc[];
  returnType: string;
  jsDoc?: ts.JSDoc;
  examples: string[];
  usageInTests: string[];
  performanceData?: PerformanceData;
  dependencies: string[];
}

interface ParameterDoc {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

interface PerformanceData {
  avgTime: number;
  memoryUsage: number;
  complexity: string;
}

class RagDocGenerator {
  private program: ts.Program;
  private checker: ts.TypeChecker;
  private sourceFiles: ts.SourceFile[];

  constructor(private projectPath: string) {
    const configPath = ts.findConfigFile(
      projectPath,
      ts.sys.fileExists,
      "tsconfig.json"
    );

    if (!configPath) {
      throw new Error("Could not find tsconfig.json");
    }

    const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
    const { options, fileNames } = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      path.dirname(configPath)
    );

    this.program = ts.createProgram(fileNames, options);
    this.checker = this.program.getTypeChecker();
    this.sourceFiles = this.program
      .getSourceFiles()
      .filter(
        (sf) => !sf.isDeclarationFile && !sf.fileName.includes("node_modules")
      );
  }

  generateDocs() {
    const functions = this.extractAllFunctions();
    const ragDocs: Record<string, any> = {};

    for (const func of functions) {
      const doc = this.generateFunctionDoc(func);
      ragDocs[func.name] = doc;
    }

    return ragDocs;
  }

  private extractAllFunctions(): FunctionDoc[] {
    const functions: FunctionDoc[] = [];

    for (const sourceFile of this.sourceFiles) {
      ts.forEachChild(sourceFile, (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) {
          const funcDoc = this.extractFunctionInfo(node, sourceFile);
          if (funcDoc) {
            functions.push(funcDoc);
          }
        }

        // Also check exported const functions
        if (ts.isVariableStatement(node)) {
          const declaration = node.declarationList.declarations[0];
          if (
            declaration.initializer &&
            ts.isArrowFunction(declaration.initializer)
          ) {
            const funcDoc = this.extractArrowFunctionInfo(
              declaration,
              sourceFile
            );
            if (funcDoc) {
              functions.push(funcDoc);
            }
          }
        }
      });
    }

    return functions;
  }

  private extractFunctionInfo(
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile
  ): FunctionDoc | null {
    const symbol = this.checker.getSymbolAtLocation(node.name!);
    if (!symbol) return null;

    const type = this.checker.getTypeOfSymbolAtLocation(symbol, node);
    const signature = this.checker.getSignaturesOfType(
      type,
      ts.SignatureKind.Call
    )[0];

    if (!signature) return null;

    return {
      name: node.name!.getText(),
      signature: this.checker.signatureToString(signature),
      parameters: this.extractParameters(signature),
      returnType: this.checker.typeToString(signature.getReturnType()),
      jsDoc: ts.getJSDocCommentsAndTags(node)[0] as ts.JSDoc,
      examples: this.findExamples(node.name!.getText()),
      usageInTests: this.findTestUsage(node.name!.getText()),
      performanceData: this.getPerformanceData(node.name!.getText()),
      dependencies: this.extractDependencies(node),
    };
  }

  private extractArrowFunctionInfo(
    node: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): FunctionDoc | null {
    // Similar implementation for arrow functions
    return null; // Simplified for example
  }

  private extractParameters(signature: ts.Signature): ParameterDoc[] {
    return signature.parameters.map((param) => {
      const type = this.checker.getTypeOfSymbolAtLocation(
        param,
        param.valueDeclaration!
      );
      const paramDecl = param.valueDeclaration as ts.ParameterDeclaration;

      return {
        name: param.getName(),
        type: this.checker.typeToString(type),
        optional: !!paramDecl.questionToken,
        description: this.getParamDescription(param),
      };
    });
  }

  private getParamDescription(param: ts.Symbol): string | undefined {
    const jsDoc = param.getJsDocTags();
    const paramTag = jsDoc.find((tag) => tag.name === "param");
    return paramTag?.text?.[0]?.text;
  }

  private extractDependencies(node: ts.FunctionDeclaration): string[] {
    const dependencies: string[] = [];

    const visitNode = (n: ts.Node) => {
      if (ts.isCallExpression(n)) {
        const expression = n.expression;
        if (ts.isIdentifier(expression)) {
          dependencies.push(expression.getText());
        }
      }
      ts.forEachChild(n, visitNode);
    };

    visitNode(node.body!);
    return [...new Set(dependencies)];
  }

  private findExamples(functionName: string): string[] {
    // Search for examples in docs and tests
    const examples: string[] = [];

    // Search in markdown files
    const docsPath = path.join(this.projectPath, "docs");
    if (fs.existsSync(docsPath)) {
      const mdFiles = this.findFiles(docsPath, ".md");
      for (const file of mdFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const regex = new RegExp(
          "```(?:typescript|javascript|ts|js)[^\\n]*\\n([^\\n]*" +
            functionName +
            "[^\\n]*\\n[^`]*)\\n```",
          "g"
        );
        let match;
        while ((match = regex.exec(content)) !== null) {
          examples.push(match[1].trim());
        }
      }
    }

    return examples;
  }

  private findTestUsage(functionName: string): string[] {
    // Search in test files
    const testFiles = this.sourceFiles.filter(
      (sf) => sf.fileName.includes(".test.") || sf.fileName.includes(".spec.")
    );

    const usages: string[] = [];

    for (const testFile of testFiles) {
      const content = testFile.getText();
      const regex = new RegExp(
        `([^\\n]*${functionName}\\s*\\([^\\)]*\\)[^\\n]*)`,
        "g"
      );
      let match;
      while ((match = regex.exec(content)) !== null) {
        usages.push(match[1].trim());
      }
    }

    return usages;
  }

  private getPerformanceData(
    functionName: string
  ): PerformanceData | undefined {
    // Run benchmarks if available
    try {
      const benchmarkPath = path.join(
        this.projectPath,
        "benchmark",
        `${functionName}.bench.ts`
      );
      if (fs.existsSync(benchmarkPath)) {
        const result = execSync(`npm run benchmark -- ${functionName}`, {
          cwd: this.projectPath,
          encoding: "utf-8",
        });

        // Parse benchmark results
        const timeMatch = result.match(/Average time: (\d+\.?\d*) ns/);
        const memoryMatch = result.match(/Memory usage: (\d+) bytes/);

        return {
          avgTime: timeMatch ? parseFloat(timeMatch[1]) : 0,
          memoryUsage: memoryMatch ? parseInt(memoryMatch[1]) : 0,
          complexity: this.analyzeComplexity(functionName),
        };
      }
    } catch (e) {
      // No benchmark available
    }

    return undefined;
  }

  private analyzeComplexity(functionName: string): string {
    // Simple complexity analysis based on loops and recursion
    // This would need more sophisticated analysis in practice
    return "O(n)";
  }

  private findFiles(dir: string, ext: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith(ext)) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  private generateFunctionDoc(func: FunctionDoc): string {
    const template = `---
id: ${func.name}-deep-dive
title: ${func.name}() - Complete Implementation Guide
tags: [api, function, ${this.inferTags(func)}]
module: ${this.inferModule(func)}
complexity: ${this.inferComplexity(func)}
performance_impact: ${this.inferPerformanceImpact(func)}
---

# ${func.name}() - Complete Implementation Guide

## Quick Reference
${this.extractSummary(func)}

## Signature
\`\`\`typescript
${func.signature}
\`\`\`

## Parameters
${func.parameters
  .map(
    (p) =>
      `- **${p.name}**: \`${p.type}\` ${p.optional ? "(optional)" : ""} - ${
        p.description || "No description"
      }`
  )
  .join("\n")}

## Return Type
\`${func.returnType}\`

## Implementation Details

### Dependencies
${
  func.dependencies.length > 0
    ? func.dependencies.map((d) => `- ${d}()`).join("\n")
    : "No internal dependencies"
}

${
  func.performanceData
    ? `
### Performance Characteristics
- **Average Time**: ${func.performanceData.avgTime}ns
- **Memory Usage**: ${func.performanceData.memoryUsage} bytes
- **Complexity**: ${func.performanceData.complexity}
`
    : ""
}

## Usage Examples

### From Documentation
${
  func.examples.length > 0
    ? func.examples
        .map(
          (ex, i) => `
#### Example ${i + 1}
\`\`\`typescript
${ex}
\`\`\`
`
        )
        .join("\n")
    : "No examples found in documentation"
}

### From Tests
${
  func.usageInTests.length > 0
    ? func.usageInTests
        .slice(0, 3)
        .map(
          (usage, i) => `
\`\`\`typescript
${usage}
\`\`\`
`
        )
        .join("\n")
    : "No test usage found"
}

## See Also
${this.generateSeeAlso(func)}
`;

    return template;
  }

  private extractSummary(func: FunctionDoc): string {
    if (func.jsDoc?.comment) {
      return typeof func.jsDoc.comment === "string"
        ? func.jsDoc.comment
        : func.jsDoc.comment.map((c) => c.text).join("");
    }
    return `Function ${func.name} - No summary available`;
  }

  private inferTags(func: FunctionDoc): string {
    const tags: string[] = [];

    if (func.name.includes("create")) tags.push("factory");
    if (func.name.includes("Error")) tags.push("error-handling");
    if (func.performanceData) tags.push("performance-measured");
    if (func.parameters.some((p) => p.name === "context"))
      tags.push("context-aware");

    return tags.join(", ");
  }

  private inferModule(func: FunctionDoc): string {
    // Infer from file path or function name
    if (func.name.includes("React")) return "react";
    if (func.name.includes("middleware")) return "middleware";
    return "core";
  }

  private inferComplexity(func: FunctionDoc): string {
    if (func.parameters.length === 0) return "basic";
    if (func.parameters.length > 3) return "advanced";
    return "intermediate";
  }

  private inferPerformanceImpact(func: FunctionDoc): string {
    if (!func.performanceData) return "unknown";
    if (func.performanceData.avgTime < 50) return "negligible";
    if (func.performanceData.avgTime < 200) return "low";
    if (func.performanceData.avgTime < 1000) return "medium";
    return "high";
  }

  private generateSeeAlso(func: FunctionDoc): string {
    const related: string[] = [];

    // Find related functions based on dependencies and naming
    for (const dep of func.dependencies) {
      related.push(`- [${dep}()](./${dep}-deep-dive.md)`);
    }

    return related.join("\n");
  }
}

// CLI Usage
if (require.main === module) {
  const projectPath = process.argv[2] || process.cwd();
  const outputPath = process.argv[3] || path.join(projectPath, "llm/rag-docs");

  console.log(`Generating RAG documentation for ${projectPath}...`);

  const generator = new RagDocGenerator(projectPath);
  const docs = generator.generateDocs();

  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Write individual doc files
  for (const [funcName, doc] of Object.entries(docs)) {
    const fileName = `${funcName}-deep-dive.md`;
    const filePath = path.join(outputPath, fileName);
    fs.writeFileSync(filePath, doc as string);
    console.log(`Generated ${fileName}`);
  }

  // Generate index
  const indexContent = `# try-error RAG Documentation Index

## Functions
${Object.keys(docs)
  .map((name) => `- [${name}()](./${name}-deep-dive.md)`)
  .join("\n")}

Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(outputPath, "index.md"), indexContent);
  console.log(
    `\nGenerated ${
      Object.keys(docs).length
    } documentation files in ${outputPath}`
  );
}

export { RagDocGenerator };
