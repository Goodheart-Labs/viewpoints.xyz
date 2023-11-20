import type { FC, PropsWithChildren } from "react";
import React from "react";

import { CheckCircle2, RotateCw, XCircle } from "lucide-react";

import { Button } from "@/app/components/shadcn/ui/button";
import {
  Dialog as RawDialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/shadcn/ui/dialog";

type Props = PropsWithChildren<{
  isOpen: boolean;
  onCancel: () => void;
  onAccept: () => void;
  title: string;
  subtitle: string;
  okText: string;
  cancelText: string;
  submitDisabled: boolean;
  loading: boolean;
  loadingText: string;
}>;

export const Dialog: FC<Props> = ({
  isOpen,
  onCancel,
  onAccept,
  title,
  subtitle,
  okText,
  cancelText,
  children,
  submitDisabled,
  loading,
  loadingText,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel();
    }
  };

  return (
    <RawDialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="rounded-xl w-10/12 p-4"
        asChild={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-400 font-bold text-xs border-l-2 pl-2 mb-2 text-left">
            {title}
          </DialogTitle>

          <DialogTitle className="text-white text-left">{subtitle}</DialogTitle>
        </DialogHeader>
        <div>{children}</div>
        <DialogFooter>
          <div className="w-full flex justify-between gap-4">
            <Button
              className="rounded-full bg-zinc-700 text-zinc-400 hover:bg-zinc-600 [&:hover>svg]:stroke-zinc-600"
              onClick={onCancel}
            >
              <XCircle className="mr-2 w-5 h-5 fill-zinc-300 stroke-zinc-700" />
              {cancelText}
            </Button>
            <Button
              className="rounded-full bg-white text-black hover:bg-zinc-200 [&:hover>svg]:stroke-zinc-200"
              onClick={onAccept}
              disabled={submitDisabled || loading}
            >
              {loading ? (
                <RotateCw className="mr-2 w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 w-5 h-5 fill-black stroke-white" />
              )}
              {loading ? loadingText : okText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </RawDialog>
  );
};
