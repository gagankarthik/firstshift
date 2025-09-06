// components/schedule/hooks/useOverrideConfirm.tsx
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function useOverrideConfirm() {
  const [ask, setAsk] = React.useState<{
    open: boolean;
    message: string;
    resolve?: (ok: boolean) => void;
  }>({ open: false, message: "" });

  function request(message: string) {
    return new Promise<boolean>((resolve) =>
      setAsk({ open: true, message, resolve })
    );
  }

  function onClose(ok: boolean) {
    ask.resolve?.(ok);
    setAsk({ open: false, message: "", resolve: undefined });
  }

  const element = (
    <AlertDialog open={ask.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Proceed anyway?</AlertDialogTitle>
          <AlertDialogDescription>{ask.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onClose(true)}>
            Override
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { request, element };
}
