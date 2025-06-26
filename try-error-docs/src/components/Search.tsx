"use client";

import { DocSearch } from "@docsearch/react";
import "@docsearch/css";

export function Search() {
  return (
    <DocSearch
      appId={process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "YOUR_APP_ID"}
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "try-error-docs"}
      apiKey={
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || "YOUR_SEARCH_API_KEY"
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
    />
  );
}
