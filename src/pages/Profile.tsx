import { User, Bell, Shield, LogOut, ChevronRight } from "lucide-react";

const menuItems = [
  { icon: Bell, label: "Notificações", detail: "Ativadas" },
  { icon: Shield, label: "Privacidade" },
  { icon: LogOut, label: "Sair", destructive: true },
];

const Profile = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-md px-5 py-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Perfil</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5">
        {/* Avatar card */}
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-7 w-7" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-card-foreground">
              Usuário
            </p>
            <p className="text-sm text-muted-foreground">usuario@email.com</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { value: "12", label: "Filas" },
            { value: "4h", label: "Economizadas" },
            { value: "98%", label: "Presença" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-4"
            >
              <span className="font-display text-2xl font-bold text-primary">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left transition-colors hover:bg-muted ${
                item.destructive ? "text-destructive" : "text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.detail && (
                <span className="text-xs text-muted-foreground">{item.detail}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Profile;
