import { AdminConsole } from '../../components/admin/admin-console';
import { AppShell } from '../../components/layout/app-shell';

export default function AdminPage() {
  return (
    <AppShell
      title="Administração"
      subtitle="Base para gestão de catálogo e operação"
      currentPath="/admin"
    >
      <AdminConsole />
    </AppShell>
  );
}
