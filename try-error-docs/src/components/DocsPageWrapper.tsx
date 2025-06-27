"use client";

import { useEffect } from "react";
import { TableOfContents } from "./TableOfContents";
import { PageNavigation } from "./PageNavigation";
import { cn } from "@/lib/utils";

interface DocsPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  showToc?: boolean;
  navigation?: {
    previous?: {
      title: string;
      href: string;
    };
    next?: {
      title: string;
      href: string;
    };
  };
}

export function DocsPageWrapper({
  children,
  className,
  showToc = true,
  navigation,
}: DocsPageWrapperProps) {
  useEffect(() => {
    // Add IDs to all headings that don't have them
    const headings = document.querySelectorAll("h2, h3, h4");
    headings.forEach((heading) => {
      if (!heading.id && heading.textContent) {
        // Create ID from heading text
        const id = heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        heading.id = id;
      }
    });
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {children}
          </div>
          {navigation && (
            <PageNavigation
              previous={navigation.previous}
              next={navigation.next}
            />
          )}
        </div>

        {/* Table of contents - only show on larger screens */}
        {showToc && (
          <aside className="hidden xl:block">
            <TableOfContents className="w-64" />
          </aside>
        )}
      </div>
    </div>
  );
}
