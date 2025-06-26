"use client";

import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { DocSearchModal, useDocSearchKeyboardEvents } from "@docsearch/react";
import "@docsearch/css";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

export function SearchDialog() {
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string>("");

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const onInput = useCallback((event: KeyboardEvent) => {
    setIsOpen(true);
    setInitialQuery(event.key);
  }, []);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    onInput,
    searchButtonRef,
  });

  return (
    <>
      <Button
        ref={searchButtonRef}
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={onOpen}
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
          <DocSearchModal
            appId={process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "YOUR_APP_ID"}
            indexName={
              process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "try-error-docs"
            }
            apiKey={
              process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ||
              "YOUR_SEARCH_API_KEY"
            }
            placeholder="Search documentation..."
            searchParameters={{
              facetFilters: ["version:latest"],
            }}
            transformItems={(items) => {
              return items.map((item) => ({
                ...item,
                url: item.url.replace("https://try-error.dev", ""),
              }));
            }}
            onClose={onClose}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
          />,
          document.body
        )}
    </>
  );
}
