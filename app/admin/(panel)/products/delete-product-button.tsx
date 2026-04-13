"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Удалить товар и его фото из хранилища?")) return;
        startTransition(async () => {
          const r = await deleteProduct(id);
          if (!r.ok) {
            toast.error(r.error);
            return;
          }
          toast.success("Товар удалён");
          router.refresh();
        });
      }}
    >
      Удалить
    </Button>
  );
}
