import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/login")({ component: Login });
function Login() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-md border border-border bg-surface">
              <Shield className="size-4" aria-hidden />
            </span>
            <h1 className="text-xl font-semibold tracking-tight">
              GekkoVault sign-in
            </h1>
          </div>
          <p className="text-sm text-muted">
            Operator only. Agents use short-lived tool tokens from Tools.
          </p>
        </div>
        <div className="space-y-2.5 rounded-xl border border-border bg-surface p-4">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-md border border-border-strong",
                  "bg-elevated text-sm font-medium text-fg transition-colors",
                  "hover:bg-fg hover:text-accent-fg active:scale-[0.98]",
                )}
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="py-2 text-center text-sm text-muted">
              Sign-in is disabled.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
