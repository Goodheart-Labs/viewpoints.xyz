"use client";

import { CheckCircle2 } from "lucide-react";

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from "@/app/components/shadcn/ui/toast";
import { useToast } from "@/app/components/shadcn/ui/use-toast";

export const Toaster = () => {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={3000}>
      {toasts.map(({ id, description, action, icon, ...props }) => {
        const Icon = icon || CheckCircle2;

        return (
          <Toast key={id} {...props}>
            <div className="flex gap-2 items-center">
              <Icon size="16" fill="black" stroke="white" />
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
};
