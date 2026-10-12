const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.product
  .findMany({
    where: { active: true },
    select: { id: true, name: true, slug: true, category: true, fabric: true },
    orderBy: { name: "asc" },
  })
  .then((rows) => {
    console.log(JSON.stringify(rows, null, 2));
    console.log("count", rows.length);
  })
  .finally(() => p.$disconnect());
