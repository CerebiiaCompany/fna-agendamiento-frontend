import { Suspense } from "react";
import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative h-dvh overflow-hidden bg-linear-to-br from-sky-50 via-slate-50 to-cyan-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-8 right-8 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-md items-center">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
