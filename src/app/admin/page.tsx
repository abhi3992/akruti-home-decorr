import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  await clearAdminSession();
  redirect("/admin/login");
}

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [products, orders] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { items: true },
    }),
  ]);

  async function updateStock(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin/login");
    const id = String(formData.get("id"));
    const stock = Number(formData.get("stock"));
    const featured = formData.get("featured") === "on";
    const priceInPaise = Math.round(Number(formData.get("price")) * 100);
    await prisma.product.update({
      where: { id },
      data: { stock, featured, priceInPaise },
    });
    redirect("/admin");
  }

  async function markShipped(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin/login");
    const id = String(formData.get("id"));
    await prisma.order.update({
      where: { id },
      data: { status: "shipped" },
    });
    redirect("/admin");
  }

  async function createProduct(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin/login");
    const name = String(formData.get("name") || "");
    const slug = String(formData.get("slug") || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const description = String(formData.get("description") || "");
    const priceInPaise = Math.round(Number(formData.get("price")) * 100);
    const fabric = String(formData.get("fabric") || "Waffle Cotton");
    const image = String(formData.get("image") || "/products/sky-voyage.png");
    const stock = Number(formData.get("stock") || 10);
    await prisma.product.create({
      data: {
        name,
        slug,
        description,
        priceInPaise,
        fabric,
        images: JSON.stringify([image]),
        sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
        stock,
        featured: formData.get("featured") === "on",
      },
    });
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Admin
        </h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-[var(--ink)]/60">
            Log out
          </button>
        </form>
      </div>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Products
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--ink)]/15 text-[var(--ink)]/50">
              <tr>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Price (₹)</th>
                <th className="py-2 font-medium">Stock</th>
                <th className="py-2 font-medium">Featured</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--ink)]/10">
                  <td className="py-3">
                    <Link
                      href={`/product/${p.slug}`}
                      className="hover:text-[var(--ochre)]"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-3" colSpan={4}>
                    <form
                      action={updateStock}
                      className="flex flex-wrap items-center gap-3"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        name="price"
                        type="number"
                        step="1"
                        defaultValue={p.priceInPaise / 100}
                        className="w-24 border border-[var(--ink)]/20 px-2 py-1"
                      />
                      <input
                        name="stock"
                        type="number"
                        defaultValue={p.stock}
                        className="w-20 border border-[var(--ink)]/20 px-2 py-1"
                      />
                      <label className="flex items-center gap-1.5 text-xs">
                        <input
                          type="checkbox"
                          name="featured"
                          defaultChecked={p.featured}
                        />
                        Featured
                      </label>
                      <button
                        type="submit"
                        className="text-xs text-[var(--ochre)]"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Add product
        </h2>
        <form
          action={createProduct}
          className="mt-6 grid max-w-xl gap-3 text-sm"
        >
          <input
            name="name"
            required
            placeholder="Name"
            className="border border-[var(--ink)]/20 px-3 py-2"
          />
          <input
            name="slug"
            required
            placeholder="slug-like-this"
            className="border border-[var(--ink)]/20 px-3 py-2"
          />
          <textarea
            name="description"
            required
            placeholder="Description"
            rows={3}
            className="border border-[var(--ink)]/20 px-3 py-2"
          />
          <input
            name="price"
            type="number"
            required
            placeholder="Price INR"
            className="border border-[var(--ink)]/20 px-3 py-2"
          />
          <input
            name="fabric"
            defaultValue="Waffle Cotton"
            className="border border-[var(--ink)]/20 px-3 py-2"
          />
          <input
            name="image"
            defaultValue="/products/sky-voyage.png"
            placeholder="Image path"
            className="border border-[var(--ink)]/20 px-3 py-2"
          />
          <input
            name="stock"
            type="number"
            defaultValue={10}
            className="border border-[var(--ink)]/20 px-3 py-2"
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" /> Featured
          </label>
          <button
            type="submit"
            className="bg-[var(--ink)] py-2.5 text-white"
          >
            Create product
          </button>
        </form>
      </section>

      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Recent orders
        </h2>
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="border border-[var(--ink)]/10 p-4 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-[var(--ink)]/60">
                    {o.customerEmail} · {formatINR(o.totalInPaise)} ·{" "}
                    {o.status}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink)]/50">
                    {o.items.length} item(s) · {o.city}, {o.pincode}
                  </p>
                </div>
                {o.status !== "shipped" && (
                  <form action={markShipped}>
                    <input type="hidden" name="id" value={o.id} />
                    <button
                      type="submit"
                      className="text-xs text-[var(--ochre)]"
                    >
                      Mark shipped
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
          {orders.length === 0 && (
            <p className="text-[var(--ink)]/50">No orders yet.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
