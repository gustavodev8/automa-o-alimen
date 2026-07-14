import { AppShell } from '../../components/layout/app-shell';
import { KitchenClient } from '../../components/dashboard/kitchen-client';

export default function KitchenPage() {
  return (
    <AppShell title="Cozinha" subtitle="Fila de produção por status" currentPath="/kitchen">
      <KitchenClient />
    </AppShell>
  );
}
