import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const rows = await p.siteSetting.findMany();
for (const r of rows) {
  const isData = r.value.startsWith("data:");
  console.log(
    r.key,
    "len=" + r.value.length,
    isData ? "DATA_URL" : r.value.slice(0, 100)
  );
}
await p.$disconnect();
