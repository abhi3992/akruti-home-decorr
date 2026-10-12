const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const cats = await p.product.groupBy({ by: ["category"], _count: true });
  console.log("categories", cats);
  const prods = await p.product.findMany({
    select: { name: true, category: true },
    orderBy: { name: "asc" },
  });
  console.log(prods);
  const seq = await p.siteSetting.findMany({
    where: { key: { startsWith: "orderSeq" } },
  });
  console.log("seq", seq);
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
