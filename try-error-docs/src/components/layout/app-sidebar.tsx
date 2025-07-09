"use client";
import {
  BookOpen,
  Code,
  FileText,
  Home,
  Lightbulb,
  Package,
  Puzzle,
  Rocket,
  Settings,
  Zap,
  Github,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSidebarScroll } from "@/lib/atoms";

// Documentation navigation structure
const navigation = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        url: "/docs",
        icon: Home,
      },
      {
        title: "Installation",
        url: "/docs/installation",
        icon: Package,
      },
      {
        title: "Quick Start",
        url: "/docs/quick-start",
        icon: Rocket,
      },
      {
        title: "Migration Guide",
        url: "/docs/migration",
        icon: FileText,
      },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      {
        title: "Error Handling Philosophy",
        url: "/docs/concepts/philosophy",
        icon: Lightbulb,
      },
      {
        title: "TryResult vs Exceptions",
        url: "/docs/concepts/tryresult-vs-exceptions",
        icon: Puzzle,
      },
      {
        title: "Error Types",
        url: "/docs/concepts/error-types",
        icon: Code,
      },
      {
        title: "Success vs Error Paths",
        url: "/docs/concepts/success-vs-error",
        icon: Zap,
      },
    ],
  },
  {
    title: "API Reference",
    items: [
      {
        title: "Complete API Reference",
        url: "/docs/api-reference",
        icon: BookOpen,
      },
      {
        title: "Synchronous Operations",
        url: "/docs/api/sync",
        icon: Code,
      },
      {
        title: "Asynchronous Operations",
        url: "/docs/api/async",
        icon: Code,
      },
      {
        title: "Error Creation",
        url: "/docs/api/errors",
        icon: Code,
      },
      {
        title: "Error Factories",
        url: "/docs/reference/error-factories",
        icon: Code,
      },
      {
        title: "Utilities",
        url: "/docs/api/utils",
        icon: Code,
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        title: "TypeScript Issues",
        url: "/docs/troubleshooting",
        icon: Settings,
      },
      {
        title: "Common Pitfalls",
        url: "/docs/common-pitfalls",
        icon: Settings,
      },
    ],
  },
  {
    title: "React Integration",
    items: [
      {
        title: "Installation",
        url: "/docs/react/installation",
        icon: Package,
      },
      {
        title: "Hooks",
        url: "/docs/react/hooks",
        icon: Code,
      },
      {
        title: "Components",
        url: "/docs/react/components",
        icon: Code,
      },
      {
        title: "Types",
        url: "/docs/react/types",
        icon: Code,
      },
    ],
  },
  {
    title: "Advanced Patterns",
    items: [
      {
        title: "Custom Error Types",
        url: "/docs/advanced/custom-errors",
        icon: Settings,
      },
      {
        title: "Error Factories",
        url: "/docs/advanced/factories",
        icon: Settings,
      },
      {
        title: "Performance & Best Practices",
        url: "/docs/advanced/performance",
        icon: Zap,
      },
      {
        title: "Error Performance Secrets",
        url: "/docs/advanced/error-performance",
        icon: Zap,
      },
    ],
  },
  {
    title: "Examples & Tutorials",
    items: [
      {
        title: "Basic Examples",
        url: "/docs/examples/basic",
        icon: BookOpen,
      },
      {
        title: "Real-World Scenarios",
        url: "/docs/examples/real-world",
        icon: BookOpen,
      },
      {
        title: "React Examples",
        url: "/docs/examples/react",
        icon: BookOpen,
      },
      {
        title: "Sentry & Vercel Analytics",
        url: "/docs/examples/sentry-vercel",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Migration Guides",
        url: "/docs/guides/migration",
        icon: FileText,
      },
      {
        title: "Integration Guides",
        url: "/docs/guides/integration",
        icon: FileText,
      },
      {
        title: "API Framework Integration",
        url: "/docs/guides/api-frameworks",
        icon: Code,
      },
      {
        title: "Error Sampling",
        url: "/docs/guides/error-sampling",
        icon: FileText,
      },
      {
        title: "Performance Optimization",
        url: "/docs/guides/performance-optimization",
        icon: Zap,
      },
      {
        title: "Middleware System",
        url: "/docs/guides/middleware",
        icon: Settings,
      },
      {
        title: "Plugin System",
        url: "/docs/guides/plugins",
        icon: Puzzle,
      },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        title: "Error Factories",
        url: "/docs/reference/error-factories",
        icon: Code,
      },
      {
        title: "TypeScript Types",
        url: "/docs/reference/types",
        icon: Code,
      },
      {
        title: "Error Codes",
        url: "/docs/reference/error-codes",
        icon: Code,
      },
      {
        title: "Configuration",
        url: "/docs/reference/configuration",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const { scrollContainerRef, handleScroll, cleanup } = useSidebarScroll();
  const pathname = usePathname();

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Additional effect to ensure scroll restoration after route changes
  useEffect(() => {
    // Small delay to ensure the sidebar content has rendered after route change
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        // Get the stored scroll position from localStorage directly as a fallback
        const storedPosition = localStorage.getItem("sidebar-scroll-position");
        if (storedPosition) {
          const position = JSON.parse(storedPosition);
          if (typeof position === "number" && position > 0) {
            scrollContainerRef.current.scrollTop = position;
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, scrollContainerRef]); // Re-run when pathname changes

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="tryError logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <div>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Documentation
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent ref={scrollContainerRef} onScroll={handleScroll}>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground space-y-3">
          <div>
            <p>Built with Next.js & shadcn/ui</p>
            <p className="mt-1">© 2025 tryError</p>
          </div>
          <div className="pt-2 border-t border-border">
            <a
              href="https://github.com/oconnorjohnson/try-error"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3 w-3" />
              View on GitHub
            </a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
