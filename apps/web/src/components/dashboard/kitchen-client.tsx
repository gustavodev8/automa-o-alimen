'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, CirclePlay, Truck, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

type OrderItem = {
  id: string;
  quantidade: number;
  produto: {
    nome: string;
  };
};

type Order = {
  id: string;
  codigo: string;
  status: string;
  tipo: string;
  total: string;
  cliente: {
    nome: string;
    telefone: string;
  };
  itens: OrderItem[];
};

type BoardResponse = {
  orders: Order[];
};

const statuses = ['NOVO', 'PAGO', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO'] as const;
const nextStatusByCurrent: Partial<Record<Order['status'], { label: string; status: Order['status']; icon: LucideIcon }>> = {
  NOVO: { label: 'Iniciar preparo', status: 'PREPARANDO', icon: CirclePlay },
  PAGO: { label: 'Iniciar preparo', status: 'PREPARANDO', icon: CirclePlay },
  PREPARANDO: { label: 'Marcar pronto', status: 'PRONTO', icon: UtensilsCrossed },
  PRONTO: { label: 'Saiu para entrega', status: 'SAIU_ENTREGA', icon: Truck },
  SAIU_ENTREGA: { label: 'Marcar entregue', status: 'ENTREGUE', icon: CheckCircle2 },
};

export function KitchenClient() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['order-board'],
    queryFn: () => apiFetch<BoardResponse>('/orders/board'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      apiFetch<{ order: Order }>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['order-board'] });
    },
  });

  if (query.isLoading) {
    return <KitchenSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Não foi possível carregar a cozinha.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-7">
      {statuses.map((status) => {
        const orders = query.data.orders.filter((order) => order.status === status);

        return (
          <div key={status} className="min-w-0 rounded-md border border-border bg-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{status}</h2>
              <Badge tone="neutral">{orders.length}</Badge>
            </div>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-4 text-xs text-mutedForeground">
                  Nenhum pedido
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="border-border">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-sm">{order.codigo}</CardTitle>
                      <p className="text-xs text-mutedForeground">{order.cliente.nome}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-mutedForeground">Tipo</span>
                        <span>{order.tipo}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-mutedForeground">Total</span>
                        <span>{formatCurrency(Number(order.total))}</span>
                      </div>
                      <div className="space-y-1">
                        {order.itens.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-mutedForeground">
                            <span className="min-w-0 truncate">
                              {item.quantidade}x {item.produto.nome}
                            </span>
                          </div>
                        ))}
                      </div>
                      {nextStatusByCurrent[order.status] ? (
                        <Button
                          className="mt-2 w-full"
                          size="sm"
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: order.id,
                              status: nextStatusByCurrent[order.status]!.status,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          {(() => {
                            const ActionIcon = nextStatusByCurrent[order.status]!.icon;
                            return <ActionIcon className="h-4 w-4" />;
                          })()}
                          {nextStatusByCurrent[order.status]!.label}
                        </Button>
                      ) : (
                        <div className="mt-2 rounded-md border border-border px-3 py-2 text-center text-xs text-mutedForeground">
                          Sem ação disponivel
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function KitchenSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
