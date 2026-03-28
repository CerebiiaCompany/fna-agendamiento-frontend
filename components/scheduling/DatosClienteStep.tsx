"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppointmentStore } from "../../store/appointmentStore";

const schema = z.object({
  name: z.string().min(3, "Ingresa el nombre completo").max(255, "Nombre demasiado largo"),
  documentType: z.string().min(1, "Selecciona un tipo de documento"),
  document: z.string().min(5, "Número de documento válido").max(32, "Número demasiado largo"),
  email: z.string().min(1, "El correo es obligatorio").email("Correo electrónico válido"),
  phone: z.string().min(7, "Celular válido").max(20, "Número demasiado largo"),
  gender: z.string().min(1, "Selecciona género"),
  typeNotify: z.literal("email"),
});

type FormValues = z.infer<typeof schema>;

const tiposDocumento = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PP", label: "Pasaporte" },
  { value: "NIT", label: "Número de Identificación Tributaria" },
];

const generos = [
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
  { value: "Otro", label: "Otro" },
];

export function DatosClienteStep() {
  const { datosCliente, setDatosCliente, setPasoActual } = useAppointmentStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: datosCliente
      ? {
          name: datosCliente.name,
          documentType: datosCliente.documentType,
          document: datosCliente.document,
          email: datosCliente.email,
          phone: datosCliente.phone,
          gender: datosCliente.gender,
          typeNotify: "email",
        }
      : { typeNotify: "email" },
  });

  const onSubmit = (values: FormValues) => {
    setDatosCliente({
      name: values.name,
      documentType: values.documentType,
      document: values.document,
      email: values.email,
      phone: values.phone,
      gender: values.gender,
      typeNotify: "email",
    });
    setPasoActual(5);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 sm:grid-cols-2 sm:p-8"
    >
      <div className="sm:col-span-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Ingresa los datos del usuario
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Utilizaremos esta información para identificarte y enviarte la
          confirmación de tu cita.
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="Ej: Ana María Pérez"
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Tipo de documento</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          {...register("documentType")}
        >
          <option value="">Selecciona...</option>
          {tiposDocumento.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {errors.documentType && (
          <p className="mt-1 text-xs text-red-600">{errors.documentType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Número de documento</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="Ej: 1012345678"
          {...register("document")}
        />
        {errors.document && (
          <p className="mt-1 text-xs text-red-600">{errors.document.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Correo electrónico</label>
        <input
          type="email"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="Ej: usuario@correo.com"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Celular</label>
        <input
          type="tel"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="Ej: 3001234567"
          {...register("phone")}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Género</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          {...register("gender")}
        >
          <option value="">Selecciona...</option>
          {generos.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        {errors.gender && (
          <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">
          Confirmación
        </label>

        <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          El cliente recibirá la confirmación por <span className="font-medium text-slate-800">correo electrónico</span>
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-col gap-3 pt-8 sm:flex-row sm:justify-between">
        <button
          type="button"
          className="w-full sm:w-auto order-2 sm:order-1 inline-flex items-center justify-center rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 h-11 px-5"
          onClick={() => setPasoActual(3)}
        >
          Volver
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 px-5 rounded-xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
        >
          {isSubmitting ? "Validando..." : "Continuar a confirmación"}
        </button>
      </div>
    </form>
  );
}
