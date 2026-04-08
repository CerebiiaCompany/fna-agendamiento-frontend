import { redirect } from "next/navigation";

/** Compatibilidad: la gestión de usuarios vive en /admin/users */
export default function RegisterRedirectPage() {
  redirect("/admin/users");
}
