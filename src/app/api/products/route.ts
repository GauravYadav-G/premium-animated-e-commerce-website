import { NextResponse } from "next/server";
import { listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const items = await listProducts({
      category: searchParams.get("category") ?? undefined,
      collection: searchParams.get("collection") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      search: searchParams.get("q") ?? undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
