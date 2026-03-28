"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { login, getAuthErrorMessage, type UserRole } from "../../lib/auth-api";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  document_number: z.string().min(5, "Ingresa tu número de documento"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  role: z.enum(["ADMIN", "ADVISOR"], { message: "Selecciona un rol" }),
});

type FormValues = z.infer<typeof schema>;

const roles: { value: UserRole; label: string }[] = [
  { value: "ADVISOR", label: "Asesor" },
  { value: "ADMIN", label: "Administrador" },
];

const inputBase =
  "w-full rounded-xl border bg-[oklch(0.97_0.01_240)] border-[oklch(0.9_0.02_240)] text-base focus:border-[oklch(0.55_0.2_240)] focus:ring-2 focus:ring-[oklch(0.55_0.2_240)]/20 transition-all placeholder:text-slate-500/60 outline-none";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const nextUrl = searchParams.get("next") ?? "/scheduling";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "ADVISOR" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const res = await login(values);
      setAuth(res.user, res.access, res.refresh);
      await new Promise((r) => setTimeout(r, 50));
      router.push(nextUrl);
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="border-0 rounded-2xl shadow-2xl shadow-[oklch(0.5_0.15_240)]/25 bg-white">
      <div className="p-10 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-r from-[oklch(0.55_0.2_240)] to-[oklch(0.4_0.22_230)] mb-5 shadow-xl shadow-[oklch(0.5_0.15_240)]/40">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-[oklch(0.25_0.06_240)]">
            Iniciar sesión
          </h1>

          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="h-1 w-10 bg-linear-to-r from-[oklch(0.55_0.2_240)] to-[oklch(0.6_0.18_240)] rounded-full" />
            <span className="h-1 w-2 bg-[oklch(0.65_0.15_240)] rounded-full" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            {/* Documento / Cédula */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[oklch(0.55_0.2_240)] transition-colors duration-200 pointer-events-none">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                autoComplete="username"
                placeholder="Número de cédula"
                className={`pl-12 h-14 ${inputBase}`}
                {...register("document_number")}
              />
              {errors.document_number && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.document_number.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[oklch(0.55_0.2_240)] transition-colors duration-200 pointer-events-none">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Contraseña"
                className={`pl-12 pr-12 h-14 ${inputBase}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[oklch(0.55_0.2_240)] transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Rol */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <select
                className={`pl-12 h-14 pr-4 ${inputBase} appearance-none bg-[oklch(0.97_0.01_240)]`}
                {...register("role")}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-600">{errors.role.message}</p>
              )}
            </div>
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-base font-bold uppercase tracking-widest rounded-xl bg-linear-to-r from-[oklch(0.55_0.2_240)] to-[oklch(0.5_0.22_230)] hover:from-[oklch(0.5_0.22_240)] hover:to-[oklch(0.45_0.24_230)] shadow-lg shadow-[oklch(0.5_0.15_240)]/35 hover:shadow-xl hover:shadow-[oklch(0.5_0.15_240)]/45 transition-all duration-300 hover:-translate-y-0.5 text-white disabled:pointer-events-none disabled:opacity-70 disabled:translate-y-0"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Ingresando...</span>
              </div>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-1.5">
          <span className="h-1.5 w-16 rounded-full bg-linear-to-r from-[oklch(0.55_0.2_240)] to-[oklch(0.6_0.18_240)]" />
          <span className="h-1.5 w-4 rounded-full bg-[oklch(0.7_0.12_240)]" />
          <span className="h-1.5 w-2 rounded-full bg-[oklch(0.8_0.08_240)]" />
        </div>
      </div>
    </div>
  );
}
