import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-zinc-900 mb-2">Панель</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Управление каталогом: добавление товаров, фото и цен.
      </p>
      <Button asChild>
        <Link href="/admin/products">Все товары</Link>
      </Button>
      <Button asChild variant="outline" className="ml-2">
        <Link href="/admin/hero">Hero баннер</Link>
      </Button>
    </div>
  );
}
