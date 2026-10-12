const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.order.findMany({
  orderBy: { createdAt: "desc" },
  take: 5,
  include: { items: true },
}).then((o) => {
  console.log(JSON.stringify(o.map((x) => ({
    id: x.id,
    name: x.customerName,
    email: x.customerEmail,
    phone: x.customerPhone,
    status: x.status,
    total: x.totalInPaise,
    items: x.items.length,
    at: x.createdAt,
  })), null, 2));
  return p.$disconnect();
}).catch((e) => { console.error(e); process.exit(1); });
