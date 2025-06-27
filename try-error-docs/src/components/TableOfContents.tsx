"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Get all headings on the page
    const elements = Array.from(document.querySelectorAll("h2, h3, h4")).filter(
      (element) => element.id
    );

    const items: TocItem[] = elements.map((element) => ({
      id: element.id,
      text: element.textContent || "",
      level: parseInt(element.tagName.charAt(1)),
    }));

    setHeadings(items);

    // Set up intersection observer for active heading tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0% -80% 0%",
        threshold: 1.0,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn("sticky top-24 w-64 space-y-2 animate-fade-in", className)}
    >
      <h4 className="text-sm font-semibold mb-4">On this page</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const paddingLeft = (heading.level - 2) * 16;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block py-1 transition-all duration-200 hover:text-primary",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                  "border-l-2",
                  isActive ? "border-primary" : "border-transparent"
                )}
                style={{ paddingLeft: `${paddingLeft + 12}px` }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
