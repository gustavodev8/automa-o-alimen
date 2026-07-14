import { AppShell } from '../../components/layout/app-shell';
import { DashboardClient } from '../../components/dashboard/dashboard-client';

export default function DashboardPage() {
  return (
    <AppShell
      title="Painel operacional"
      subtitle="Resumo do dia e indicadores principais"
      currentPath="/dashboard"
    >
      <DashboardClient />
    </AppShell>
  );
}
