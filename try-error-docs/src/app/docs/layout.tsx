import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <div className="flex h-14 items-center border-b px-4 lg:px-6">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">try-error Documentation</h1>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-2 lg:p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
