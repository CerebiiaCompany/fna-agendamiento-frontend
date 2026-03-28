"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, FileText, Lock, Eye, EyeOff, Shield, CheckCircle, Mail } from "lucide-react";
import { register as registerApi, getAuthErrorMessage, type UserRole } from "../../lib/auth-api";

const schema = z
  .object({
    document_number: z.string().min(5, "Mínimo 5 caracteres"),
    first_name: z.string().min(2, "Nombres requeridos"),
    last_name: z.string().min(2, "Apellidos requeridos"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirm: z.string(),
    role: z.enum(["ADMIN", "ADVISOR"], { message: "Selecciona un rol" }),
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

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
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
    defaultValues: { role: "ADVISOR" },
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
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
      });
      setShowToast(true);
      reset({ role: "ADVISOR" });
      onSuccess?.();
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Número de documento
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Ej. 1023456789"
                className={`pl-12 h-12 ${inputBase}`}
                {...register("document_number")}
              />
            </div>
            {errors.document_number && (
              <p className="text-sm text-red-600">{errors.document_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Nombres
            </label>
            <input
              type="text"
              placeholder="Ej. Ana Sofía"
              className={`h-12 px-4 ${inputBase}`}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Apellidos
            </label>
            <input
              type="text"
              placeholder="Ej. Pérez Gómez"
              className={`h-12 px-4 ${inputBase}`}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                placeholder="Ej. usuario@correo.com"
                className={`pl-12 h-12 ${inputBase}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                className={`pl-12 pr-12 h-12 ${inputBase}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu contraseña"
                className={`pl-12 pr-12 h-12 ${inputBase}`}
                {...register("password_confirm")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password_confirm && (
              <p className="text-sm text-red-600">{errors.password_confirm.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Rol
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <select
                className={`pl-12 h-12 ${inputBase}`}
                {...register("role")}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {submitError && (
            <div className="text-red-600 text-sm">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-sky-600 text-white rounded-xl"
          >
            {isSubmitting ? "Registrando..." : "Registrarme"}
          </button>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-white border p-3 rounded-xl shadow-lg">
          <CheckCircle className="text-green-600" />
          <p>Usuario registrado correctamente</p>
        </div>
      )}
    </div>
  );
}
