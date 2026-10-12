export const SITE_IMAGES = {
  founderImage: {
    key: "founderImage",
    label: "Founder photo",
    help: "Home + About · Meet the Founder",
    default: "/brand/founder-portrait.jpg",
  },
  heroImage: {
    key: "heroImage",
    label: "Home hero image (desktop)",
    help: "Wide homepage banner — can include brand mark on the right",
    default: "/products/jungle-kantha.jpg",
  },
  heroImageMobile: {
    key: "heroImageMobile",
    label: "Home hero image (phone)",
    help: "Portrait crop for phones — use a clean photo without the large logo overlay",
    default: "/brand/hero-mobile.jpg",
  },
  homeStoryImage: {
    key: "homeStoryImage",
    label: "Home story image",
    help: "Photo beside the Our Story block",
    default: "/products/berry-elephant.jpg",
  },
  logoImage: {
    key: "logoImage",
    label: "Logo",
    help: "Header and footer logo",
    default: "/logo-transparent.png",
  },
} as const;

export type SiteImageKey = keyof typeof SITE_IMAGES;

export type SiteContent = {
  announcement: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  homeStoryEyebrow: string;
  homeStoryTitle: string;
  homeStoryTitleAccent: string;
  homeStoryP1: string;
  homeStoryPull: string;
  homeStoryP2: string;
  founderEyebrow: string;
  founderTitle: string;
  founderTitleAccent: string;
  founderP1: string;
  founderP2: string;
  founderTagline: string;
  ctaTitle: string;
  ctaBody: string;
  aboutIntro: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutTitleAccent: string;
  aboutP1: string;
  aboutPull: string;
  aboutP2: string;
  aboutP3: string;
  aboutP4: string;
  footerTagline: string;
  footerContact: string;
  instagramUrl: string;
  whatsappNumber: string;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  announcement: "Handblock prints · Soft cottons · Made for modern homes",
  heroEyebrow: "Handblock · Cotton · Home",
  heroTitle: "Soft prints for everyday living",
  heroSubtitle:
    "Bedsheets, dohars, quilts, robes and more — crafted with the block printing we grew up with.",
  homeStoryEyebrow: "Our story",
  homeStoryTitle: "Some stories begin with an idea.",
  homeStoryTitleAccent: "Ours began with a craft.",
  homeStoryP1:
    "Long before Akruti Home Decor had a name, Indian block printing was already a part of our lives. Growing up around a printing workshop, we watched this craft up close — and the little imperfections that make every handmade piece different.",
  homeStoryPull: "We grew up loving it.",
  homeStoryP2:
    "With our own printing setup, we create home textiles that celebrate where we come from while fitting beautifully into modern homes.",
  founderEyebrow: "Meet the Founder",
  founderTitle: "A dream rooted in tradition,",
  founderTitleAccent: "shaped by love for the craft.",
  founderP1:
    "Hi, I'm Shruti Koolwal, the founder of Akruti Home Decor. Block printing has always been close to my heart – what started as admiration for Indian craftsmanship became a journey of creating home textiles that bring warmth into everyday spaces.",
  founderP2:
    "We have been in this business for over 7 years, working closely with skilled artisans. With Akruti, we celebrate textile heritage through pieces that feel effortless, authentic and made for modern homes.",
  founderTagline: "Tradition lives on",
  ctaTitle: "Celebrate everyday living",
  ctaBody:
    "From handblock bedsheets and dohars to quilts, towels, bathrobes and thoughtful gifting — every collection begins with love for fabric, print and the hands behind it.",
  aboutIntro:
    "Made with the craft we grew up with. Designed for the homes we live in today.",
  aboutEyebrow: "The beginning",
  aboutTitle: "Some stories begin with an idea.",
  aboutTitleAccent: "Ours began with a craft.",
  aboutP1:
    "Long before Akruti Home Decor had a name, Indian block printing was already a part of our lives. Growing up around a printing workshop, we watched this craft up close — the sound of a wooden block meeting fabric, the rhythm of repeated impressions, the hands that carefully align each print, and the little imperfections that make every handmade piece different.",
  aboutPull: "We grew up loving it.",
  aboutP2:
    "Over the years, that love became a passion — and eventually, a vision to bring the beauty we had known since childhood into homes in a way that feels fresh, effortless and contemporary. With our own printing setup and a deep connection to the craft, we create home textiles that celebrate where we come from while fitting beautifully into the way we live today.",
  aboutP3:
    "From handblock bedsheets and dohars to quilts, towels, bathrobes, table linen and thoughtful gifting, every collection begins with the same feeling — a love for fabric, print and the hands behind it.",
  aboutP4:
    "This is Akruti. A little piece of our childhood, our craft, and our passion — brought into your home.",
  footerTagline:
    "Made with the craft we grew up with. Designed for the homes we live in today.",
  footerContact:
    "For orders & wholesale enquiries, message us on WhatsApp or Instagram.",
  instagramUrl: "https://www.instagram.com/akrutihandblockmanufacturer/",
  whatsappNumber: "+919351088793",
};

export const CONTENT_KEY = "siteContent";
