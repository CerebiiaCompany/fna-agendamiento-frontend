"use client";

import { useEffect, useState } from "react";
import {
  listAdminUsers,
  deleteAdminUser,
  patchAdminUser,
  getApiErrorMessage,
  type AdminUser,
  type AdminUserPatchPayload,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  UserPlus,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegisterForm } from "../auth/RegisterForm";
import type { UserRole } from "@/lib/auth-api";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  ADVISOR: "Asesor",
};

const roleStyles: Record<string, string> = {
  ADMIN: "bg-sky-50 text-sky-700 border-sky-200",
  ADVISOR: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function UsersTable() {
  const { user: sessionUser } = useAuthStore();
  const currentUserId = sessionUser?.id ?? null;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDocument, setEditDocument] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("ADVISOR");
  const [editPassword, setEditPassword] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const itemsPerPage = 8;

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, []);

  function openEdit(u: AdminUser) {
    setEditingUser(u);
    setEditFirstName(u.first_name);
    setEditLastName(u.last_name);
    setEditEmail(u.email ?? "");
    setEditDocument(u.document_number);
    setEditRole((u.role === "ADMIN" ? "ADMIN" : "ADVISOR") as UserRole);
    setEditPassword("");
    setEditIsActive(u.is_active);
    setEditError(null);
  }

  async function fetchUsers(signal?: AbortSignal) {
    try {
      setLoading(true);
      setError(null);
      const data = await listAdminUsers(signal);
      setUsers(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId: number) {
    try {
      setDeletingId(userId);
      setError(null);
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(u: AdminUser, next: boolean) {
    try {
      setTogglingId(u.id);
      setError(null);
      const updated = await patchAdminUser(u.id, { is_active: next });
      setUsers((prev) => prev.map((row) => (row.id === u.id ? updated : row)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSaveEdit() {
    if (!editingUser) return;
    const patch: AdminUserPatchPayload = {};
    if (editFirstName !== editingUser.first_name) patch.first_name = editFirstName;
    if (editLastName !== editingUser.last_name) patch.last_name = editLastName;
    const trimmedEmail = editEmail.trim();
    const prevEmail = editingUser.email ?? "";
    if (trimmedEmail !== prevEmail) patch.email = trimmedEmail || "";
    if (editDocument !== editingUser.document_number) patch.document_number = editDocument;
    if (editRole !== editingUser.role) patch.role = editRole;
    if (editPassword.trim().length > 0) {
      if (editPassword.length < 8) {
        setEditError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      patch.password = editPassword;
    }
    if (editIsActive !== editingUser.is_active) patch.is_active = editIsActive;

    if (Object.keys(patch).length === 0) {
      setEditingUser(null);
      return;
    }

    try {
      setEditSaving(true);
      setEditError(null);
      const updated = await patchAdminUser(editingUser.id, patch);
      setUsers((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      setEditingUser(null);
    } catch (err) {
      setEditError(getApiErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  }

  const filteredData = users
    .filter((u) => filterRole === "all" || u.role === filterRole)
    .filter((u) => {
      if (filterActive === "active") return u.is_active;
      if (filterActive === "inactive") return !u.is_active;
      return true;
    })
    .filter((u) =>
      `${u.first_name} ${u.last_name} ${u.email ?? ""} ${u.document_number}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground text-sm">
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select
            value={filterRole}
            onValueChange={(v) => {
              setFilterRole(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] sm:w-[180px] bg-card">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {Object.keys(roleLabel).map((key) => (
                <SelectItem key={key} value={key}>
                  {roleLabel[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterActive}
            onValueChange={(v) => {
              setFilterActive(v as "all" | "active" | "inactive");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] sm:w-[180px] bg-card">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowRegister(true)} className="bg-sky-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo usuario
          </Button>
        </div>
      </div>

      {showRegister && (
        <Dialog open={true} onOpenChange={setShowRegister}>
          <DialogContent
            className="max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg overflow-y-auto sm:max-w-lg"
            showCloseButton
          >
            <DialogHeader>
              <DialogTitle>Nuevo usuario</DialogTitle>
              <DialogDescription>
                Crea un usuario en el sistema (requiere sesión de administrador).
              </DialogDescription>
            </DialogHeader>
            <RegisterForm
              embeddedInDialog
              onSuccess={() => {
                setShowRegister(false);
                fetchUsers();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {editingUser && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null);
          }}
        >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nombres</label>
              <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Apellidos</label>
              <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Correo (opcional)</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="vacío si no aplica"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Documento</label>
              <Input value={editDocument} onChange={(e) => setEditDocument(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Rol</label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADVISOR">Asesor</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Nueva contraseña (opcional)
              </label>
              <Input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Dejar vacío para no cambiar"
                autoComplete="new-password"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
              />
              Usuario activo
            </label>
            {editError && <p className="text-sm text-red-600">{editError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col gap-3 md:hidden">
        {paginatedData.map((user) => (
          <div
            key={user.id}
            className="p-4 border rounded-xl bg-card shadow-sm space-y-3"
          >
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-semibold">
                {user.first_name} {user.last_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Documento</p>
              <p className="font-mono">{user.document_number}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Correo</p>
              <p>{user.email || "—"}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={`${roleStyles[user.role]} justify-center`}>
                {roleLabel[user.role]}
              </Badge>
              {user.is_active ? (
                <Badge className="bg-green-50 text-green-800 border-green-200">Activo</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactivo
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openEdit(user)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={togglingId === user.id}
                onClick={() => handleToggleActive(user, !user.is_active)}
              >
                {user.is_active ? "Desactivar" : "Activar"}
              </Button>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={currentUserId !== null && user.id === currentUserId}
                >
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-full max-w-md rounded-2xl p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                  </div>
                  <AlertDialogTitle className="text-xl font-semibold text-slate-900">
                    ¿Eliminar usuario?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-slate-500">
                    Vas a eliminar a{" "}
                    <b>
                      {user.first_name} {user.last_name}
                    </b>
                    .
                    <br />
                    <span className="text-red-500 font-medium">
                      Esta acción no se puede deshacer.
                    </span>
                  </AlertDialogDescription>
                </div>
                <AlertDialogFooter className="mt-6 flex gap-2 justify-center">
                  <AlertDialogCancel className="rounded-xl px-4">Volver</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    className="bg-red-600 hover:bg-red-700 rounded-xl px-4"
                  >
                    {deletingId === user.id ? "Eliminando..." : "Sí, eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-2xl border bg-card max-h-[600px] min-h-[470px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Documento</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 border-b">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-500">
                        {(user.first_name?.[0] ?? "?").toUpperCase()}
                        {(user.last_name?.[0] ?? "").toUpperCase()}
                      </span>
                    </div>
                    {user.first_name} {user.last_name}
                  </div>
                </td>

                <td className="p-3 font-mono">{user.document_number}</td>

                <td className="p-3 text-muted-foreground">{user.email || "—"}</td>

                <td className="p-3">
                  <Badge className={roleStyles[user.role]}>{roleLabel[user.role]}</Badge>
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {user.is_active ? (
                      <Badge className="bg-green-50 text-green-800 border-green-200 whitespace-nowrap">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
                        Inactivo
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled={togglingId === user.id}
                      onClick={() => handleToggleActive(user, !user.is_active)}
                    >
                      {user.is_active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </td>

                <td className="p-3 text-left">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(user)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={currentUserId !== null && user.id === currentUserId}
                        >
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-full max-w-md rounded-2xl p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                            <AlertTriangle className="w-7 h-7 text-red-600" />
                          </div>
                          <AlertDialogTitle className="text-xl font-semibold text-slate-900">
                            ¿Eliminar usuario?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-slate-500">
                            Vas a eliminar a{" "}
                            <b>
                              {user.first_name} {user.last_name}
                            </b>
                            .
                            <br />
                            <span className="text-red-500 font-medium">
                              Esta acción no se puede deshacer.
                            </span>
                          </AlertDialogDescription>
                        </div>
                        <AlertDialogFooter className="mt-6 flex gap-2 justify-center">
                          <AlertDialogCancel className="rounded-xl px-4">Volver</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="bg-red-600 hover:bg-red-700 rounded-xl px-4"
                          >
                            {deletingId === user.id ? "Eliminando..." : "Sí, eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length}
          </p>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </Button>

            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${i}-${page}`}
                  size="sm"
                  className={currentPage === page ? "bg-blue-500 text-white" : ""}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {!loading && filteredData.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No hay usuarios que coincidan con los filtros.
        </p>
      )}
    </div>
  );
}
