import { LoginForm } from '../forms/login-form';

export function LoginScreen() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-soft">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">Lanchonete Central</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground">
              Atendimento, cozinha e pedidos no mesmo fluxo.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-mutedForeground">
              A operação começa aqui. Login administrativo, pedidos, mensagens, cozinha e
              integração com WhatsApp em uma base única.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Stat label="Pedidos hoje" value="0" />
            <Stat label="Em preparo" value="0" />
            <Stat label="Clientes" value="0" />
          </div>
        </section>

        <section className="flex items-center justify-center rounded-lg border border-border bg-background p-6">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-4 py-3">
      <div className="text-xs text-mutedForeground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
