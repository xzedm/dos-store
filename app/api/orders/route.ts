import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CheckoutItem = {
  id: string;
  quantity: number;
  price: number;
};

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, " ").trim();
}

function normalizeAddress(address: string) {
  return address.replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: async () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  let body: {
    phone?: string;
    address?: string;
    items?: CheckoutItem[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const address = normalizeAddress(body.address ?? "");
  const items = Array.isArray(body.items) ? body.items : [];

  if (!phone || phone.length < 7) {
    return NextResponse.json({ error: "INVALID_PHONE" }, { status: 400 });
  }

  if (!address || address.length < 8) {
    return NextResponse.json({ error: "INVALID_ADDRESS" }, { status: 400 });
  }

  if (!items.length) {
    return NextResponse.json({ error: "EMPTY_CART" }, { status: 400 });
  }

  const normalizedItems = items
    .filter((item) => item.id && item.quantity > 0 && item.price >= 0)
    .map((item) => ({
      id: item.id,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

  if (!normalizedItems.length) {
    return NextResponse.json({ error: "INVALID_ITEMS" }, { status: 400 });
  }

  const total = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total,
      phone,
      address,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "ORDER_CREATE_FAILED", details: orderError?.message ?? null },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    normalizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "ORDER_ITEMS_CREATE_FAILED", details: itemsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
