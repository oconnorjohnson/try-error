import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageNavigationProps {
  previous?: {
    title: string;
    href: string;
  };
  next?: {
    title: string;
    href: string;
  };
  className?: string;
}

export function PageNavigation({
  previous,
  next,
  className,
}: PageNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      className={cn(
        "flex items-center justify-between border-t pt-8 mt-12",
        className
      )}
    >
      {previous ? (
        <Link
          href={previous.href}
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <div className="text-left">
            <div className="text-xs uppercase tracking-wide opacity-60">
              Previous
            </div>
            <div className="font-medium">{previous.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-right"
        >
          <div>
            <div className="text-xs uppercase tracking-wide opacity-60">
              Next
            </div>
            <div className="font-medium">{next.title}</div>
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
