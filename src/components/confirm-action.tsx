"use client";

import type { ReactElement, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/** A button that asks for confirmation and states the consequence first (one pattern for every irreversible action). */
export function ConfirmAction({
  trigger,
  children,
  title,
  description,
  confirm,
  cancel,
  destructive = false,
  onConfirm,
}: {
  /** The button that opens the dialog, e.g. `<Button variant="outline" />`. */
  trigger: ReactElement;
  children: ReactNode;
  title: ReactNode;
  description: ReactNode;
  confirm: ReactNode;
  cancel: ReactNode;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger}>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
