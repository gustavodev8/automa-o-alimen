'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CircleDollarSign, Package, Users, UtensilsCrossed } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

type DashboardSummary = {
  summary: {
    ordersToday: number;
    inProgress: number;
    canceled: number;
    revenue: number;
    products: number;
    customers: number;
    couriers: number;
    activeCategories: number;
  };
};

const tiles = [
  { key: 'ordersToday', label: 'Pedidos hoje', icon: Package },
  { key: 'inProgress', label: 'Em andamento', icon: UtensilsCrossed },
  { key: 'revenue', label: 'Faturamento', icon: CircleDollarSign },
  { key: 'customers', label: 'Clientes', icon: Users },
] as const;

export function DashboardClient() {
  const query = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiFetch<DashboardSummary>('/dashboard/summary'),
  });

  if (query.isLoading) {
    return <DashboardSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Não foi possível carregar o resumo.
        </CardContent>
      </Card>
    );
  }

  const summary = query.data.summary;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const value = summary[tile.key];

          return (
            <Card key={tile.key}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-mutedForeground">{tile.label}</CardTitle>
                <Icon className="h-4 w-4 text-mutedForeground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{tile.key === 'revenue' ? formatCurrency(value) : value}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-mutedForeground">Pedidos cancelados</span>
              <Badge tone="danger">{summary.canceled}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-mutedForeground">Categorias ativas</span>
              <Badge tone="success">{summary.activeCategories}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-mutedForeground">Entregadores ativos</span>
              <Badge tone="neutral">{summary.couriers}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
              Cadastro de produtos e categorias já disponível na API.
            </div>
            <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
              Webhook da Evolution pronto para receber mensagens.
            </div>
            <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
              Swagger em <span className="font-medium text-foreground">/docs</span>.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
