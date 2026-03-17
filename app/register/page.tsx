"use client";

import { RegisterForm } from "../../components/auth/RegisterForm";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

export default function RegisterPage() {
  return (
    <ProtectedRoute role="ADMIN">
      <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-sky-50 via-slate-50 to-sky-50 px-4 py-10">
        <div className="w-full max-w-lg">
          <RegisterForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
