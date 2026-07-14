'use client';

import { useMutation } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch, saveSession } from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type LoginResponse = {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    role: string;
    ativo: boolean;
  };
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@lanchonete.local');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: () =>
      apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    onSuccess: (data) => {
      saveSession(data.token, data.user);
      router.push('/dashboard');
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-mutedForeground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Acesso administrativo
        </div>
        <CardTitle className="text-2xl">Entrar no painel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button className="w-full" onClick={() => login.mutate()} disabled={login.isPending}>
          {login.isPending ? 'Entrando...' : 'Entrar'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
