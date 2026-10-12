const { PrismaClient } = require("@prisma/client");

const REVIEWS = [
  ["Meera S.", 5, "The king bedsheet drapes beautifully. The handblock palms look even better in daylight than in the photos."],
  ["Ananya K.", 5, "Ordered the queen size, 90 by 108. It fits our mattress with a neat drop and the cotton stays soft after two washes."],
  ["Ritika P.", 5, "Chose the elastic fitted option. It hugs the mattress and does not bunch up at the corners."],
  ["Shruti M.", 4, "Deep elastic fitted was worth it for our thicker mattress. The print is crisp and the extra charge felt fair."],
  ["Neha J.", 5, "Flat bedsheet is exactly the traditional drape I wanted. Colours have not bled."],
  ["Pooja R.", 5, "Bought a kids bathrobe for my daughter. The waffle cotton is light and the balloon print is adorable."],
  ["Aisha V.", 5, "Towel quality is excellent. We added a name and it came out neat, not plasticky."],
  ["Kavya N.", 4, "Name customisation on the robe was a lovely gift touch. Took the usual few days and was packed well."],
  ["Isha D.", 5, "The indigo elephants on the robe are charming. My son refuses to wear anything else after a bath."],
  ["Divya G.", 5, "Handblock looks handmade in the best way. Small variations in the print make it feel special."],
  ["Sana Q.", 4, "Queen bedsheet is generous. Percale feels cool at night, which we needed in Jaipur summers."],
  ["Rhea B.", 5, "Waffle towels dry quickly and still feel plush. The chevron border is a nice finish."],
  ["Aditi L.", 5, "We gifted a set of towels. The recipient asked where they were from the same evening."],
  ["Nandini C.", 5, "King 108 by 108 covers our bed properly, including the pillows. No shortfall on the sides."],
  ["Tara H.", 4, "Elastic fitted sits well. I wish the colour options were wider, but this print is already a favourite."],
  ["Mitali E.", 5, "The robe belt and trim are stitched properly. Not the flimsy finish you get from mass brands."],
  ["Lavanya F.", 5, "Ordered two bedsheets, one flat and one deep fitted. Both matched the listing and arrived together."],
  ["Priya A.", 5, "Soft cotton, clear block print, and the shop replied quickly on WhatsApp about sizes."],
  ["Simran K.", 4, "Towel is slightly smaller than I pictured, but the fabric and print make up for it."],
  ["Anjali T.", 5, "Our story on the site matches the product. You can tell these are made with care."],
  ["Harini V.", 5, "Deep fitted sheet stayed on through the night. No more tucking a flat sheet back in."],
  ["Zoya R.", 5, "The kids towel survived a beach weekend and still looks new. Colours held."],
  ["Pallavi S.", 4, "Beautiful quilting on the robe. A little warm for peak summer, perfect otherwise."],
  ["Nikita W.", 5, "Second order already. The queen sheet and a matching towel feel like a small set."],
  ["Aarohi P.", 5, "From the packing to the print, this feels like a proper home label. We will be back for gifting."],
];

async function main() {
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  if (!products.length) {
    console.log("no products");
    await prisma.$disconnect();
    return;
  }
  const existing = await prisma.review.count();
  if (existing >= 25) {
    console.log("reviews already seeded", existing);
    await prisma.$disconnect();
    return;
  }
  const now = Date.now();
  await prisma.review.createMany({
    data: REVIEWS.map(([author, rating, body], i) => ({
      productId: products[i % products.length].id,
      author,
      rating,
      body,
      createdAt: new Date(now - (i + 3) * 36 * 60 * 60 * 1000),
    })),
  });
  console.log("seeded", REVIEWS.length);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
