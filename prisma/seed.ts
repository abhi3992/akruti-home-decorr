import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Sky Voyage Kids Robe",
    slug: "sky-voyage-kids-robe",
    description:
      "Soft waffle cotton wrap robe with airplanes, hot air balloons, and clouds. Contrast geometric trim on collar, cuffs, and pockets.",
    priceInPaise: 189900,
    images: JSON.stringify(["/products/sky-voyage.jpg"]),
    fabric: "Waffle Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 25,
    featured: true,
  },
  {
    name: "Safari Friends Kids Robe",
    slug: "safari-friends-kids-robe",
    description:
      "Playful waffle cotton robe with elephants, giraffes, and cacti — a cheerful hand-print look for everyday loungewear.",
    priceInPaise: 189900,
    images: JSON.stringify(["/products/safari-friends.jpg"]),
    fabric: "Waffle Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 22,
    featured: true,
  },
  {
    name: "Whale Dream Kids Robe",
    slug: "whale-dream-kids-robe",
    description:
      "Dreamy pink whales and crescent moons on absorbent waffle cotton, finished with wavy pink trim.",
    priceInPaise: 179900,
    images: JSON.stringify(["/products/whale-dream.jpg"]),
    fabric: "Waffle Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 20,
    featured: true,
  },
  {
    name: "Jungle Kantha Kids Robe",
    slug: "jungle-kantha-kids-robe",
    description:
      "Quilted kantha-style robe with tigers, birds, and palms. Mustard border trim for a bold artisanal finish.",
    priceInPaise: 219900,
    images: JSON.stringify(["/products/jungle-kantha.jpg"]),
    fabric: "Percale Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 18,
    featured: true,
  },
  {
    name: "Dino Adventure Kids Robe",
    slug: "dino-adventure-kids-robe",
    description:
      "Teal and ochre dinosaurs on waffle cotton with mustard geometric trim — made for little explorers.",
    priceInPaise: 189900,
    images: JSON.stringify(["/products/dino-adventure.jpg"]),
    fabric: "Waffle Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 24,
    featured: false,
  },
  {
    name: "Balloon Sky Kids Robe",
    slug: "balloon-sky-kids-robe",
    description:
      "Bright hot air balloons, clouds, and stars on waffle cotton with sunny yellow trim.",
    priceInPaise: 189900,
    images: JSON.stringify(["/products/balloon-sky.jpg"]),
    fabric: "Waffle Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 21,
    featured: true,
  },
  {
    name: "Indigo Elephant Kids Robe",
    slug: "indigo-elephant-kids-robe",
    description:
      "Royal blue elephants and palm trees on soft waffle cotton — a classic Jaipur-inspired print for kids.",
    priceInPaise: 189900,
    images: JSON.stringify(["/products/indigo-elephant.jpg"]),
    fabric: "Waffle Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 23,
    featured: false,
  },
  {
    name: "Carnival Critters Kids Robe",
    slug: "carnival-critters-kids-robe",
    description:
      "Pink elephants, giraffes, and monkeys on waffle cotton with bright yellow binding.",
    priceInPaise: 189900,
    images: JSON.stringify(["/products/carnival-critters.jpg"]),
    fabric: "Waffle Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 20,
    featured: false,
  },
  {
    name: "Berry Elephant Kantha Robe",
    slug: "berry-elephant-kantha-robe",
    description:
      "Quilted kantha robe with pink elephants, palms, and strawberries. Pink-stripe collar and belt.",
    priceInPaise: 219900,
    images: JSON.stringify(["/products/berry-elephant.jpg"]),
    fabric: "Percale Cotton",
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y"]),
    stock: 16,
    featured: true,
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
