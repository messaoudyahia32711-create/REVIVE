import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data (in reverse dependency order)
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─────────────────────────────────────────────
  // 1. USERS (4 total: 2 providers + 2 regular)
  // ─────────────────────────────────────────────
  console.log("👤 Creating users...");

  const provider1User = await prisma.user.create({
    data: {
      email: "ahmed@sahara-adventures.sa",
      name: "أحمد السفاري",
      password: "password123",
      role: "provider",
      avatar: "/images/avatar-ahmed.png",
      phone: "+966501234567",
      locale: "ar",
    },
  });

  const provider2User = await prisma.user.create({
    data: {
      email: "sarah@blue-ocean.sa",
      name: "سارة البحر",
      password: "password123",
      role: "provider",
      avatar: "/images/avatar-sarah.png",
      phone: "+966507654321",
      locale: "ar",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: "mohamed@example.com",
      name: "محمد أحمد",
      password: "password123",
      role: "user",
      avatar: "/images/avatar-mohamed.png",
      phone: "+966509876543",
      locale: "ar",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "john.smith@example.com",
      name: "John Smith",
      password: "password123",
      role: "user",
      avatar: "/images/avatar-john.png",
      phone: "+14155551234",
      locale: "en",
    },
  });

  console.log(`  ✓ Created 4 users\n`);

  // ─────────────────────────────────────────────
  // 2. PROVIDERS (2 total)
  // ─────────────────────────────────────────────
  console.log("🏢 Creating providers...");

  const provider1 = await prisma.provider.create({
    data: {
      userId: provider1User.id,
      companyName: "مغامرات الصحراء",
      description:
        "نقدم أفضل تجارب السفاري الصحراوية في المملكة العربية السعودية. خبرة تزيد عن 15 عاماً في تنظيم رحلات السفاري والمغامرات الصحراوية. نحرص على تقديم تجربة آمنة وممتعة لجميع عملائنا.",
      location: "الرياض، المملكة العربية السعودية",
      website: "https://sahara-adventures.sa",
      rating: 4.8,
      totalReviews: 247,
      verified: true,
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      userId: provider2User.id,
      companyName: "جولات المحيط الأزرق",
      description:
        "متخصصون في الرياضات المائية والجولات البحرية على ساحل البحر الأحمر. نقدم تجارب غوص وركوب أمواج واستكشاف الشعاب المرجانية بأعلى معايير السلامة.",
      location: "جدة، المملكة العربية السعودية",
      website: "https://blue-ocean-tours.sa",
      rating: 4.6,
      totalReviews: 183,
      verified: true,
    },
  });

  console.log(`  ✓ Created 2 providers\n`);

  // ─────────────────────────────────────────────
  // 3. CATEGORIES (6 total)
  // ─────────────────────────────────────────────
  console.log("📂 Creating categories...");

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        nameAr: "رحلات السفاري",
        nameEn: "Desert Safari",
        icon: "compass",
        image: "/images/category-desert.png",
        sort: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "جولات المدينة",
        nameEn: "City Tours",
        icon: "building",
        image: "/images/category-city.png",
        sort: 2,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "منتجعات الشاطئ",
        nameEn: "Beach Resort",
        icon: "umbrella",
        image: "/images/category-beach.png",
        sort: 3,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "الغطس والرياضات المائية",
        nameEn: "Diving & Water Sports",
        icon: "fish",
        image: "/images/category-diving.png",
        sort: 4,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "رحلات المغامرة",
        nameEn: "Adventure Tours",
        icon: "mountain",
        image: "/images/category-adventure.png",
        sort: 5,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "الرحلات البحرية",
        nameEn: "Cruises",
        icon: "ship",
        image: "/images/category-cruise.png",
        sort: 6,
      },
    }),
  ]);

  const [
    categoryDesert,
    categoryCity,
    categoryBeach,
    categoryDiving,
    categoryAdventure,
    categoryCruise,
  ] = categories;

  console.log(`  ✓ Created 6 categories\n`);

  // ─────────────────────────────────────────────
  // 4. SERVICES (8 total)
  // ─────────────────────────────────────────────
  console.log("🎯 Creating services...");

  const services = await Promise.all([
    // Service 1: Royal Desert Safari (Provider 1, Desert)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: categoryDesert.id,
        titleAr: "جولة السفاري الصحراوية الملكية",
        titleEn: "Royal Desert Safari Tour",
        descriptionAr:
          "استمتع بتجربة سفاري فاخرة في قلب صحراء الربع الخالي. تتضمن الرحلة القيادة على الكثبان الرملية، ركوب الإبل، مشاهدة الغروب الصحراوي الساحر، وعشاء تقليدي تحت النجوم في خيمة بدوية فاخرة. تشمل الرحلة نقل ذهاباً وإياباً من فندقك، مشروبات لا محدودة، ووجبة عربية تقليدية.",
        descriptionEn:
          "Experience a luxury desert safari in the heart of the Rub' al Khali desert. The tour includes dune bashing, camel riding, stunning desert sunset viewing, and a traditional dinner under the stars in a luxury Bedouin tent. Includes round-trip hotel transfer, unlimited beverages, and a traditional Arabian meal.",
        price: 450,
        currency: "SAR",
        duration: "6 hours",
        maxPeople: 6,
        location: "صحراء الربع الخالي، الرياض",
        image: "/images/service-safari.png",
        images: JSON.stringify([
          "/images/service-safari.png",
          "/images/hero-desert.png",
        ]),
        rating: 4.9,
        totalReviews: 128,
        totalBookings: 356,
        active: true,
        featured: true,
      },
    }),

    // Service 2: Desert Camp Under Stars (Provider 1, Desert)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: categoryDesert.id,
        titleAr: "مخيم الصحراء تحت النجوم",
        titleEn: "Desert Camp Under Stars",
        descriptionAr:
          "قضاء ليلة لا تُنسى في مخيم صحراوي فاخر. يتضمن البرنامج عشاء بدوي أصيل، شوي لحم، شاي عربي، وعروض موسيقية تقليدية. توفر الخيام فراشاً مريحاً ومرافق صحية حديثة. تجربة مثالية للعائلات والأصدقاء الباحثين عن الهدوء والسكون تحت سماء الصحراء الصافية.",
        descriptionEn:
          "Spend an unforgettable night in a luxury desert camp. The program includes an authentic Bedouin dinner, BBQ, Arabic coffee, and traditional music performances. Tents provide comfortable bedding and modern restroom facilities. A perfect experience for families and friends seeking tranquility under the clear desert sky.",
        price: 800,
        currency: "SAR",
        duration: "2 days",
        maxPeople: 10,
        location: "صحراء النفود، حائل",
        image: "/images/hero-desert.png",
        images: JSON.stringify([
          "/images/hero-desert.png",
          "/images/service-safari.png",
        ]),
        rating: 4.7,
        totalReviews: 89,
        totalBookings: 213,
        active: true,
        featured: true,
      },
    }),

    // Service 3: Old City Tour (Provider 1, City)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: categoryCity.id,
        titleAr: "جولة المدينة القديمة",
        titleEn: "Old City Tour",
        descriptionAr:
          "اكتشف التاريخ العريق لمنطقة الدرعية التاريخية في الرياض. جولة ممشى مع مرشد سياحي متخصص يأخذك في رحلة عبر المباني التراثية والمتاحف والأسواق التقليدية. تعرف على ثقافة السعودية الأصيلة واستمتع بالمأكولات الشعبية في المطاعم التراثية.",
        descriptionEn:
          "Discover the rich history of the historic Diriyah area in Riyadh. A guided walking tour with a specialized guide that takes you through heritage buildings, museums, and traditional markets. Learn about authentic Saudi culture and enjoy traditional cuisine at heritage restaurants.",
        price: 200,
        currency: "SAR",
        duration: "4 hours",
        maxPeople: 15,
        location: "الدرعية التاريخية، الرياض",
        image: "/images/service-riad.png",
        images: JSON.stringify(["/images/service-riad.png"]),
        rating: 4.5,
        totalReviews: 64,
        totalBookings: 178,
        active: true,
        featured: false,
      },
    }),

    // Service 4: Luxury Beach Vacation (Provider 2, Beach)
    prisma.service.create({
      data: {
        providerId: provider2.id,
        categoryId: categoryBeach.id,
        titleAr: "إجازة الشاطئ الفاخرة",
        titleEn: "Luxury Beach Vacation",
        descriptionAr:
          "استرخِ على شواطئ البحر الأحمر الخلابة في منتجع فاخر. تشمل الرحلة إقامة في جناح مطلة على البحر، وجبات بحرية طازجة، واستخدام مرافق المنتجع بما في ذلك المسابح والسبا. مثالية للأزواج والعائلات الباحثين عن الاسترخاء والرفاهية.",
        descriptionEn:
          "Relax on the stunning Red Sea beaches at a luxury resort. The trip includes a stay in a sea-view suite, fresh seafood meals, and full access to resort facilities including pools and spa. Ideal for couples and families seeking relaxation and luxury.",
        price: 2500,
        currency: "SAR",
        duration: "3 days",
        maxPeople: 4,
        location: "شاطئ أوبهور، جدة",
        image: "/images/category-beach.png",
        images: JSON.stringify([
          "/images/category-beach.png",
          "/images/service-yacht.png",
        ]),
        rating: 4.8,
        totalReviews: 95,
        totalBookings: 267,
        active: true,
        featured: true,
      },
    }),

    // Service 5: Coral Reef Diving (Provider 2, Diving)
    prisma.service.create({
      data: {
        providerId: provider2.id,
        categoryId: categoryDiving.id,
        titleAr: "غوص الشعاب المرجانية",
        titleEn: "Coral Reef Diving",
        descriptionAr:
          "استكشف عالم الشعاب المرجانية المذهل في البحر الأحمر. رحلة غوص مصحوبة بمدربين معتمدين دولياً من PADI. مناسبة لجميع المستويات من المبتدئين إلى المحترفين. يتضمن البرنامج معدات الغوص الكاملة، نقل بالقارب، وجبات خفيفة. اكتشف أكثر من 200 نوع من الأسماك المرجانية الملونة.",
        descriptionEn:
          "Explore the amazing world of coral reefs in the Red Sea. A diving trip accompanied by PADI internationally certified instructors. Suitable for all levels from beginners to professionals. The program includes full diving equipment, boat transfer, and snacks. Discover over 200 species of colorful reef fish.",
        price: 650,
        currency: "SAR",
        duration: "5 hours",
        maxPeople: 8,
        location: "شعاب الشعيب، جدة",
        image: "/images/category-diving.png",
        images: JSON.stringify([
          "/images/category-diving.png",
          "/images/service-yacht.png",
        ]),
        rating: 4.7,
        totalReviews: 112,
        totalBookings: 389,
        active: true,
        featured: true,
      },
    }),

    // Service 6: Surfing for Beginners (Provider 2, Diving)
    prisma.service.create({
      data: {
        providerId: provider2.id,
        categoryId: categoryDiving.id,
        titleAr: "ركوب الأمواج للمبتدئين",
        titleEn: "Surfing for Beginners",
        descriptionAr:
          "تعلم ركوب الأمواج في بيئة آمنة وممتعة على شواطئ جدة. دورة تدريبية مكثفة مع مدربين محترفين تشمل أساسيات التوازن والسباحة على الأمواج والسلامة البحرية. مت suitable للبالغين والأطفال فوق 10 سنوات. تشمل لوح الأمواج والملابس المائية.",
        descriptionEn:
          "Learn surfing in a safe and fun environment on Jeddah's beaches. An intensive training course with professional instructors covering balance basics, wave riding, and sea safety. Suitable for adults and children over 10 years old. Includes surfboard and wetsuit.",
        price: 350,
        currency: "SAR",
        duration: "3 hours",
        maxPeople: 6,
        location: "شاطئ الغرابي، جدة",
        image: "/images/category-beach.png",
        images: JSON.stringify(["/images/category-beach.png"]),
        rating: 4.4,
        totalReviews: 56,
        totalBookings: 145,
        active: true,
        featured: false,
      },
    }),

    // Service 7: Mountain Hiking & Trekking (Provider 1, Adventure)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: categoryAdventure.id,
        titleAr: "تسلق الجبال والتنزه",
        titleEn: "Mountain Hiking & Trekking",
        descriptionAr:
          "رحلة مغامرة في جبال السروات الخضراء بمنطقة أبها. مسارات تنزه متنوعة تناسب جميع المستويات. استمتع بالمناظر الطبيعية الخلابة والهواء النقي والقرى الجبلية التقليدية. يشمل البرنامج نقل ذهاباً وإياباً، وجبة غداء في مطعم جبلي، ودليل جبلي متخصص.",
        descriptionEn:
          "An adventure trip in the green Sarawat mountains of the Abha region. Diverse hiking trails suitable for all levels. Enjoy stunning natural scenery, fresh air, and traditional mountain villages. The program includes round-trip transfer, lunch at a mountain restaurant, and a specialized mountain guide.",
        price: 380,
        currency: "SAR",
        duration: "8 hours",
        maxPeople: 12,
        location: "جبال السروات، أبها",
        image: "/images/category-adventure.png",
        images: JSON.stringify(["/images/category-adventure.png"]),
        rating: 4.6,
        totalReviews: 73,
        totalBookings: 198,
        active: true,
        featured: false,
      },
    }),

    // Service 8: Private Yacht Tour (Provider 2, Cruise)
    prisma.service.create({
      data: {
        providerId: provider2.id,
        categoryId: categoryCruise.id,
        titleAr: "رحلة اليخت الخاصة",
        titleEn: "Private Yacht Tour",
        descriptionAr:
          "استأجر يختاً فاخراً خاصاً لك ولعائلتك وأصدقائك في البحر الأحمر. رحلة لا تُنسى تشمل السباحة، الغطس السطحي، صيد الأسماك، وعشاء بحري فاخر على متن اليخت. يتوفر طاقم خدمة متكامل وطاهٍ متخصص في المأكولات البحرية. مثالية للمناسبات الخاصة والاحتفالات.",
        descriptionEn:
          "Rent a private luxury yacht for you, your family, and friends on the Red Sea. An unforgettable trip including swimming, snorkeling, fishing, and a luxury seafood dinner on board. Full service crew and a specialized seafood chef available. Perfect for special occasions and celebrations.",
        price: 3500,
        currency: "SAR",
        duration: "8 hours",
        maxPeople: 12,
        location: "مارينا جدة، جدة",
        image: "/images/service-yacht.png",
        images: JSON.stringify([
          "/images/service-yacht.png",
          "/images/category-cruise.png",
        ]),
        rating: 4.9,
        totalReviews: 41,
        totalBookings: 89,
        active: true,
        featured: true,
      },
    }),
  ]);

  const [
    serviceRoyalSafari,
    serviceDesertCamp,
    serviceOldCity,
    serviceBeach,
    serviceCoralDiving,
    serviceSurfing,
    serviceMountain,
    serviceYacht,
  ] = services;

  console.log(`  ✓ Created 8 services\n`);

  // ─────────────────────────────────────────────
  // 5. BOOKINGS (6 total)
  // ─────────────────────────────────────────────
  console.log("📅 Creating bookings...");

  const now = new Date();

  const bookings = await Promise.all([
    // Booking 1: Completed - Mohamed booked Royal Safari
    prisma.booking.create({
      data: {
        userId: user1.id,
        serviceId: serviceRoyalSafari.id,
        providerId: provider1.id,
        status: "completed",
        bookingDate: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 0),
        numberOfPeople: 3,
        totalPrice: 1350,
        notes: "نريد مقاعد قريبة من السائق",
      },
    }),

    // Booking 2: Completed - John booked Coral Reef Diving
    prisma.booking.create({
      data: {
        userId: user2.id,
        serviceId: serviceCoralDiving.id,
        providerId: provider2.id,
        status: "completed",
        bookingDate: new Date(now.getFullYear(), now.getMonth() - 1, 22, 8, 0),
        numberOfPeople: 2,
        totalPrice: 1300,
        notes: "First time diving, please provide extra guidance",
      },
    }),

    // Booking 3: Completed - Mohamed booked Desert Camp
    prisma.booking.create({
      data: {
        userId: user1.id,
        serviceId: serviceDesertCamp.id,
        providerId: provider1.id,
        status: "completed",
        bookingDate: new Date(now.getFullYear(), now.getMonth() - 2, 5, 14, 0),
        numberOfPeople: 4,
        totalPrice: 3200,
        notes: "عائلة مع أطفال، نحتاج سريراً إضافياً",
      },
    }),

    // Booking 4: Confirmed - John booked Private Yacht
    prisma.booking.create({
      data: {
        userId: user2.id,
        serviceId: serviceYacht.id,
        providerId: provider2.id,
        status: "confirmed",
        bookingDate: new Date(now.getFullYear(), now.getMonth() + 1, 10, 10, 0),
        numberOfPeople: 6,
        totalPrice: 21000,
        notes: "Birthday celebration - please arrange a cake",
      },
    }),

    // Booking 5: Confirmed - Mohamed booked Old City Tour
    prisma.booking.create({
      data: {
        userId: user1.id,
        serviceId: serviceOldCity.id,
        providerId: provider1.id,
        status: "confirmed",
        bookingDate: new Date(now.getFullYear(), now.getMonth() + 1, 5, 16, 0),
        numberOfPeople: 2,
        totalPrice: 400,
        notes: null,
      },
    }),

    // Booking 6: Pending - John booked Mountain Hiking
    prisma.booking.create({
      data: {
        userId: user2.id,
        serviceId: serviceMountain.id,
        providerId: provider1.id,
        status: "pending",
        bookingDate: new Date(now.getFullYear(), now.getMonth() + 2, 1, 7, 0),
        numberOfPeople: 4,
        totalPrice: 1520,
        notes: "We have moderate hiking experience",
      },
    }),
  ]);

  const [
    booking1,
    booking2,
    booking3,
    booking4,
    booking5,
    booking6,
  ] = bookings;

  console.log(`  ✓ Created 6 bookings\n`);

  // ─────────────────────────────────────────────
  // 6. REVIEWS (4 total)
  // ─────────────────────────────────────────────
  console.log("⭐ Creating reviews...");

  await Promise.all([
    // Review 1: Mohamed reviews Royal Safari - 5 stars
    prisma.review.create({
      data: {
        userId: user1.id,
        serviceId: serviceRoyalSafari.id,
        bookingId: booking1.id,
        rating: 5,
        comment:
          "تجربة رائعة جداً! السائق محترف والرحلة منظمة بشكل ممتاز. العشاء تحت النجوم كان لحظة ساحرة. أنصح الجميع بتجربتها.",
      },
    }),

    // Review 2: John reviews Coral Reef Diving - 4 stars
    prisma.review.create({
      data: {
        userId: user2.id,
        serviceId: serviceCoralDiving.id,
        bookingId: booking2.id,
        rating: 4,
        comment:
          "Great experience for a first-time diver! The instructors were very patient and professional. The coral reefs are absolutely stunning. Only minor issue was the boat was slightly crowded.",
      },
    }),

    // Review 3: Mohamed reviews Desert Camp - 5 stars
    prisma.review.create({
      data: {
        userId: user1.id,
        serviceId: serviceDesertCamp.id,
        bookingId: booking3.id,
        rating: 5,
        comment:
          "ليلة لا تُنسى في الصحراء! الخيم كانت مريحة والعشاء لذيذ. الأطفال استمتعوا كثيراً بتجربة ركوب الإبل. سنعود بالتأكيد مرة أخرى.",
      },
    }),

    // Review 4: John reviews Old City Tour (from previous visit, no booking) - 3 stars
    prisma.review.create({
      data: {
        userId: user2.id,
        serviceId: serviceOldCity.id,
        rating: 3,
        comment:
          "Interesting tour with good historical information. However, it was quite hot during the day and I wish there were more shaded rest areas. The guide was knowledgeable but spoke very fast.",
      },
    }),
  ]);

  console.log(`  ✓ Created 4 reviews\n`);

  // ─────────────────────────────────────────────
  // 7. MESSAGES (4 total)
  // ─────────────────────────────────────────────
  console.log("💬 Creating messages...");

  await Promise.all([
    // Message 1: Mohamed asks about Yacht booking details
    prisma.message.create({
      data: {
        bookingId: booking4.id,
        senderId: user2.id,
        content:
          "Hi, can we arrange for a special seafood dinner menu? One of our guests has a shellfish allergy.",
      },
    }),

    // Message 2: Sarah (Provider 2) responds
    prisma.message.create({
      data: {
        bookingId: booking4.id,
        senderId: provider2User.id,
        content:
          "Hello John! Absolutely, we can accommodate that. Our chef will prepare a special menu that avoids shellfish. We'll also have a variety of grilled fish and other options. Is there anything else you'd like us to arrange for the birthday celebration?",
      },
    }),

    // Message 3: Mohamed asks Ahmed about the Old City Tour
    prisma.message.create({
      data: {
        bookingId: booking5.id,
        senderId: user1.id,
        content:
          "مرحباً أحمد، هل يمكننا البدء من الساعة 4 عصراً بدلاً من 4؟ الجو سيكون أبرد في وقت متأخر.",
      },
    }),

    // Message 4: Ahmed (Provider 1) responds
    prisma.message.create({
      data: {
        bookingId: booking5.id,
        senderId: provider1User.id,
        content:
          "أهلاً محمد! نعم بالتأكيد، لا مشكلة في تغيير الموعد إلى 4 عصراً. سأرسل لك تأكيد الموعد الجديد. هل تحتاج ترتيبات نقل خاصة؟",
      },
    }),
  ]);

  console.log(`  ✓ Created 4 messages\n`);

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log("═".repeat(50));
  console.log("✅ Seed completed successfully!\n");
  console.log("📊 Summary:");
  console.log("   Users:     4");
  console.log("   Providers: 2");
  console.log("   Categories: 6");
  console.log("   Services:  8");
  console.log("   Bookings:  6");
  console.log("   Reviews:   4");
  console.log("   Messages:  4");
  console.log("═".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
