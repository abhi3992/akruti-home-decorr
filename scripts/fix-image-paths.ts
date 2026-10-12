import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  for (const prod of products) {
    const images = prod.images.replaceAll(".png", ".jpg");
    if (images !== prod.images) {
      await prisma.product.update({
        where: { id: prod.id },
        data: { images },
      });
      console.log("updated", prod.slug);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
