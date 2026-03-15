"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, FileText, Mail, Lock, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import { register as registerApi, getAuthErrorMessage, type UserRole } from "../../lib/auth-api";

const schema = z
  .object({
    document_number: z.string().min(5, "Mínimo 5 caracteres"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirm: z.string(),
    role: z.enum(["ADMIN", "ADVISOR"], { message: "Selecciona un rol" }),
    email: z.string().email("Correo válido").optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

const roles: { value: UserRole; label: string }[] = [
  { value: "ADVISOR", label: "Asesor" },
  { value: "ADMIN", label: "Administrador" },
];

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none";

const TOAST_DURATION_MS = 5000;

export function RegisterForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "ADVISOR", email: "" },
  });

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [showToast]);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await registerApi({
        document_number: values.document_number,
        password: values.password,
        role: values.role,
        email: values.email?.trim() || undefined,
      });
      setShowToast(true);
      reset({ role: "ADVISOR", email: "" });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-4">
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-sky-200 to-sky-50">
              <UserPlus className="h-8 w-8 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Registro de usuario
              </h2>
              <p className="text-slate-500">
                Ingresa la información para crear un nuevo usuario.
              </p>
            </div>

          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Número de documento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Número de documento
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                autoComplete="username"
                placeholder="Ej. 1023456789"
                className={`pl-12 h-12 ${inputBase}`}
                {...register("document_number")}
              />
            </div>
            {errors.document_number && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {errors.document_number.message}
              </p>
            )}
          </div>

          {/* Correo electrónico */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Correo electrónico <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                autoComplete="email"
                placeholder="usuario@ejemplo.com"
                className={`pl-12 h-12 ${inputBase}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Contraseña <span className="text-slate-500 font-normal">(mín. 8 caracteres)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ingresa tu contraseña"
                className={`pl-12 pr-12 h-12 ${inputBase}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirma tu contraseña"
                className={`pl-12 pr-12 h-12 ${inputBase}`}
                {...register("password_confirm")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password_confirm && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {errors.password_confirm.message}
              </p>
            )}
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Rol
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 z-10 pointer-events-none" />
              <select
                className={`pl-12 h-12 pr-4 ${inputBase} appearance-none`}
                {...register("role")}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.role && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {errors.role.message}
              </p>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Botón de registro */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-sky-600 text-white hover:bg-sky-700 font-semibold text-base transition-all rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-70 disabled:translate-y-0"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando...
                </div>
              ) : (
                "Registrarme"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast de confirmación */}
      {showToast && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg shadow-slate-300/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-800">
            Usuario registrado correctamente.
          </p>
        </div>
      )}
    </div>
  );
}
