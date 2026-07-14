import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AppShell({
  title,
  subtitle,
  currentPath,
  children,
}: {
  title: string;
  subtitle?: string;
  currentPath: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-background text-foreground">
      <Sidebar currentPath={currentPath} />
      <main className="flex min-w-0 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <div className="min-h-0 flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
