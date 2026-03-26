"use client"

import { AuditRecord } from "@/lib/api"
import * as Avatar from "@radix-ui/react-avatar"
import { Badge } from "@/components/ui/badge"

interface Props {
  record: AuditRecord
}

export function AuditCard({ record }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Avatar.Root className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Avatar.Fallback className="text-sm font-medium text-primary">
            {record.asesor.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </Avatar.Fallback>
        </Avatar.Root>
        <span className="font-medium">{record.asesor}</span>
      </div>
      <p className="text-sm">{record.usuario}</p>
      <p className="text-xs text-muted-foreground">{record.servicio}</p>
      <Badge
        variant="outline"
        className="font-medium whitespace-nowrap"
      >
        {record.accion}
      </Badge>
    </div>
  )
}