'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  PencilLine,
  Plus,
  Save,
  Tags,
  Trash2,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

type Category = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

type Product = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: string;
  foto: string | null;
  ativo: boolean;
  estoque: number;
  tempoPreparo: number;
  categoriaId: string;
  categoria: Category;
};

type Customer = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  documento: string | null;
  ativo: boolean;
};

type CategoriesResponse = { categories: Category[] };
type ProductsResponse = { products: Product[] };
type CustomersResponse = { customers: Customer[] };

export function AdminConsole() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <CategoriesPanel />
      <ProductsPanel />
      <CustomersPanel />
    </div>
  );
}

function CategoriesPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<CategoriesResponse>('/categories'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ category: Category }>('/categories', {
        method: 'POST',
        body: {
          nome,
          descricao: descricao.trim() ? descricao : null,
          ativo,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ category: Category }>(`/categories/${editingId}`, {
        method: 'PATCH',
        body: {
          nome,
          descricao: descricao.trim() ? descricao : null,
          ativo,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ category: Category }>(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const items = categoriesQuery.data?.categories ?? [];

  function resetForm() {
    setEditingId(null);
    setNome('');
    setDescricao('');
    setAtivo(true);
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setNome(category.nome);
    setDescricao(category.descricao ?? '');
    setAtivo(category.ativo);
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-primary" />
          <CardTitle>Categorias</CardTitle>
        </div>
        <p className="text-sm text-mutedForeground">Agrupe o cardápio por seção.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome</Label>
            <Input id="category-name" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Descrição</Label>
            <Textarea
              id="category-description"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={ativo} onChange={(event) => setAtivo(event.target.checked)} />
            Ativo
          </label>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              type="button"
              onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
              disabled={createMutation.isPending || updateMutation.isPending || !nome.trim()}
            >
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
            {editingId ? (
              <Button variant="secondary" type="button" onClick={resetForm}>
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            ) : null}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {items.map((category) => (
            <div key={category.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{category.nome}</p>
                    <Badge tone={category.ativo ? 'success' : 'neutral'}>
                      {category.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-mutedForeground">{category.descricao ?? 'Sem descrição'}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => startEdit(category)}>
                  <PencilLine className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => archiveMutation.mutate(category.id)}
                  disabled={!category.ativo}
                >
                  <Archive className="h-4 w-4" />
                  Arquivar
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 ? <p className="text-sm text-mutedForeground">Nenhuma categoria cadastrada.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductsPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('0');
  const [foto, setFoto] = useState('');
  const [estoque, setEstoque] = useState('0');
  const [tempoPreparo, setTempoPreparo] = useState('0');
  const [ativo, setAtivo] = useState(true);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<CategoriesResponse>('/categories'),
  });

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<ProductsResponse>('/products'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ product: Product }>('/products', {
        method: 'POST',
        body: {
          nome,
          descricao: descricao.trim() ? descricao : null,
          categoriaId,
          preco: Number(preco),
          foto: foto.trim() ? foto : null,
          estoque: Number(estoque),
          tempoPreparo: Number(tempoPreparo),
          ativo,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ product: Product }>(`/products/${editingId}`, {
        method: 'PATCH',
        body: {
          nome,
          descricao: descricao.trim() ? descricao : null,
          categoriaId,
          preco: Number(preco),
          foto: foto.trim() ? foto : null,
          estoque: Number(estoque),
          tempoPreparo: Number(tempoPreparo),
          ativo,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ product: Product }>(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const categories = categoriesQuery.data?.categories ?? [];
  const products = productsQuery.data?.products ?? [];
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoriaId),
    [categories, categoriaId],
  );

  function resetForm() {
    setEditingId(null);
    setNome('');
    setDescricao('');
    setCategoriaId('');
    setPreco('0');
    setFoto('');
    setEstoque('0');
    setTempoPreparo('0');
    setAtivo(true);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setNome(product.nome);
    setDescricao(product.descricao ?? '');
    setCategoriaId(product.categoriaId);
    setPreco(String(product.preco));
    setFoto(product.foto ?? '');
    setEstoque(String(product.estoque));
    setTempoPreparo(String(product.tempoPreparo));
    setAtivo(product.ativo);
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          <CardTitle>Produtos</CardTitle>
        </div>
        <p className="text-sm text-mutedForeground">Cadastre itens do cardápio com preço real do banco.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome</Label>
            <Input id="product-name" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Categoria</Label>
            <select
              id="product-category"
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={categoriaId}
              onChange={(event) => setCategoriaId(event.target.value)}
            >
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">Descrição</Label>
            <Textarea
              id="product-description"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="product-price">Preço</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                value={preco}
                onChange={(event) => setPreco(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Estoque</Label>
              <Input
                id="product-stock"
                type="number"
                value={estoque}
                onChange={(event) => setEstoque(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="product-photo">Foto</Label>
              <Input id="product-photo" value={foto} onChange={(event) => setFoto(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-time">Tempo preparo</Label>
              <Input
                id="product-time"
                type="number"
                value={tempoPreparo}
                onChange={(event) => setTempoPreparo(event.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={ativo} onChange={(event) => setAtivo(event.target.checked)} />
            Ativo
          </label>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              type="button"
              onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !nome.trim() ||
                !categoriaId ||
                !selectedCategory
              }
            >
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
            {editingId ? (
              <Button variant="secondary" type="button" onClick={resetForm}>
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            ) : null}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{product.nome}</p>
                    <Badge tone={product.ativo ? 'success' : 'neutral'}>
                      {product.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-mutedForeground">{product.categoria.nome}</p>
                  <p className="mt-1 text-xs text-mutedForeground">{product.descricao ?? 'Sem descrição'}</p>
                  <p className="mt-2 text-sm font-semibold">{formatCurrency(Number(product.preco))}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => startEdit(product)}>
                  <PencilLine className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => archiveMutation.mutate(product.id)}
                  disabled={!product.ativo}
                >
                  <Archive className="h-4 w-4" />
                  Arquivar
                </Button>
              </div>
            </div>
          ))}
          {products.length === 0 ? <p className="text-sm text-mutedForeground">Nenhum produto cadastrado.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomersPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [documento, setDocumento] = useState('');
  const [ativo, setAtivo] = useState(true);

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch<CustomersResponse>('/customers'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ customer: Customer }>('/customers', {
        method: 'POST',
        body: {
          nome,
          telefone,
          email: email.trim() ? email : null,
          documento: documento.trim() ? documento : null,
          ativo,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ customer: Customer }>(`/customers/${editingId}`, {
        method: 'PATCH',
        body: {
          nome,
          telefone,
          email: email.trim() ? email : null,
          documento: documento.trim() ? documento : null,
          ativo,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      resetForm();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ customer: Customer }>(`/customers/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const customers = customersQuery.data?.customers ?? [];

  function resetForm() {
    setEditingId(null);
    setNome('');
    setTelefone('');
    setEmail('');
    setDocumento('');
    setAtivo(true);
  }

  function startEdit(customer: Customer) {
    setEditingId(customer.id);
    setNome(customer.nome);
    setTelefone(customer.telefone);
    setEmail(customer.email ?? '');
    setDocumento(customer.documento ?? '');
    setAtivo(customer.ativo);
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <CardTitle>Clientes</CardTitle>
        </div>
        <p className="text-sm text-mutedForeground">Cadastre e atualize os dados do cliente.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nome</Label>
            <Input id="customer-name" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Telefone</Label>
            <Input
              id="customer-phone"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="5511999999999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-document">Documento</Label>
            <Input
              id="customer-document"
              value={documento}
              onChange={(event) => setDocumento(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={ativo} onChange={(event) => setAtivo(event.target.checked)} />
            Ativo
          </label>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              type="button"
              onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
              disabled={createMutation.isPending || updateMutation.isPending || !nome.trim() || !telefone.trim()}
            >
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
            {editingId ? (
              <Button variant="secondary" type="button" onClick={resetForm}>
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            ) : null}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{customer.nome}</p>
                    <Badge tone={customer.ativo ? 'success' : 'neutral'}>
                      {customer.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-mutedForeground">{customer.telefone}</p>
                  <p className="mt-1 text-xs text-mutedForeground">{customer.email ?? 'Sem email'}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => startEdit(customer)}>
                  <PencilLine className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => archiveMutation.mutate(customer.id)}
                  disabled={!customer.ativo}
                >
                  <Archive className="h-4 w-4" />
                  Arquivar
                </Button>
              </div>
            </div>
          ))}
          {customers.length === 0 ? <p className="text-sm text-mutedForeground">Nenhum cliente cadastrado.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
