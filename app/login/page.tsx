import Link from "next/link";
import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-sky-50 px-4">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Volver al agendamiento
          </Link>
        </p>
      </div>
    </div>
  );
}
