const { PrismaClient } = require("@prisma/client");

const FIRST = [
  "Aarohi", "Aditi", "Aisha", "Ananya", "Anjali", "Bhavna", "Chhavi", "Deepa",
  "Divya", "Esha", "Fatima", "Gauri", "Harini", "Ishita", "Juhi", "Kavya",
  "Lavanya", "Meera", "Nandini", "Ojasvi", "Pallavi", "Qurat", "Rhea", "Sana",
  "Tara", "Urvi", "Vani", "Yashika", "Zoya", "Nikita", "Priya", "Simran",
  "Ritika", "Pooja", "Neha", "Shreya", "Mitali", "Ira", "Kiara", "Myra",
  "Ayaan", "Dev", "Kabir", "Arjun", "Rohan", "Vivaan", "Ishaan", "Reyansh",
  "Aman", "Farhan", "Harsh", "Kunal", "Manav", "Nikhil", "Omkar", "Parth",
  "Rahul", "Samar", "Tejas", "Yash", "Zaid", "Leela", "Inaya", "Saira",
];
const LAST = [
  "Sharma", "Kapoor", "Iyer", "Reddy", "Joshi", "Malhotra", "Nair", "Banerjee",
  "Khanna", "Desai", "Gill", "Mehta", "Rao", "Chopra", "Bose", "Kulkarni",
  "Saxena", "Patel", "Agarwal", "Menon", "Bhatt", "Chawla", "Dutta", "Fernandes",
  "Goswami", "Hegde", "Iqbal", "Jain", "Kaur", "Lobo", "Mukherjee", "Naidu",
  "Oberoi", "Pillai", "Qureshi", "Rastogi", "Shetty", "Trivedi", "Uppal",
  "Verma", "Wadhwa", "Xavier", "Yadav", "Zachariah", "Ansari", "Bajaj",
  "Choudhary", "D'Souza", "Eapen", "Fadnavis", "Gokhale", "Hans", "Inamdar",
  "Jacob", "Khatri", "Luthra", "Mistry", "Narayan", "Oswal", "Puri", "Quadri",
  "Rathore", "Sarin", "Tiwari", "Unnikrishnan", "Varghese", "Walia", "Yusuf",
  "Zaveri", "Ahuja", "Bedi", "Chandra", "Dalal", "Engineer", "Gupta", "Hooda",
  "Ismail", "Jadeja", "Kohli", "Lalwani", "Mathur", "Nambiar", "Ojha", "Parekh",
  "Qadri", "Rehman", "Sethi", "Talwar", "Usmani", "Vohra", "Warrier", "Biswas",
  "Zaman", "Apte", "Basu", "Chakraborty", "Dewan", "Garg", "Halder", "Irani",
  "Jhaveri", "Kamath", "Lamba", "Modi", "Nanda", "Pant", "Rawat", "Sood",
  "Thakur", "Vyas", "Waseem", "Arora", "Bansal", "Chadha", "Dhawan", "Grover",
  "Habib", "Shah", "Makhija", "Narang", "Pawar", "Sengupta", "Tandon",
  "Acharya", "Bhatia", "Chhabra", "Dhingra", "Goyal", "Haksar", "Kamble",
  "Mahajan", "Nayak", "Prasad", "Rajan", "Suri", "Thomas", "Venkatesh",
  "Ahluwalia", "Barua", "Coutinho", "Dey", "Gavaskar", "Haldar", "Khan",
  "Mishra", "Natarajan", "Purohit", "Roy", "Subramanian", "Taneja", "Varma",
];

function authorFor(pIndex, i) {
  const first = FIRST[(pIndex * 5 + i) % FIRST.length];
  const last = LAST[(pIndex * 20 + i) % LAST.length];
  return `${first} ${last}`;
}

const uniqueLast = new Set(LAST);
if (uniqueLast.size !== LAST.length) {
  throw new Error(`Duplicate surnames: ${LAST.length - uniqueLast.size}`);
}

function kindOf(name) {
  const n = name.toLowerCase();
  if (n.includes("bedsheet")) return "bedsheet";
  if (n.includes("bathrobe") || n.includes("robe")) return "robe";
  if (n.includes("quilt")) return "quilt";
  if (n.includes("dohar")) return "dohar";
  return "towel";
}

function lines(kind) {
  const bed = [
    `It covers our king mattress with room to spare, and the two pillow covers match the print exactly.`,
    `Ordered it in queen, 90 by 108. The drop looks neat and the percale stays cool.`,
    `It arrived folded carefully. The handblock is crisp, not a flat digital print.`,
    `We took the flat option. It drapes the way a traditional sheet should.`,
    `The elastic fitted sheet stays put. Worth the extra for a mattress that shifts.`,
    `The deep fitted sheet works on our thicker mattress. Corners do not pop off.`,
    `Washed it twice on a gentle cycle. The indigo and floral tones have not bled.`,
    `The pillow covers are a proper size, not the skimpy ones you get online.`,
    `It feels like real percale — smooth, not slippery, and it gets softer.`,
    `Gifted it to my sister. She asked for the same print in another size.`,
    `You can see the block edges. That slight variation is what I wanted.`,
    `It photographs well but looks even better on the bed in morning light.`,
    `King 108 by 108 finally fits our bed without a short side.`,
    `Packing was simple and clean. No plastic smell on the cotton.`,
    `The jaal and floral work is balanced. Not too busy for a bedroom.`,
    `We use it as the top sheet. Guests always ask where it is from.`,
    `It survived a hot week in Jaipur and still looked pressed.`,
    `The colour matches the listing. No surprise beige-instead-of-blue.`,
    `Stitching on the pillow covers is straight. Small thing, but it shows.`,
    `This is the second one already, because the first became the bed everyone wants.`,
  ];
  const robe = [
    `It is the one my child asks for after every bath. Waffle cotton is light, not scratchy.`,
    `The block print is bright without looking cheap. Belt and trim are stitched well.`,
    `We added a name. It came out neat, like it belonged on the robe.`,
    `It dries quickly and still feels soft the next morning.`,
    `Sized it for a five-year-old and the length is right — not a grown-up robe cut down.`,
    `The pockets and belt actually stay tied. That was my worry.`,
    `It survived a weekend at my parents' and came home still cheerful.`,
    `The print did not crack after a gentle wash. Colours stayed put.`,
    `Bought it as a birthday gift. The child wore it out of the packet.`,
    `It is warm enough for the AC without being heavy for summer evenings.`,
    `You can tell it is block printed. The animals and motifs are not blurry.`,
    `Hood and cuffs are finished properly. No loose threads.`,
    `It replaced a store robe that pilled in a month. This one has not.`,
    `My niece calls it her special robe. That is the review, really.`,
    `The waffle weave is even. It does not feel thin at the seams.`,
    `It packs small for travel and still looks like a proper robe when worn.`,
    `We ordered two sizes for siblings. Both prints matched the photos.`,
    `Name customisation made it feel personal without looking stuck on.`,
    `It is easy to wash at home. No special dry-clean instruction needed.`,
    `If you are buying one kids robe, make it this one. The print is the reason.`,
  ];
  const towel = [
    `It is the towel that stays on the hook. The waffle cotton dries fast and feels plush.`,
    `The block print is clear even after a few washes. No faded cartoon look.`,
    `We had a name printed on it. It sits neatly and did not stiffen the cotton.`,
    `It is a good kids size — big enough to wrap, not a bath sheet they trip on.`,
    `The border is straight and the print is centred. That matters on a towel.`,
    `It came out of the wash soft. I was worried waffle would go crunchy.`,
    `Gifted it with a robe. They look like a set even though I ordered them apart.`,
    `The colours are the same as the photo. The balloons and cars actually look hand printed.`,
    `It does not shed lint on dark clothes. A small relief.`,
    `My son picks it over plain towels. The print does the convincing.`,
    `Edge stitching has held. No fray after playground and bath.`,
    `It is light enough for a school bag and still absorbs properly.`,
    `We keep it for guests' children. It always gets a comment.`,
    `The cotton feels like a workshop piece, not a printed polyester blend.`,
    `It dried on the line in an afternoon. Useful in humid weeks.`,
    `The name is readable and not huge. Exactly what I asked for.`,
    `Bought it in two prints. Both are equally well finished.`,
    `It has become the beach towel because the print still looks new.`,
    `You can see the block repeats. I like that it is not perfectly machine-flat.`,
    `If the rest of the bath towels were like this, I would replace the lot.`,
  ];
  const quilt = [
    `It is light enough for a baby nap and still has a proper handblock face.`,
    `The mul cotton breathes. We use it in the afternoon without the baby getting sweaty.`,
    `The quilting is even. No lumpy pockets of filling.`,
    `It folds small into the crib drawer and shakes out without deep creases.`,
    `The print is gentle, not a loud cartoon. It suits a nursery.`,
    `Washed it on cold. The mul cotton stayed soft and the print did not run.`,
    `It is the quilt we take to my mother's house. It packs flat.`,
    `Stitch lines are straight. You can tell someone finished it carefully.`,
    `Our baby sleeps under it with the fan on. Weight is just right.`,
    `It looks like the photo, including the small motifs near the edge.`,
    `I was unsure about mul cotton. This one convinced me — airy, not flimsy.`,
    `It makes a sweet gift for a newborn. The print is the talking point.`,
    `No loose threads after two weeks of daily use.`,
    `The backing is as soft as the printed side.`,
    `It survived a spill and a gentle wash. Colour stayed.`,
    `We layer it over a dohar on cooler nights. They work together.`,
    `The block print has that slight handmade shift. I prefer it.`,
    `It is easy to tell apart from plain shop quilts. The cotton smells clean, not chemical.`,
    `Hung it as a nursery throw for a day. It looks as good off the bed.`,
    `Would order it again for a cousin's baby. The size is practical.`,
  ];
  const dohar = [
    `It is the light layer we needed. Mul cotton, handblock, and not too warm.`,
    `The print is clear and the dohar drapes instead of sitting stiff.`,
    `It is perfect over a baby during an AC nap. Breathable, not bulky.`,
    `Washed it once. It came out softer and the colours held.`,
    `The edges are bound neatly. No wavy border.`,
    `It folds into a small square for the nappy bag.`,
    `We use it in the pram. The print gets smiles and the cotton stays cool.`,
    `It does not pill. I checked after a week of daily use.`,
    `The motifs match the listing. No cropped-off print at the hem.`,
    `It feels like a summer dohar should — airy mul, not a heavy quilt pretending.`,
    `Gifted it at a naming ceremony. It was the present people touched first.`,
    `Stitching inside does not poke through. Important for a baby layer.`,
    `It dried quickly on the balcony line.`,
    `You can see it is block printed. There is a slight ink depth.`,
    `Our toddler kicks covers off. It is light enough that it is not a fight.`,
    `It pairs with the quilt from the same print family. They look intentional.`,
    `No chemical smell when we opened it. Just cotton.`,
    `The size covers a baby mattress with a little tuck.`,
    `I ordered it after seeing the robe. Same care in the print.`,
    `It is now the default afternoon cover. Plain blankets stay in the cupboard.`,
  ];
  if (kind === "bedsheet") return bed;
  if (kind === "robe") return robe;
  if (kind === "quilt") return quilt;
  if (kind === "dohar") return dohar;
  return towel;
}

async function main() {
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  let updated = 0;
  for (let pIndex = 0; pIndex < products.length; pIndex++) {
    const product = products[pIndex];
    const existing = await prisma.review.findMany({
      where: { productId: product.id, orderId: null },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    for (let i = 0; i < existing.length; i++) {
      await prisma.review.update({
        where: { id: existing[i].id },
        data: { author: authorFor(pIndex, i) },
      });
      updated += 1;
    }
  }
  const sample = [];
  for (let i = 0; i < 40; i++) sample.push(authorFor(0, i % 20));
  const surnames = new Set(sample.map((n) => n.split(" ").slice(-1)[0]));
  console.log("updated", updated, "surnames in first 40", surnames.size);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
