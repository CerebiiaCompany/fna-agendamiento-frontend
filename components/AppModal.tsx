import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
};

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  actionText = "Aceptar",
  onAction,
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">

        <div className="flex flex-col items-center text-center space-y-4">

          {icon && (
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
              {icon}
            </div>
          )}

          <DialogTitle className="text-xl font-semibold text-slate-900">
            {title}
          </DialogTitle>

          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => {
              onAction?.();
              onOpenChange(false);
            }}
            className="rounded-xl px-4"
          >
            {actionText}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}