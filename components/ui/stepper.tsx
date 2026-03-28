import React from "react";
import { cn } from "../../lib/utils";

type StepperProps = {
  steps: string[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <li key={label} className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  isActive &&
                    "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/40",
                  isCompleted &&
                    "border-emerald-600 bg-emerald-600 text-white",
                  !isActive &&
                    !isCompleted &&
                    "border-zinc-300 bg-white text-zinc-500",
                )}
              >
                {stepNumber}
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-zinc-400">
                  Paso {stepNumber}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive
                      ? "text-blue-700"
                      : isCompleted
                        ? "text-emerald-700"
                        : "text-zinc-500",
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
