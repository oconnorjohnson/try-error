"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { liteClient } from "algoliasearch/lite";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const searchClient = liteClient(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ""
);

const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "";

// Function to transform production URLs to development URLs
const transformUrl = (url: string): string => {
  if (process.env.NODE_ENV === "development") {
    // Replace the production domain with localhost:1999
    // You might need to adjust this based on your actual production URL
    return url.replace(/https?:\/\/[^\/]+/, "http://localhost:1999");
  }
  return url;
};

interface SearchResult {
  objectID: string;
  title?: string;
  content?: string;
  url?: string;
  hierarchy?: {
    lvl0?: string;
    lvl1?: string;
    lvl2?: string;
    lvl3?: string;
  };
  [key: string]: any;
}

export function SearchDialog() {
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debug: Log the environment variables
  useEffect(() => {
    console.log("Algolia Config:", {
      appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "NOT SET",
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "NOT SET",
      apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
        ? "SET"
        : "NOT SET",
      environment: process.env.NODE_ENV,
    });
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchClient.search<SearchResult>({
        requests: [
          {
            indexName: indexName,
            query: searchQuery,
            hitsPerPage: 20,
            // Search parameters
            attributesToRetrieve: [
              "title",
              "content",
              "url",
              "hierarchy.lvl0",
              "hierarchy.lvl1",
              "hierarchy.lvl2",
              "hierarchy.lvl3",
            ],
            highlightPreTag: "<mark>",
            highlightPostTag: "</mark>",
            snippetEllipsisText: "...",
            attributesToSnippet: ["content:50"],
            // Relevance settings
            minWordSizefor1Typo: 4,
            minWordSizefor2Typos: 8,
            advancedSyntax: true,
            distinct: true,
            // Ranking settings
            typoTolerance: "strict",
            removeWordsIfNoResults: "allOptional",
          },
        ],
      });

      const firstResult = response.results[0];
      const hits = firstResult && "hits" in firstResult ? firstResult.hits : [];

      // Log the first result to see its structure
      if (hits.length > 0) {
        console.log("Sample search result structure:", hits[0]);
      }

      // Transform URLs for development environment
      const transformedHits = hits.map((hit) => ({
        ...hit,
        url: hit.url ? transformUrl(hit.url) : undefined,
      }));

      setResults(transformedHits);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search with a longer delay to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 400); // Increased from 300ms to 400ms

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const onClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      if (result.url.startsWith("http://localhost:1999")) {
        const path = result.url.replace("http://localhost:1999", "");
        window.location.href = path;
      } else {
        window.location.href = result.url;
      }
    }
    onClose();
  };

  // Get a display title from the result
  const getDisplayTitle = (result: SearchResult): string => {
    if (result.title) return result.title;

    // Try to get title from hierarchy
    const hierarchyTitle =
      result.hierarchy?.lvl0 ||
      result.hierarchy?.lvl1 ||
      result.hierarchy?.lvl2 ||
      result.hierarchy?.lvl3;
    if (hierarchyTitle) return hierarchyTitle;

    return result.objectID;
  };

  return (
    <>
      <Button
        ref={searchButtonRef}
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-50 w-full max-w-2xl rounded-lg border bg-background shadow-lg">
              <div className="flex items-center border-b px-3">
                <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation..."
                  className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="max-h-[calc(90vh-10rem)] overflow-y-auto">
                <div className="divide-y">
                  {isSearching && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  )}

                  {!isSearching && query && results.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  )}

                  {!isSearching && results.length > 0 && (
                    <div className="divide-y">
                      {results.map((result) => (
                        <button
                          key={result.objectID}
                          className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="font-medium">
                            {getDisplayTitle(result)}
                          </div>

                          {result.url && (
                            <div className="mt-1 text-xs text-muted-foreground opacity-60 truncate">
                              {result.url}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {!query && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Type to search...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
