import Link from 'next/link';
import { LayoutDashboard, Logs, Package2, Salad, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/kitchen', label: 'Cozinha', icon: Salad },
  { href: '/admin', label: 'Administração', icon: Settings2 },
];

export function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card/70 px-3 py-4">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primaryForeground">
          <Package2 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Lanchonete Central</div>
          <div className="text-xs text-mutedForeground">WhatsApp automation</div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-primary text-primaryForeground' : 'text-mutedForeground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-6 text-xs text-mutedForeground">
        <div className="flex items-center gap-2">
          <Logs className="h-3.5 w-3.5" />
          API + painel conectados
        </div>
      </div>
    </aside>
  );
}
