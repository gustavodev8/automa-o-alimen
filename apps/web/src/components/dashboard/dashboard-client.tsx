'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CircleDollarSign,
  Package,
  QrCode,
  RefreshCw,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
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

type EvolutionConnectionResponse = {
  instanceName: string;
  state: string;
  qrCode: {
    pairingCode: string | null;
    code: string | null;
    base64: string | null;
    count?: number | null;
  } | null;
};

const tiles = [
  { key: 'ordersToday', label: 'Pedidos hoje', icon: Package },
  { key: 'inProgress', label: 'Em andamento', icon: UtensilsCrossed },
  { key: 'revenue', label: 'Faturamento', icon: CircleDollarSign },
  { key: 'customers', label: 'Clientes', icon: Users },
] as const;

export function DashboardClient() {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiFetch<DashboardSummary>('/dashboard/summary'),
  });

  const connectionMutation = useMutation({
    mutationFn: () => apiFetch<EvolutionConnectionResponse>('/webhooks/evolution/connection'),
    onSuccess: () => {
      setIsConnectOpen(true);
    },
  });

  if (summaryQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Nao foi possivel carregar o resumo.
        </CardContent>
      </Card>
    );
  }

  const summary = summaryQuery.data.summary;
  const connection = connectionMutation.data ?? null;
  const qrCode = connection?.qrCode?.base64 ?? null;
  const connectionLabel = formatConnectionState(connection?.state ?? null);
  const connectionError = connectionMutation.error instanceof Error ? connectionMutation.error.message : null;

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

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operacao</CardTitle>
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
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <CardTitle>WhatsApp</CardTitle>
              </div>
              <Badge tone={connection?.state === 'open' ? 'success' : 'warning'}>{connectionLabel}</Badge>
            </div>
            <p className="text-sm text-mutedForeground">
              Clique para criar a instancia da Evolution e ler o QR code no celular.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
              Instancia: <span className="font-medium text-foreground">lanchonete</span>
            </div>
            <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
              Conexao: <span className="font-medium text-foreground">{connection?.state ?? 'nao iniciada'}</span>
            </div>
            <Button
              className="w-full"
              type="button"
              onClick={() => {
                setIsConnectOpen(true);
                connectionMutation.mutate();
              }}
              disabled={connectionMutation.isPending}
            >
              <QrCode className="h-4 w-4" />
              {connectionMutation.isPending ? 'Gerando QR...' : 'Conectar WhatsApp'}
            </Button>
            <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
              O QR code aparece na janela abaixo depois da geracao.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Atalhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
              Cadastro de produtos e categorias ja disponivel na API.
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

      {isConnectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Conectar WhatsApp</CardTitle>
                  <p className="mt-1 text-sm text-mutedForeground">
                    Escaneie o QR com o WhatsApp para ligar a automacao.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsConnectOpen(false)}
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-sm text-mutedForeground">Status da instancia</span>
                <Badge tone={connection?.state === 'open' ? 'success' : 'warning'}>{connectionLabel}</Badge>
              </div>

              {connectionError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {connectionError}
                </div>
              ) : null}

              <div className="rounded-md border border-border bg-background p-4">
                {connectionMutation.isPending ? (
                  <div className="flex h-64 items-center justify-center text-sm text-mutedForeground">
                    Gerando QR code...
                  </div>
                ) : qrCode ? (
                  <img
                    src={qrCode}
                    alt="QR code da Evolution para conectar o WhatsApp"
                    className="mx-auto h-64 w-64 object-contain"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-mutedForeground">
                    Clique em conectar para gerar o QR code.
                  </div>
                )}
              </div>

              {connection?.qrCode?.code ? (
                <div className="rounded-md border border-border px-3 py-2 text-sm text-mutedForeground">
                  Codigo de pareamento: <span className="font-medium text-foreground">{connection.qrCode.code}</span>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  type="button"
                  onClick={() => connectionMutation.mutate()}
                  disabled={connectionMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar QR
                </Button>
                <Button variant="secondary" type="button" onClick={() => setIsConnectOpen(false)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatConnectionState(state: string | null) {
  if (!state) {
    return 'nao iniciada';
  }

  if (state === 'open') {
    return 'conectada';
  }

  if (state === 'connecting') {
    return 'aguardando pareamento';
  }

  return state;
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
