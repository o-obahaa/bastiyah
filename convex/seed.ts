import { mutation } from "./_generated/server";

export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingStores = await ctx.db.query("stores").first();
    if (existingStores) {
      return { status: "already_seeded", message: "Database already contains stores." };
    }

    // 1. Seed Panda Store
    const pandaId = await ctx.db.insert("stores", {
      slug: "panda",
      name: "Panda Store",
      nameAr: "متجر باندا",
      tagline: "Next-Generation Minimalist Tech & Ergonomics",
      taglineAr: "تقنيات الجيل القادم وإلكترونيات بتصميم عصري",
      description: "Curated modern workspace essentials, premium audio, and lifestyle gear.",
      descriptionAr: "مجموعة مختارة من أساسيات بيئة العمل الحديثة، الصوتيات الراقية، والإلكترونيات.",
      category: "Electronics & Minimal Tech",
      categoryAr: "إلكترونيات وتقنية عصرية",
      ownerName: "Tariq Al-Harbi",
      ownerEmail: "tariq@pandastore.com",
      status: "active",
      plan: "Enterprise",
      createdAt: "2026-01-10T09:00:00Z",
      design: {
        themeColor: "emerald",
        layoutStyle: "modern-split",
        logoEmoji: "🐼",
        headerStyle: "light",
        cardRadius: "rounded",
        heroBannerUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&q=80",
      },
      settings: {
        storeName: "Panda Store",
        supportEmail: "contact@pandastore.com",
        currency: "$",
        freeShippingThreshold: 99,
        standardShippingFee: 9.99,
        taxRate: 0.085,
      },
    });

    // 2. Seed Royal Oud Store
    await ctx.db.insert("stores", {
      slug: "royal-oud",
      name: "Royal Oud & Perfumes",
      nameAr: "دار العود الملكي",
      tagline: "Artisanal Arabian Oud & High Perfumery",
      taglineAr: "عطور شرقية ملكية وأخشاب العود النادرة المعتقة",
      description: "Finest natural Dehn Al Oud, Cambodian wood, and luxury niche oriental blends.",
      descriptionAr: "أجود أنواع دهن العود الطبيعي والعود الكمبودي وخلاصات المسك والورد الطائفي الفاخر.",
      category: "Luxury Fragrances & Oud",
      categoryAr: "عطور راقية وعود فاخر",
      ownerName: "Abdulrahman Al-Dosari",
      ownerEmail: "oud@bastiyah.com",
      status: "active",
      plan: "Growth",
      createdAt: "2026-02-01T10:00:00Z",
      design: {
        themeColor: "amber",
        layoutStyle: "luxury-centered",
        logoEmoji: "👑",
        headerStyle: "dark",
        cardRadius: "rounded",
        heroBannerUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1600&q=80",
      },
      settings: {
        storeName: "Royal Oud & Perfumes",
        supportEmail: "support@royaloud.bastiyah.com",
        currency: "SAR",
        freeShippingThreshold: 350,
        standardShippingFee: 35,
        taxRate: 0.15,
      },
    });

    // 3. Seed Velvet Couture Store
    await ctx.db.insert("stores", {
      slug: "velvet",
      name: "Velvet Couture",
      nameAr: "ڤيلڤيت كوتور للأزياء",
      tagline: "Timeless Parisian Minimalism & Modern Tailoring",
      taglineAr: "أزياء عصرية وأناقة باريسية خالدة بتفاصيل متقنة",
      description: "High-end contemporary wardrobe staples, Italian silk scarves, and leather footwear.",
      descriptionAr: "قطع راقية مختارة بعناية من الصوف الإيطالي والحرير الطبيعي بتصاميم استثنائية.",
      category: "Fashion & Luxury Apparel",
      categoryAr: "أزياء ومقتنيات فاخرة",
      ownerName: "Layan Al-Saud",
      ownerEmail: "layan@velvetcouture.com",
      status: "active",
      plan: "Starter",
      createdAt: "2026-03-01T14:30:00Z",
      design: {
        themeColor: "rose",
        layoutStyle: "minimal-editorial",
        logoEmoji: "✨",
        headerStyle: "light",
        cardRadius: "pill",
        heroBannerUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
      },
      settings: {
        storeName: "Velvet Couture",
        supportEmail: "contact@velvet.bastiyah.com",
        currency: "$",
        freeShippingThreshold: 150,
        standardShippingFee: 15,
        taxRate: 0.05,
      },
    });

    // Seed products for Panda
    await ctx.db.insert("products", {
      storeId: "panda",
      name: "Aura Studio Wireless ANC Headphones",
      nameAr: "سماعات أورا ستوديو اللاسلكية العازلة للضوضاء",
      tagline: "Precision acoustic engineering with 40-hour hybrid active noise cancellation.",
      taglineAr: "هندسة صوتية فائقة الدقة مع عزل ضوضاء هجين يدوم حتى 40 ساعة متواصلة.",
      description: "Immerse yourself in pristine sonic fidelity with custom 40mm titanium drivers, ultra-soft memory foam earcups, multi-point Bluetooth 5.4 connectivity, and crystal-clear spatial audio.",
      descriptionAr: "استمتع بنقاء صوتي لا يضاهى مع مكبرات صوت تيتانيوم مقاس 40 مم، وسادات أذن ميموري فوم مريحة، وتقنية بلوتوث 5.4.",
      price: 249,
      originalPrice: 299,
      category: "Audio & Sound",
      rating: 4.9,
      reviewCount: 342,
      stock: 24,
      badge: "Best Seller",
      featured: true,
      tags: ["Wireless", "Noise Cancelling", "Audiophile"],
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80",
      ],
      createdAt: "2026-01-15T08:00:00Z",
    });

    await ctx.db.insert("products", {
      storeId: "panda",
      name: "Chronos V4 Titanium Smartwatch",
      nameAr: "ساعة كرونوس V4 تيتانيوم الذكية",
      tagline: "Aerospace-grade titanium chassis with dual-band GPS & biometric tracking.",
      taglineAr: "هيكل مصنوع من تيتانيوم الطيران مع نظام GPS ثنائي النطاق وتتبع حيوي.",
      description: "Engineered for athletes and creators alike. Features an edge-to-edge sapphire AMOLED display, 100m water resistance, and 14-day battery reserve.",
      descriptionAr: "مصممة للرياضيين والمبدعين. شاشة أموليد من كريستال الياقوت، مقاومة ماء حتى 100 متر، وبطارية 14 يوماً.",
      price: 349,
      originalPrice: 399,
      category: "Wearables & Tech",
      rating: 4.8,
      reviewCount: 189,
      stock: 18,
      badge: "New Arrival",
      featured: true,
      tags: ["Smartwatch", "Fitness", "Titanium"],
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
      ],
      createdAt: "2026-02-10T11:30:00Z",
    });

    // Seed products for Royal Oud
    await ctx.db.insert("products", {
      storeId: "royal-oud",
      name: "Royal Kalakassi Aged Dehn Al Oud 1984",
      nameAr: "دهن عود كلكاسي معتق 1984 ملكي",
      tagline: "Single-vintage artisanal distillation aged in glass demijohns for over 40 years.",
      taglineAr: "تقطير يدوي كلاسيكي فاخر معتق لأكثر من 40 عاماً في قوارير زجاجية خاصة.",
      description: "A legendary collector piece. Rich, smoky balsamic opening that transforms into sweet golden hay, warm tobacco notes, and deep woody warmth.",
      descriptionAr: "تحفة نادرة لهواة العود الأصيل. بداية بلسمية خشبية مدخنة تتحول إلى حلاوة ناعمة ودفء عطري يدوم لأيام.",
      price: 850,
      originalPrice: 1100,
      category: "Perfumes & Oud",
      rating: 5.0,
      reviewCount: 92,
      stock: 6,
      badge: "Best Seller",
      featured: true,
      tags: ["Aged Oud", "Dehn Al Oud", "Vintage"],
      images: [
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80",
      ],
      createdAt: "2026-02-01T12:00:00Z",
    });

    // Seed coupons
    await ctx.db.insert("coupons", {
      storeId: "panda",
      code: "WELCOME10",
      discountPercent: 10,
      minSpend: 50,
      active: true,
      description: "10% off for new customers on orders over $50",
    });

    await ctx.db.insert("coupons", {
      storeId: "panda",
      code: "BASTIYAH30",
      discountPercent: 30,
      minSpend: 200,
      active: true,
      description: "30% VIP Bastiyah discount on premium orders over $200",
    });

    return { status: "success", message: "Initial stores, products, and coupons seeded successfully!" };
  },
});
