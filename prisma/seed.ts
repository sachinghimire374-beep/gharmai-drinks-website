import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATS: { name: string; slug: string; subs?: string[] }[] = [
  { name: "Whiskey", slug: "whiskey", subs: ["Imported", "Premium", "Local", "Japanese", "Irish", "American"] },
  { name: "Scotch", slug: "scotch", subs: ["Single Malt", "Blended", "Premium", "Limited Edition"] },
  { name: "Wine", slug: "wine", subs: ["Red", "White", "Rose", "Sparkling", "Champagne"] },
  { name: "Beer", slug: "beer", subs: ["Premium", "Craft", "Imported", "Strong", "Lager"] },
  { name: "Vodka", slug: "vodka", subs: ["Premium", "Imported", "Flavored"] },
  { name: "Rum", slug: "rum", subs: ["Dark", "White", "Premium", "Spiced"] },
  { name: "Brandy", slug: "brandy", subs: ["Imported", "Premium", "Local"] },
  { name: "Gin", slug: "gin", subs: ["London Dry", "Craft", "Imported"] },
  { name: "Tequila", slug: "tequila", subs: ["Silver", "Gold", "Reposado", "Anejo"] },
  { name: "Cocktails & RTD", slug: "cocktails", subs: ["Ready to Drink", "Premixed", "Energy Mixers"] },
  { name: "Cigarettes & Mixers", slug: "cigarettes", subs: ["Cigarettes", "Soft Drinks", "Tonic", "Energy", "Ice"] },
  { name: "Food", slug: "food", subs: ["Bar Snacks", "Burger", "Pizza", "BBQ", "Combo"] },
];

const PRODUCTS = [
  { name: "Johnnie Walker Black Label", cat: "whiskey", price: 5500, compareAt: 6000, badge: "PREMIUM", featured: true, img: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600", desc: "12-year aged blended Scotch whisky with a smooth, smoky finish." },
  { name: "Jack Daniel's Old No. 7", cat: "whiskey", price: 4800, badge: "POPULAR", featured: true, img: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600", desc: "Tennessee whiskey, charcoal mellowed, drop by drop." },
  { name: "Old Durbar Reserve", cat: "whiskey", price: 1200, badge: "VALUE", img: "https://images.unsplash.com/photo-1602871301810-6c2cb0db53e4?w=600", desc: "Nepal's premium local whiskey." },
  { name: "Glenfiddich 12yr Single Malt", cat: "scotch", price: 8500, badge: "PREMIUM", featured: true, img: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600", desc: "The world's most awarded single malt Scotch whisky." },
  { name: "Chivas Regal 12yr", cat: "scotch", price: 5200, badge: "POPULAR", img: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600", desc: "Rich, smooth blended Scotch." },
  { name: "Moet & Chandon Imperial", cat: "wine", price: 12000, badge: "LIMITED", featured: true, img: "https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=600", desc: "Iconic champagne, vibrant and elegant." },
  { name: "Sula Vineyards Shiraz", cat: "wine", price: 2200, badge: "NONE", img: "https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?w=600", desc: "Full-bodied Indian red wine." },
  { name: "Tuborg Strong 650ml", cat: "beer", price: 350, badge: "POPULAR", img: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600", desc: "Crisp, strong lager." },
  { name: "Corona Extra 355ml", cat: "beer", price: 550, badge: "PREMIUM", img: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=600", desc: "Mexican pale lager, best with lime." },
  { name: "Absolut Vodka", cat: "vodka", price: 3200, badge: "POPULAR", img: "https://images.unsplash.com/photo-1614963326505-843868e1d83a?w=600", desc: "Swedish premium vodka, exceptionally smooth." },
  { name: "Grey Goose", cat: "vodka", price: 7500, badge: "PREMIUM", img: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=600", desc: "World-class French vodka." },
  { name: "Old Monk 750ml", cat: "rum", price: 1200, badge: "VALUE", img: "https://images.unsplash.com/photo-1598018553943-93a5e4f05489?w=600", desc: "Legendary dark rum with vanilla notes." },
  { name: "Bacardi White Rum", cat: "rum", price: 2500, badge: "POPULAR", img: "https://images.unsplash.com/photo-1574710492105-244a19d93a6f?w=600", desc: "Smooth white rum, perfect for cocktails." },
  { name: "Hennessy VS", cat: "brandy", price: 7000, badge: "PREMIUM", img: "https://images.unsplash.com/photo-1561910087-c2e4f7a3d71d?w=600", desc: "Bold, fragrant cognac." },
  { name: "Bombay Sapphire", cat: "gin", price: 3800, badge: "PREMIUM", img: "https://images.unsplash.com/photo-1605989251086-b2e2e21b71f8?w=600", desc: "London dry gin with 10 botanicals." },
  { name: "Jose Cuervo Silver", cat: "tequila", price: 4500, badge: "POPULAR", img: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=600", desc: "Crisp silver tequila." },
  { name: "Breezer Cranberry", cat: "cocktails", price: 250, badge: "NONE", img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600", desc: "Light, fruity ready-to-drink." },
  { name: "Red Bull Energy 250ml", cat: "cigarettes", price: 200, badge: "NONE", img: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600", desc: "Energy drink mixer." },
  { name: "Ice Pack (2kg)", cat: "cigarettes", price: 100, badge: "VALUE", img: "https://images.unsplash.com/photo-1497534547324-0ebb3f052e88?w=600", desc: "Party essential — keep it chilled." },
  { name: "Classic Chicken Wings", cat: "food", price: 450, badge: "POPULAR", featured: true, img: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600", desc: "Crispy wings with house sauce." },
  { name: "Smash Burger", cat: "food", price: 450, badge: "NONE", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600", desc: "Double patty, cheese, special sauce." },
  { name: "Late Night Food Box", cat: "food", price: 799, badge: "LIMITED", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Wings + fries + momo + dips combo." },
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding Gharmai Drinks…");

  // Admin users (3 roles)
  const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!", 10);
  await prisma.adminUser.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || "admin@gharmaidrinks.com" },
    update: {},
    create: { name: "Super Admin", email: process.env.SEED_ADMIN_EMAIL || "admin@gharmaidrinks.com", password, role: "SUPER_ADMIN" },
  });
  await prisma.adminUser.upsert({
    where: { email: "editor@gharmaidrinks.com" },
    update: {},
    create: { name: "Content Editor", email: "editor@gharmaidrinks.com", password, role: "CONTENT_EDITOR" },
  });
  await prisma.adminUser.upsert({
    where: { email: "orders@gharmaidrinks.com" },
    update: {},
    create: { name: "Order Manager", email: "orders@gharmaidrinks.com", password, role: "ORDER_MANAGER" },
  });

  // Categories
  const catMap: Record<string, string> = {};
  for (const [i, c] of CATS.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug, sortOrder: i },
    });
    catMap[c.slug] = parent.id;
    for (const [j, sub] of (c.subs ?? []).entries()) {
      await prisma.category.upsert({
        where: { slug: `${c.slug}-${slug(sub)}` },
        update: {},
        create: { name: sub, slug: `${c.slug}-${slug(sub)}`, parentId: parent.id, sortOrder: j },
      });
    }
  }

  // Brands (Brand Spotlight)
  const BRANDS = [
    { name: "Johnnie Walker", tagline: "Keep Walking.", accent: "#D4AF37", description: "The world's most iconic Scotch whisky house, striding forward since 1820.", banner: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1200" },
    { name: "Moët & Chandon", tagline: "Be Fabulous.", accent: "#C9A227", description: "The champagne of celebration since 1743 — effervescent French luxury.", banner: "https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=1200" },
    { name: "Hennessy", tagline: "Never Stop. Never Settle.", accent: "#B8860B", description: "The world's best-selling cognac, crafted in France for over 250 years.", banner: "https://images.unsplash.com/photo-1561910087-c2e4f7a3d71d?w=1200" },
    { name: "Glenfiddich", tagline: "Where Next.", accent: "#A67C00", description: "The world's most awarded single malt Scotch whisky from Speyside.", banner: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=1200" },
    { name: "Grey Goose", tagline: "Fly Beyond.", accent: "#9CA3AF", description: "World-class French vodka, distilled from the finest ingredients.", banner: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=1200" },
  ];
  const brandMap: Record<string, string> = {};
  for (const [i, b] of BRANDS.entries()) {
    const brand = await prisma.brand.upsert({
      where: { slug: slug(b.name) },
      update: {},
      create: { name: b.name, slug: slug(b.name), tagline: b.tagline, accent: b.accent, description: b.description, bannerImage: b.banner, linkUrl: "#menu", featured: true, sortOrder: i },
    });
    brandMap[b.name] = brand.id;
  }

  // Which products are luxury / which brand they belong to
  const LUXURY = new Set(["Glenfiddich 12yr Single Malt", "Moet & Chandon Imperial", "Grey Goose", "Hennessy VS", "JW Blue Label", "Chivas Regal 12yr", "Johnnie Walker Black Label"]);
  const PRODUCT_BRAND: Record<string, string> = {
    "Johnnie Walker Black Label": "Johnnie Walker",
    "Glenfiddich 12yr Single Malt": "Glenfiddich",
    "Moet & Chandon Imperial": "Moët & Chandon",
    "Hennessy VS": "Hennessy",
    "Grey Goose": "Grey Goose",
  };

  // Products
  for (const [i, p] of PRODUCTS.entries()) {
    const brandId = PRODUCT_BRAND[p.name] ? brandMap[PRODUCT_BRAND[p.name]] : null;
    await prisma.product.upsert({
      where: { slug: slug(p.name) },
      update: {},
      create: {
        name: p.name,
        slug: slug(p.name),
        description: p.desc,
        price: p.price,
        compareAt: (p as any).compareAt ?? null,
        images: JSON.stringify([p.img]),
        badge: p.badge as any,
        featured: (p as any).featured ?? false,
        luxury: LUXURY.has(p.name),
        brandId,
        sortOrder: i,
        categoryId: catMap[p.cat],
      },
    });
  }

  // Banners / Ads — one per placement to demonstrate the engine
  const now = new Date();
  const inAWeek = new Date(Date.now() + 7 * 86400000);
  const banners = [
    { title: "Hero — Weekend Whiskey Sale", headline: "Weekend Whiskey Sale", subtext: "Up to 20% off premium imports", buttonLabel: "Shop Whiskey", linkUrl: "#menu", placement: "HERO", priority: 10, mediaUrl: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1200" },
    { title: "Top Bar — Flash Sale", headline: "🔥 Flash Sale: Free delivery on all orders till midnight!", placement: "TOP_BAR", priority: 5, endAt: inAWeek },
    { title: "Mid-Page — Party Box Campaign", headline: "Throwing a Party?", subtext: "Build your own party box and save big", buttonLabel: "Build Box", linkUrl: "#specials", placement: "MID_PAGE", mediaUrl: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=1200" },
    { title: "Popup — First Order Offer", headline: "Get 10% Off Your First Order", subtext: "Use code WELCOME10 at checkout", buttonLabel: "Order Now", linkUrl: "#menu", placement: "POPUP", frequency: "once_per_session" },
    { title: "Flash Sale Countdown — Midnight Deal", headline: "Midnight Madness ends soon!", placement: "FLASH_SALE", endAt: new Date(Date.now() + 8 * 3600000) },
  ];
  for (const b of banners) {
    const exists = await prisma.bannerAd.findFirst({ where: { title: b.title } });
    if (!exists) await prisma.bannerAd.create({ data: { ...b, startAt: now } as any });
  }

  // Promotions
  for (const pr of [
    { code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minOrder: 1000 },
    { code: "FREEDEL", description: "Free delivery", type: "FIXED", value: 100, minOrder: 1500 },
    { code: "PARTY500", description: "Rs.500 off orders above Rs.5000", type: "FIXED", value: 500, minOrder: 5000 },
  ]) {
    await prisma.promotion.upsert({ where: { code: pr.code }, update: {}, create: pr as any });
  }

  // Testimonials
  for (const [i, t] of [
    { name: "Rajesh K.", role: "VIP Gold Member", body: "Fastest delivery in Pokhara! Ordered at 11 PM, arrived in 20 minutes.", rating: 5 },
    { name: "Suman P.", role: "Regular Customer", body: "The Late Night Box saved our house party. Everything in one delivery!", rating: 5 },
    { name: "Anita G.", role: "Party Host", body: "Best prices for imported whiskey. The party planner is genius.", rating: 5 },
  ].entries()) {
    const exists = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!exists) await prisma.testimonial.create({ data: { ...t, sortOrder: i } });
  }

  // Sample blog post
  const postExists = await prisma.post.findFirst({ where: { slug: "5-cocktails-for-your-next-house-party" } });
  if (!postExists) {
    await prisma.post.create({
      data: {
        title: "5 Cocktails For Your Next House Party",
        slug: "5-cocktails-for-your-next-house-party",
        excerpt: "Impress your guests with these easy, crowd-pleasing cocktails.",
        body: "<p>Hosting at home? Here are five cocktails anyone can make…</p>",
        coverImage: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200",
        status: "PUBLISHED",
        publishAt: now,
        metaTitle: "5 Easy Cocktails for House Parties | Gharmai Drinks",
        metaDescription: "Easy cocktail recipes for your next party in Pokhara.",
      },
    });
  }

  console.log("✅ Seed complete. Admin: " + (process.env.SEED_ADMIN_EMAIL || "admin@gharmaidrinks.com"));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
