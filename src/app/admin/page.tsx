import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatINR, productImages } from "@/lib/utils";
import { getSiteImages, getSiteContent, SITE_IMAGES } from "@/lib/site-settings";
import { AddProductForm } from "@/components/AddProductForm";
import { EditProductForm } from "@/components/EditProductForm";
import { SiteImageUploader } from "@/components/SiteImageUploader";
import { SiteContentForm } from "@/components/SiteContentForm";
import { AdminTabs } from "@/components/AdminTabs";
import { RestoreProductButton } from "@/components/RestoreProductButton";
import { ShipOrderForm } from "@/components/ShipOrderForm";
import type { SiteImageKey } from "@/lib/site-content";
import { displayOrderRef } from "@/lib/order-number";
import { sendShippedEmail } from "@/lib/notify";
import { formatLineLabel } from "@/lib/name-print";
import { CatalogManager } from "@/components/CatalogManager";
import { TrafficInsights } from "@/components/TrafficInsights";
import { PruneBlobsButton } from "@/components/PruneBlobsButton";
import { getCatalog, categoryLabelFromCatalog, subcategoryLabel } from "@/lib/catalog";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  await clearAdminSession();
  redirect("/admin/login");
}

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [products, orders, images, content, catalog] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { items: { include: { product: true } } },
    }),
    getSiteImages(),
    getSiteContent(),
    getCatalog(),
  ]);

  async function shareTracking(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin/login");
    const id = String(formData.get("id") || "");
    const trackingId = String(formData.get("trackingId") || "").trim();
    const trackingUrl = String(formData.get("trackingUrl") || "").trim();
    if (!id || !trackingId || !trackingUrl) redirect("/admin");

    const updated = await prisma.order.update({
      where: { id },
      data: {
        trackingId,
        trackingUrl,
        status: "shipped",
        shippedAt: new Date(),
      },
      include: { items: { include: { product: true } } },
    });

    await sendShippedEmail(
      updated,
      updated.items.map((item) =>
        formatLineLabel({
          name: item.product?.name || "Product",
          size: item.size,
          quantity: item.quantity,
          customName: item.customName,
          sheetFit: item.sheetFit,
          mattress: item.mattress,
        })
      )
    );

    redirect("/admin");
  }

  const imageKeys = Object.keys(SITE_IMAGES) as SiteImageKey[];
  const traffic = <TrafficInsights />;

  const site = (
    <>
      <section>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Site images
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Upload or replace any image used across the website. Replaced photos
          are deleted from storage. Unused leftovers can be cleared here.
        </p>
        <PruneBlobsButton />
        <div className="mt-6 grid gap-4">
          {imageKeys.map((id) => {
            const meta = SITE_IMAGES[id];
            return (
              <SiteImageUploader
                key={id}
                settingKey={meta.key}
                label={meta.label}
                help={meta.help}
                currentUrl={images[id]}
              />
            );
          })}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Site text
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Announcement bar, homepage, About page, founder section, and footer.
        </p>
        <SiteContentForm initial={content} />
      </section>
    </>
  );

  const productsPanel = (
    <>
      <CatalogManager initial={catalog} />
      <section>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Products
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Edit details or remove from shop. Listings in past orders are hidden
          (not erased).
        </p>
        <ul className="mt-6 space-y-6">
          {products.map((p) => {
            const imgs = productImages(p.images);
            return (
              <li
                key={p.id}
                className="border border-[var(--line)] bg-[var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/product/${p.slug}`}
                      className="font-medium hover:text-[var(--accent)]"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatINR(p.priceInPaise)} · {categoryLabelFromCatalog(catalog, p.category)}
                      {p.subcategory
                        ? ` · ${subcategoryLabel(catalog, p.category, p.subcategory)}`
                        : ""}{" "}
                      ·
                      stock {p.stock}
                      {p.featured ? " · featured" : ""}
                      {!p.active ? " · hidden from shop" : ""}
                      {imgs.length > 0
                        ? ` · ${imgs.length} photo${imgs.length > 1 ? "s" : ""}`
                        : ""}
                    </p>
                  </div>
                  {!p.active && <RestoreProductButton id={p.id} />}
                </div>
                <EditProductForm
                  catalog={catalog}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    priceInPaise: p.priceInPaise,
                    fabric: p.fabric,
                    sizes: p.sizes,
                    category: p.category,
                    subcategory: p.subcategory,
                    stock: p.stock,
                    featured: p.featured,
                    images: imgs,
                  }}
                />
              </li>
            );
          })}
          {products.length === 0 && (
            <p className="text-[var(--muted)]">No products yet.</p>
          )}
        </ul>
      </section>
      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Add product
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Upload one or more photos (up to 5MB each), then save the product.
        </p>
        <AddProductForm catalog={catalog} />
      </section>
    </>
  );

  const ordersPanel = (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Recent orders
      </h2>
      <ul className="mt-6 space-y-4">
        {orders.map((o) => (
          <li
            key={o.id}
            className="border border-[var(--line)] bg-[var(--surface)] p-4 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium tracking-wide text-[var(--accent)]">
                  {displayOrderRef(o)}
                </p>
                <p className="mt-1 font-medium">
                  {o.customerName}{" "}
                  <span className="font-normal text-[var(--muted)]">
                    · {formatINR(o.totalInPaise)} ·{" "}
                    {o.status.replace(/_/g, " ")}
                  </span>
                </p>
                <p className="mt-1 text-[var(--muted)]">
                  <a
                    href={`tel:${o.customerPhone}`}
                    className="hover:text-[var(--accent)]"
                  >
                    {o.customerPhone}
                  </a>
                  {" · "}
                  <a
                    href={`mailto:${o.customerEmail}`}
                    className="hover:text-[var(--accent)]"
                  >
                    {o.customerEmail}
                  </a>
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {o.addressLine1}
                  {o.addressLine2 ? `, ${o.addressLine2}` : ""}, {o.city},{" "}
                  {o.state} {o.pincode}
                </p>
                <ul className="mt-2 space-y-0.5 text-xs text-[var(--muted)]">
                  {o.items.map((item) => (
                    <li key={item.id}>
                      {item.product?.name || "Product"} · {item.size}
                      {item.sheetFit === "elastic"
                        ? " · Elastic fitted"
                        : item.sheetFit === "deep"
                          ? " · Deep Elastic Fitted"
                          : item.sheetFit === "flat"
                            ? " · Flat bedsheet"
                            : ""}
                      {item.mattress ? ` · Mattress ${item.mattress}` : ""}
                      {item.customName
                        ? ` · Name: “${item.customName}”`
                        : ""}{" "}
                      × {item.quantity} ·{" "}
                      {formatINR(item.unitPricePaise * item.quantity)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] text-[var(--muted)]">
                  {o.createdAt.toLocaleString("en-IN")}
                </p>
                {o.trackingId || o.trackingUrl ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Tracking:{" "}
                    <span className="text-[var(--ink)]">{o.trackingId}</span>
                    {o.trackingUrl ? (
                      <>
                        {" · "}
                        <a
                          href={o.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          Open link
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
                <ShipOrderForm
                  orderId={o.id}
                  shareAction={shareTracking}
                  initialTrackingId={o.trackingId || ""}
                  initialTrackingUrl={o.trackingUrl || ""}
                  alreadyShipped={o.status === "shipped"}
                />
              </div>
            </div>
          </li>
        ))}
        {orders.length === 0 && (
          <p className="text-[var(--muted)]">No orders yet.</p>
        )}
      </ul>
    </section>
  );

  return (
    <div className="container-x pb-20 pt-10 md:pt-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="section-title">Admin</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-[var(--muted)]">
            Log out
          </button>
        </form>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
        Traffic, site content, products, and orders — all in one place.
      </p>
      <AdminTabs
        traffic={traffic}
        site={site}
        products={productsPanel}
        orders={ordersPanel}
      />
    </div>
  );
}
