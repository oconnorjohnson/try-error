import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Github } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <div className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
          <div className="flex items-center">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-lg font-semibold">try-error Documentation</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/oconnorjohnson/try-error"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-accent"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-4 lg:p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
