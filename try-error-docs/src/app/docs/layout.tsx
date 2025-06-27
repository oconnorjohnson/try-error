import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Github } from "lucide-react";
import { SearchDialog } from "@/components/SearchDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <div className="flex h-14 items-center justify-between border-b px-3 sm:px-4 lg:px-6">
          <div className="flex items-center">
            <SidebarTrigger />
            <div className="ml-2 sm:ml-4">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold">
                tryError Documentation
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <SearchDialog />
            <a
              href="https://github.com/oconnorjohnson/tryError"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-accent"
            >
              <Github className="h-4 w-4" />
              <span className="hidden md:inline">GitHub</span>
            </a>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-3 sm:p-4 lg:p-6">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
