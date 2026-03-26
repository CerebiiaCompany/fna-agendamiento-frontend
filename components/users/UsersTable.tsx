"use client"

import { useEffect, useState } from "react"
import { getUsers, deleteUser, User } from "../../lib/auth-api"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Search, User as UserIcon, Mail, IdCard, Shield, Filter, UserPlus, X } from "lucide-react"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"
import { RegisterForm } from "../auth/RegisterForm"

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filterRole, setFilterRole] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showRegister, setShowRegister] = useState(false)

  const itemsPerPage = 8

  useEffect(() => {
    const controller = new AbortController()
    fetchUsers(controller.signal)
    return () => controller.abort()
  }, [])

  async function fetchUsers(signal?: AbortSignal) {
    try {
      setLoading(true)
      const data = await getUsers(signal)
      setUsers(data)
    } catch {
      setError("No se pudieron cargar los usuarios.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: number) {
    try {
        setDeletingId(userId)
        await deleteUser(userId)
        setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
        console.error("Delete error:", err)
        setError("No se pudo eliminar el usuario.")
    } finally {
        setDeletingId(null)
    }
    }

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    ADVISOR: "Asesor",
  }

  const roleStyles: Record<string, string> = {
    ADMIN: "bg-sky-50 text-sky-700 border-sky-200",
    ADVISOR: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }

  const filteredData = users
  .filter((u) => filterRole === "all" || u.role === filterRole)
  .filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.document_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (currentPage > 3) pages.push("...")

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) pages.push("...")

    pages.push(totalPages)

    return pages
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground text-sm">
        Cargando usuarios...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                }}
                className="pl-10 bg-card"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setCurrentPage(1); }}>
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

                <Button onClick={() => setShowRegister(true)} className="bg-sky-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo usuario
                </Button>
            </div>
        </div>

        {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <button
                onClick={() => setShowRegister(false)}
                className="absolute right-4 top-4 z-10 rounded-full p-1 text-slate-400  hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
            <RegisterForm onSuccess={() => { setShowRegister(false); fetchUsers(); }} />
            </div>
        </div>
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

            <Badge className={`${roleStyles[user.role]} w-full justify-center`}>
              {roleLabel[user.role]}
            </Badge>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
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
                            Vas a eliminar a <b>{user.first_name} {user.last_name}</b>.
                            <br />
                            <span className="text-red-500 font-medium">
                            Esta acción no se puede deshacer.
                            </span>
                        </AlertDialogDescription>
                    </div>
                        <AlertDialogFooter className="mt-6 flex gap-2 justify-center">
                            <AlertDialogCancel className="rounded-xl px-4">
                                Volver
                            </AlertDialogCancel>
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
              <th className="p-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 border-b">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-500">
                        {user.first_name[0]}
                        {user.last_name[0]}
                      </span>
                    </div>
                    {user.first_name} {user.last_name}
                  </div>
                </td>

                <td className="p-3 font-mono">
                  {user.document_number}
                </td>

                <td className="p-3 text-muted-foreground">
                  {user.email || "—"}
                </td>

                <td className="p-3">
                  <Badge className={roleStyles[user.role]}>
                    {roleLabel[user.role]}
                  </Badge>
                </td>

                <td className="p-3 text-left">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
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
                            Vas a eliminar a <b>{user.first_name} {user.last_name}</b>.
                            <br />
                            <span className="text-red-500 font-medium">
                            Esta acción no se puede deshacer.
                            </span>
                        </AlertDialogDescription>
                        </div>
                        <AlertDialogFooter className="mt-6 flex gap-2 justify-center">
                        <AlertDialogCancel className="rounded-xl px-4">
                            Volver
                        </AlertDialogCancel>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length}
          </p>

          <div className="flex gap-2">
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
                <span key={i} className="px-2">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  size="sm"
                  className={
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : ""
                  }
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
    </div>
  )
}