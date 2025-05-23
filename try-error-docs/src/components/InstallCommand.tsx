"use client";

import React, { useState } from "react";
import { ChevronDown, Check, Copy, Package } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

type PackageManager = "pnpm" | "npm" | "yarn";

interface InstallCommandProps {
  packageName: string;
  devDependency?: boolean;
  className?: string;
}

const packageManagers: Record<
  PackageManager,
  { name: string; installCmd: string; devFlag: string }
> = {
  pnpm: { name: "pnpm", installCmd: "pnpm add", devFlag: "-D" },
  npm: { name: "npm", installCmd: "npm install", devFlag: "--save-dev" },
  yarn: { name: "Yarn", installCmd: "yarn add", devFlag: "--dev" },
};

export function InstallCommand({
  packageName,
  devDependency = false,
  className = "",
}: InstallCommandProps) {
  const [selectedPM, setSelectedPM] = useState<PackageManager>("pnpm");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCommand = (pm: PackageManager) => {
    const { installCmd, devFlag } = packageManagers[pm];
    const devSuffix = devDependency ? ` ${devFlag}` : "";
    return `${installCmd} ${packageName}${devSuffix}`;
  };

  const currentCommand = generateCommand(selectedPM);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Installation</span>

        {/* Package Manager Selector */}
        <div className="relative ml-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
          >
            {packageManagers[selectedPM].name}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-10 min-w-[80px]">
              {Object.entries(packageManagers).map(([key, pm]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPM(key as PackageManager);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 first:rounded-t-md last:rounded-b-md transition-colors"
                >
                  {pm.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Command Display */}
      <div className="relative group">
        <div className="flex items-center bg-slate-900 text-slate-100 px-4 py-3 rounded-lg font-mono text-sm">
          <span className="text-green-400 mr-2">$</span>
          <span className="flex-1">{currentCommand}</span>
          <button
            onClick={copyToClipboard}
            className="ml-3 p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            title="Copy command"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
