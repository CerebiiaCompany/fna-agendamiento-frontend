import { Suspense } from "react";
import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-sky-50 via-slate-50 to-sky-50 px-4">
      <div className="w-full max-w-md">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
