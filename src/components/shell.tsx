import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Shield,
  Wrench,
} from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";
const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/catalog", label: "Catalog", icon: BookOpen },
  { to: "/vault", label: "Vault", icon: KeyRound },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/audit", label: "Audit", icon: ScrollText },
  { to: "/standard", label: "Standard", icon: Shield },
] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-md border border-border bg-surface">
              <Shield className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                GekkoVault
              </p>
              <p className="truncate text-xs text-muted">
                One store · many injectors
              </p>
            </div>
          </div>
          <AuthSlot />
        </div>
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5"
          aria-label="Primary"
        >
          {NAV.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-elevated text-fg"
                    : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-md bg-elevated" aria-hidden />
    );
  }
  if (user) return <UserButton />;
  return (
    <Link
      to="/login"
      className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted transition-colors hover:text-fg"
    >
      Sign in
    </Link>
  );
}
export function SignInGate({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded-md bg-elevated" />
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Sign in required</h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Operator actions (vault writes, tool tokens, audit) need a signed-in
          session. Agents use short-lived tool tokens via the API — not your
          chat session.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Sign in to operate
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
