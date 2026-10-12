const { PrismaClient } = require("@prisma/client");

const TOTAL = 15;
const IMAGES = {
  "bageecha-bloom-percale-cotton-handblock-king-bedsheet": "/reviews/bageecha-bloom.png",
  "king-bedsheet-with-2-pillow-covers": "/reviews/tropical-blue-palm.png",
  "unicorn-block-printed-kids-waffle-towel": "/reviews/unicorn-towel.png",
};

async function main() {
  const prisma = new PrismaClient();
  const real = await prisma.review.findMany({
    where: { orderId: { not: null } },
    select: { id: true },
  });
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
  const photoFirst = [
    ...products.filter((product) => IMAGES[product.slug]),
    ...products.filter((product) => !IMAGES[product.slug]),
  ];

  const keep = real.map((review) => review.id);
  const pictured = [];
  for (const product of photoFirst) {
    if (keep.length >= TOTAL) break;
    const review = await prisma.review.findFirst({
      where: { productId: product.id, orderId: null, id: { notIn: keep } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (!review) continue;
    keep.push(review.id);
    if (IMAGES[product.slug]) pictured.push({ id: review.id, image: IMAGES[product.slug], name: product.name });
  }

  await prisma.review.updateMany({ data: { image: "" } });
  for (const row of pictured) {
    await prisma.review.update({
      where: { id: row.id },
      data: { image: row.image },
    });
    console.log("photo", row.name);
  }

  const removed = await prisma.review.deleteMany({
    where: { id: { notIn: keep } },
  });
  const left = await prisma.review.count();
  console.log("removed", removed.count, "remaining", left);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
