'use client';

import { LogOut, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { clearSession } from '../../lib/api';
import { useRouter } from 'next/navigation';

export function Topbar({ title, subtitle }: { title: string; subtitle: string | undefined }) {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push('/');
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle ? <p className="text-sm text-mutedForeground">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" type="button" onClick={() => router.refresh()}>
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
