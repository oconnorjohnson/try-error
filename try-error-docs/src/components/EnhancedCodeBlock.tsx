"use client";

import React from "react";
import { CodeBlock } from "./CodeBlock";
import { InstallCommand } from "./InstallCommand";

interface EnhancedCodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  theme?: "dark" | "light";
  className?: string;
  // Installation command specific props
  isInstallCommand?: boolean;
  packageName?: string;
  devDependency?: boolean;
}

export function EnhancedCodeBlock({
  children,
  language = "bash",
  title,
  showLineNumbers = false,
  theme = "dark",
  className = "",
  isInstallCommand = false,
  packageName,
  devDependency = false,
}: EnhancedCodeBlockProps) {
  // Auto-detect installation commands
  const isInstall =
    isInstallCommand ||
    (language === "bash" &&
      (children.includes("npm install") ||
        children.includes("pnpm add") ||
        children.includes("yarn add")));

  // Extract package name from command if not provided
  const extractedPackageName =
    packageName ||
    (() => {
      if (!isInstall) return "";

      const match = children.match(
        /(?:npm install|pnpm add|yarn add)\s+([^\s]+)/
      );
      return match ? match[1] : "";
    })();

  // Check if it's a dev dependency
  const isDevDep =
    devDependency ||
    children.includes("--save-dev") ||
    children.includes("-D") ||
    children.includes("--dev");

  if (isInstall && extractedPackageName) {
    return (
      <InstallCommand
        packageName={extractedPackageName}
        devDependency={isDevDep}
        className={className}
      />
    );
  }

  return (
    <CodeBlock
      language={language}
      title={title}
      showLineNumbers={showLineNumbers}
      theme={theme}
      className={className}
    >
      {children}
    </CodeBlock>
  );
}

// Export both components for direct use
export { CodeBlock, InstallCommand };
