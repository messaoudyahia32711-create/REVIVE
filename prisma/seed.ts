import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding medical tourism database...\n");

  // Clean existing data (in reverse dependency order)
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─────────────────────────────────────────────
  // 1. USERS (7 total: 2 patients + 4 providers + 1 admin)
  // ─────────────────────────────────────────────
  console.log("👤 Creating users...");

  const provider1User = await prisma.user.create({
    data: {
      email: "provider1@h.dz",
      name: "Dr. Karim Hadj",
      password: "123456",
      role: "provider",
      phone: "+213555100001",
      wilaya: "16",
      locale: "ar",
    },
  });

  const provider2User = await prisma.user.create({
    data: {
      email: "provider2@h.dz",
      name: "Dr. Samira Mebarki",
      password: "123456",
      role: "provider",
      phone: "+213555100002",
      wilaya: "25",
      locale: "ar",
    },
  });

  const patient1 = await prisma.user.create({
    data: {
      email: "patient1@h.dz",
      name: "Ahmed Benali",
      password: "123456",
      role: "user",
      phone: "+213555200001",
      wilaya: "16",
      locale: "ar",
    },
  });

  const patient2 = await prisma.user.create({
    data: {
      email: "patient2@h.dz",
      name: "Fatima Zohra Boualem",
      password: "123456",
      role: "user",
      phone: "+213555200002",
      wilaya: "31",
      locale: "ar",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@h.dz",
      name: "مدير المنصة",
      password: "admin123",
      role: "admin",
      phone: "+213555000000",
      wilaya: "16",
      locale: "ar",
    },
  });

  const provider3User = await prisma.user.create({
    data: {
      email: "provider3@h.dz",
      name: "د. ياسين منصوري",
      password: "123456",
      role: "provider",
      phone: "+213555100003",
      wilaya: "31",
      locale: "ar",
    },
  });

  const provider4User = await prisma.user.create({
    data: {
      email: "provider4@h.dz",
      name: "المركب المعدني حمام ريغة",
      password: "123456",
      role: "provider",
      phone: "+213555100004",
      wilaya: "44",
      locale: "ar",
    },
  });

  console.log(`  ✓ Created 7 users\n`);

  // ─────────────────────────────────────────────
  // 2. PROVIDERS (4 total)
  // ─────────────────────────────────────────────
  console.log("🏥 Creating providers...");

  const provider1 = await prisma.provider.create({
    data: {
      userId: provider1User.id,
      companyName: "مركز الصحة الطبيعي",
      description:
        "مركز متخصص في تقديم خدمات الرعاية الصحية الشاملة والعلاج الطبيعي في الجزائر العاصمة. نضم فريقاً من الأطباء المتخصصين ذوي الخبرة العالية في مختلف المجالات الطبية. نسعى لتقديم أفضل تجربة علاجية لمرضانا بأحدث التقنيات والمعدات الطبية.",
      wilaya: "16",
      website: "https://natural-health.dz",
      rating: 2.8,
      totalReviews: 3,
      verified: true,
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      userId: provider2User.id,
      companyName: "عيادة الشفاء",
      description:
        "عيادة طبية متقدمة في مدينة قسنطينة تقدم خدمات طبية متنوعة تشمل الجلدية والعيون وأمراض القلب. نفتخر بفريق طبي متميز وبمعدات حديثة لضمان تشخيص دقيق وعلاج فعّال. نحرص على راحة المريض وتوفير بيئة علاجية مريحة وآمنة.",
      wilaya: "25",
      website: "https://al-shifa-clinic.dz",
      rating: 1.3,
      totalReviews: 1,
      verified: true,
    },
  });

  const provider3 = await prisma.provider.create({
    data: {
      userId: provider3User.id,
      companyName: "عيادة العظام والمفاصل المتخصصة",
      description: "عيادة متخصصة في جراحة العظام والمفاصل والعمود الفقري ومعالجة الإصابات الرياضية وتغيير المفاصل. نعتمد على أحدث التقنيات الجراحية والمناظير لضمان سرعة الشفاء.",
      wilaya: "31",
      website: "https://mansouri-ortho.dz",
      rating: 4.9,
      totalReviews: 15,
      verified: true,
    },
  });

  const provider4 = await prisma.provider.create({
    data: {
      userId: provider4User.id,
      companyName: "منتجع ومصحة حمام ريغة للمياه المعدنية",
      description: "أعرق منتجع للمياه المعدنية الحارة في الجزائر، يقدم خدمات العلاج بالمياه المعدنية للاستشفاء من أمراض الروماتيزم والأمراض الجلدية بالإضافة للتأهيل الحركي في بيئة طبيعية خلابة.",
      wilaya: "44",
      website: "https://hammam-righa.dz",
      rating: 4.8,
      totalReviews: 42,
      verified: true,
    },
  });

  console.log(`  ✓ Created 4 providers\n`);

  // ─────────────────────────────────────────────
  // 3. CATEGORIES (10 total)
  // ─────────────────────────────────────────────
  console.log("📂 Creating categories...");

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        nameAr: "الطب العام",
        nameEn: "General Medicine",
        icon: "Stethoscope",
        sort: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "طب الأسنان",
        nameEn: "Dental Care",
        icon: "Smile",
        sort: 2,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "العلاج الطبيعي",
        nameEn: "Physiotherapy",
        icon: "Activity",
        sort: 3,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "طب الجلدية",
        nameEn: "Dermatology",
        icon: "Sparkles",
        sort: 4,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "طب العيون",
        nameEn: "Ophthalmology",
        icon: "Eye",
        sort: 5,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "الطب البديل",
        nameEn: "Alternative Medicine",
        icon: "Leaf",
        sort: 6,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "أمراض القلب",
        nameEn: "Cardiology",
        icon: "HeartPulse",
        sort: 7,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "جراحة العظام",
        nameEn: "Orthopedics",
        icon: "Bone",
        sort: 8,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "التغذية والحمية",
        nameEn: "Nutrition & Diet",
        icon: "Apple",
        sort: 9,
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "العلاج بالمياه المعدنية",
        nameEn: "Thermal Therapy",
        icon: "Droplets",
        sort: 10,
      },
    }),
  ]);

  const [
    catGeneralMedicine,
    catDentalCare,
    catPhysiotherapy,
    catDermatology,
    catOphthalmology,
    catAlternativeMedicine,
    catCardiology,
    catOrthopedics,
    catNutrition,
    catThermalTherapy,
  ] = categories;

  console.log(`  ✓ Created 10 categories\n`);

  // ─────────────────────────────────────────────
  // 4. SERVICES (12 total)
  // ─────────────────────────────────────────────
  console.log("🩺 Creating services...");

  const services = await Promise.all([
    // Service 1: Comprehensive Medical Checkup (Provider 1, General Medicine)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: catGeneralMedicine.id,
        titleAr: "فحص طبي شامل",
        titleEn: "Comprehensive Medical Checkup",
        descriptionAr:
          "فحص طبي شامل يتضمن تحاليل دم كاملة، قياس ضغط الدم والسكر، فحص القلب والأوعية الدموية، وتقييم الصحة العامة. يتم إجراء الفحص بواسطة فريق من الأطباء المتخصصين باستخدام أحدث المعدات الطبية. يحصل المريض على تقرير مفصل مع التوصيات العلاجية المناسبة.",
        descriptionEn:
          "A comprehensive medical checkup including complete blood tests, blood pressure and sugar monitoring, cardiovascular examination, and overall health assessment. The examination is conducted by a team of specialized doctors using state-of-the-art medical equipment. Patients receive a detailed report with appropriate treatment recommendations.",
        price: 8000,
        currency: "DZD",
        duration: "2 hours",
        maxPeople: 1,
        wilaya: "16",
        location: "الجزائر",
        images: JSON.stringify([]),
        rating: 5,
        totalReviews: 1,
        totalBookings: 1,
        active: true,
        featured: true,
      },
    }),

    // Service 2: Laser Teeth Whitening (Provider 1, Dental Care)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: catDentalCare.id,
        titleAr: "تبييض أسنان بالليزر",
        titleEn: "Laser Teeth Whitening",
        descriptionAr:
          "تقنية تبييض الأسنان بالليزر الأحدث لتحقيق أسنان بيضاء ناصعة في جلسة واحدة. يستخدم أطباؤنا أجهزة ليزر متطورة مع مواد تبييض آمنة ومعتمدة عالمياً. النتائج تظهر فوراً وتدوم لعدة أشهر مع العناية المناسبة.",
        descriptionEn:
          "The latest laser teeth whitening technology to achieve bright white teeth in a single session. Our doctors use advanced laser devices with globally approved safe whitening materials. Results are immediately visible and last for several months with proper care.",
        price: 15000,
        currency: "DZD",
        duration: "1 hour",
        maxPeople: 1,
        wilaya: "16",
        location: "الجزائر",
        images: JSON.stringify([]),
        rating: 4,
        totalReviews: 1,
        totalBookings: 0,
        active: true,
        featured: true,
      },
    }),

    // Service 3: Physiotherapy Session (Provider 1, Physiotherapy)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: catPhysiotherapy.id,
        titleAr: "جلسة علاج طبيعي",
        titleEn: "Physiotherapy Session",
        descriptionAr:
          "جلسة علاج طبيعي متخصصة لعلاج آلام الظهر والرقبة والمفاصل باستخدام أحدث التقنيات. يتضمن العلاج تمارين مخصصة وتحفيز كهربائي وعلاج بالحرارة والتدليك. يضع أخصائي العلاج الطبيعي خطة علاجية تناسب حالة كل مريض.",
        descriptionEn:
          "A specialized physiotherapy session for treating back, neck, and joint pain using the latest techniques. Treatment includes customized exercises, electrical stimulation, heat therapy, and massage. The physiotherapist creates a personalized treatment plan for each patient's condition.",
        price: 3000,
        currency: "DZD",
        duration: "1 hour",
        maxPeople: 1,
        wilaya: "16",
        location: "الجزائر",
        images: JSON.stringify([]),
        rating: 5,
        totalReviews: 1,
        totalBookings: 0,
        active: true,
        featured: true,
      },
    }),

    // Service 4: Acne Treatment (Provider 2, Dermatology)
    prisma.service.create({
      data: {
        providerId: provider2.id,
        categoryId: catDermatology.id,
        titleAr: "علاج حب الشباب",
        titleEn: "Acne Treatment",
        descriptionAr:
          "برنامج علاجي متكامل لحب الشباب يشمل التشخيص الدقيق والعلاج بالأدوية والتقنيات الحديثة. يستخدم فريقنا أحدث أجهزة العلاج بالضوء والليزر للتخلص من حب الشباب والبقع الداكنة. يتبع العلاج بخطة متابعة لضمان نتائج دائمة ومظهر بشرة صحي.",
        descriptionEn:
          "A comprehensive acne treatment program including accurate diagnosis and treatment with medications and modern techniques. Our team uses the latest light therapy and laser devices to eliminate acne and dark spots. The treatment is followed by a follow-up plan to ensure lasting results and healthy skin appearance.",
        price: 5000,
        currency: "DZD",
        duration: "45 min",
        maxPeople: 1,
        wilaya: "25",
        location: "قسنطينة",
        images: JSON.stringify([]),
        rating: 0,
        totalReviews: 0,
        totalBookings: 1,
        active: true,
        featured: true,
      },
    }),

    // Service 5: Eye Exam & Correction (Provider 2, Ophthalmology)
    prisma.service.create({
      data: {
        providerId: provider2.id,
        categoryId: catOphthalmology.id,
        titleAr: "فحص نظر وتصحيح",
        titleEn: "Eye Exam & Correction",
        descriptionAr:
          "فحص نظر شامل يتضمن فحص قوة النظر وقياس ضغط العين وفحص شبكية العين. يتم تقديم وصفة طبية دقيقة للنظارات أو العدسات اللاصقة المناسبة. نستخدم أحدث أجهزة قياس النصر الرقمية لضمان أعلى دقة في التشخيص.",
        descriptionEn:
          "A comprehensive eye exam including vision testing, intraocular pressure measurement, and retinal examination. An accurate prescription is provided for suitable glasses or contact lenses. We use the latest digital vision measurement devices to ensure the highest diagnostic accuracy.",
        price: 6000,
        currency: "DZD",
        duration: "1 hour",
        maxPeople: 1,
        wilaya: "25",
        location: "قسنطينة",
        images: JSON.stringify([]),
        rating: 4,
        totalReviews: 1,
        totalBookings: 0,
        active: true,
        featured: false,
      },
    }),

    // Service 6: Cupping & Herbal Therapy (Provider 1, Alternative Medicine)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: catAlternativeMedicine.id,
        titleAr: "حجامة وعلاج بالأعشاب",
        titleEn: "Cupping & Herbal Therapy",
        descriptionAr:
          "جلسة حجامة وعلاج بالأعشاب الطبيعية وفقاً للطرق التقليدية المعتمدة. يساعد العلاج في تنقية الدم وتحسين الدورة الدموية وتخفيف آلام العضلات والمفاصل. يستخدم معالجونا أعشاباً طبيعية عالية الجودة مع تعقيم كامل للأدوات.",
        descriptionEn:
          "A cupping and herbal therapy session following approved traditional methods. The therapy helps purify the blood, improve circulation, and relieve muscle and joint pain. Our practitioners use high-quality natural herbs with fully sterilized equipment.",
        price: 4000,
        currency: "DZD",
        duration: "90 min",
        maxPeople: 1,
        wilaya: "16",
        location: "الجزائر",
        images: JSON.stringify([]),
        rating: 0,
        totalReviews: 0,
        totalBookings: 1,
        active: true,
        featured: true,
      },
    }),

    // Service 7: Cardiac ECG Checkup (Provider 2, Cardiology)
    prisma.service.create({
      data: {
        providerId: provider2.id,
        categoryId: catCardiology.id,
        titleAr: "فحص القلب بالتخطيط",
        titleEn: "Cardiac ECG Checkup",
        descriptionAr:
          "فحص قلب متكامل يتضمن تخطيط كهربية القلب وتخطيط صدى القلب وتقييم وظائف القلب. يتم إجراء الفحص تحت إشراف طبيب قلب متخصص مع تحليل دقيق للنتائج. يحصل المريض على تقرير مفصل حول صحة القلب مع توصيات المتابعة.",
        descriptionEn:
          "A comprehensive cardiac checkup including electrocardiogram (ECG), echocardiogram, and heart function assessment. The examination is conducted under the supervision of a specialized cardiologist with thorough result analysis. Patients receive a detailed report on heart health with follow-up recommendations.",
        price: 10000,
        currency: "DZD",
        duration: "2 hours",
        maxPeople: 1,
        wilaya: "25",
        location: "قسنطينة",
        images: JSON.stringify([]),
        rating: 0,
        totalReviews: 0,
        totalBookings: 0,
        active: true,
        featured: false,
      },
    }),

    // Service 8: Custom Nutrition Plan (Provider 1, Nutrition & Diet)
    prisma.service.create({
      data: {
        providerId: provider1.id,
        categoryId: catNutrition.id,
        titleAr: "خطة غذائية مخصصة",
        titleEn: "Custom Nutrition Plan",
        descriptionAr:
          "خطة غذائية مخصصة بناءً على تحليل شامل للجسم واحتياجاته الغذائية. يضع أخصائي التغذية برنامجاً متكاملاً يتضمن وجبات يومية ومقترحات لبدائل صحية. الخطة مناسبة لإنقاص الوزن أو زيادته أو الحفاظ على صحة عامة مثالية.",
        descriptionEn:
          "A custom nutrition plan based on a comprehensive body analysis and dietary needs. The nutritionist creates a complete program including daily meals and healthy alternative suggestions. The plan is suitable for weight loss, weight gain, or maintaining optimal overall health.",
        price: 4500,
        currency: "DZD",
        duration: "1 hour",
        maxPeople: 1,
        wilaya: "16",
        location: "الجزائر",
        images: JSON.stringify([]),
        rating: 0,
        totalReviews: 0,
        totalBookings: 1,
        active: true,
        featured: true,
      },
    }),

    // Service 9: Orthopedic Surgery Consultation (Provider 3, Orthopedics)
    prisma.service.create({
      data: {
        providerId: provider3.id,
        categoryId: catOrthopedics.id,
        titleAr: "استشارة جراحة العظام",
        titleEn: "Orthopedic Consultation",
        descriptionAr: "فحص شامل وإجراء الأشعة السينية وتشخيص أمراض المفاصل والعظام. يتم تقديم أفضل التوصيات والخطة العلاجية أو الجراحية إذا لزم الأمر من قبل البروفيسور.",
        descriptionEn: "Comprehensive physical examination with X-rays to diagnose bone and joint diseases. The best recommendations and medical or surgical plans are provided.",
        price: 4000,
        currency: "DZD",
        duration: "30 min",
        maxPeople: 1,
        wilaya: "31",
        location: "وهران",
        images: JSON.stringify([]),
        rating: 5,
        totalReviews: 2,
        totalBookings: 8,
        active: true,
        featured: true,
      },
    }),

    // Service 10: Sports Injury Treatment (Provider 3, Orthopedics)
    prisma.service.create({
      data: {
        providerId: provider3.id,
        categoryId: catOrthopedics.id,
        titleAr: "علاج الإصابات الرياضية",
        titleEn: "Sports Injury Treatment",
        descriptionAr: "علاج متخصص للرياضيين يشمل تمزق الأربطة، خلع المفاصل، ومشاكل العضلات باستخدام الحقن الموضعية والتأهيل المتقدم.",
        descriptionEn: "Specialized treatment for athletes including torn ligaments, dislocations, and muscle problems using local injections and advanced rehabilitation.",
        price: 5000,
        currency: "DZD",
        duration: "45 min",
        maxPeople: 1,
        wilaya: "31",
        location: "وهران",
        images: JSON.stringify([]),
        rating: 4.8,
        totalReviews: 5,
        totalBookings: 12,
        active: true,
        featured: true,
      },
    }),

    // Service 11: Thermal Water Sessions (Provider 4, Thermal Therapy)
    prisma.service.create({
      data: {
        providerId: provider4.id,
        categoryId: catThermalTherapy.id,
        titleAr: "جلسات وحمامات المياه المعدنية الحارة",
        titleEn: "Thermal Water Baths",
        descriptionAr: "جلسات علاجية واستشفائية في مسابح وحمامات المياه المعدنية الطبيعية التي تصل حرارتها لـ 68 درجة، فعالة جداً لأمراض المفاصل، الروماتيزم، والأمراض الجلدية.",
        descriptionEn: "Therapeutic sessions in natural thermal mineral water pools reaching 68 degrees, highly effective for joint diseases, rheumatism, and skin conditions.",
        price: 2500,
        currency: "DZD",
        duration: "1 day",
        maxPeople: 4,
        wilaya: "44",
        location: "عين الدفلى",
        images: JSON.stringify([]),
        rating: 4.9,
        totalReviews: 30,
        totalBookings: 150,
        active: true,
        featured: true,
      },
    }),

    // Service 12: Aquatic Rehabilitation (Provider 4, Thermal Therapy)
    prisma.service.create({
      data: {
        providerId: provider4.id,
        categoryId: catThermalTherapy.id,
        titleAr: "التأهيل الحركي المائي الطبي",
        titleEn: "Medical Aquatic Rehabilitation",
        descriptionAr: "إعادة تأهيل حركي في مسابح المياه المعدنية تحت إشراف أخصائيي العلاج الطبيعي، مثالي لما بعد العمليات الجراحية العظمية وإصابات الشلل النصفي.",
        descriptionEn: "Motor rehabilitation in thermal pools under the supervision of physiotherapists, optimal for post-orthopedic surgeries and hemiplegia injuries.",
        price: 3500,
        currency: "DZD",
        duration: "1 hour",
        maxPeople: 1,
        wilaya: "44",
        location: "عين الدفلى",
        images: JSON.stringify([]),
        rating: 5,
        totalReviews: 12,
        totalBookings: 25,
        active: true,
        featured: true,
      },
    }),
  ]);

  const [
    serviceCheckup,
    serviceTeethWhitening,
    servicePhysiotherapy,
    serviceAcneTreatment,
    serviceEyeExam,
    serviceCupping,
    serviceCardiac,
    serviceNutrition,
    serviceOrthopedicConsult,
    serviceSportsInjury,
    serviceThermalBath,
    serviceAquaticRehab,
  ] = services;

  console.log(`  ✓ Created 12 services\n`);

  // ─────────────────────────────────────────────
  // 5. BOOKINGS (4 total)
  // ─────────────────────────────────────────────
  console.log("📅 Creating bookings...");

  const now = new Date();

  // Booking 1: Completed - Ahmed booked Comprehensive Checkup (Provider 1)
  const booking1 = await prisma.booking.create({
    data: {
      userId: patient1.id,
      serviceId: serviceCheckup.id,
      providerId: provider1.id,
      status: "completed",
      bookingDate: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 0),
      numberOfPeople: 1,
      totalPrice: 8000,
      notes: "أحتاج تقرير مفصل بالنتائج",
    },
  });

  // Booking 2: Confirmed - Fatima Zohra booked Acne Treatment (Provider 2)
  const booking2 = await prisma.booking.create({
    data: {
      userId: patient2.id,
      serviceId: serviceAcneTreatment.id,
      providerId: provider2.id,
      status: "confirmed",
      bookingDate: new Date(now.getFullYear(), now.getMonth() + 1, 5, 14, 0),
      numberOfPeople: 1,
      totalPrice: 5000,
      notes: null,
    },
  });

  // Booking 3: Confirmed - Ahmed booked Cupping & Herbal Therapy (Provider 1)
  const booking3 = await prisma.booking.create({
    data: {
      userId: patient1.id,
      serviceId: serviceCupping.id,
      providerId: provider1.id,
      status: "confirmed",
      bookingDate: new Date(now.getFullYear(), now.getMonth() + 1, 10, 10, 0),
      numberOfPeople: 2,
      totalPrice: 8000,
      notes: "حجز لشخصين، أرجو تخصيص موعد متتالي",
    },
  });

  // Booking 4: Pending - Fatima Zohra booked Custom Nutrition Plan (Provider 1)
  const booking4 = await prisma.booking.create({
    data: {
      userId: patient2.id,
      serviceId: serviceNutrition.id,
      providerId: provider1.id,
      status: "pending",
      bookingDate: new Date(now.getFullYear(), now.getMonth() + 2, 1, 11, 0),
      numberOfPeople: 1,
      totalPrice: 4500,
      notes: "هل يمكن الحجز عن بُعد عبر الإنترنت؟",
    },
  });

  console.log(`  ✓ Created 4 bookings\n`);

  // ─────────────────────────────────────────────
  // 6. REVIEWS (4 total)
  // ─────────────────────────────────────────────
  console.log("⭐ Creating reviews...");

  await Promise.all([
    // Review 1: Ahmed reviews Comprehensive Checkup - 5 stars
    prisma.review.create({
      data: {
        userId: patient1.id,
        serviceId: serviceCheckup.id,
        bookingId: booking1.id,
        rating: 5,
        comment:
          "فحص شامل وممتاز. الطبيب كان متعاون جداً وشرح كل النتائج بتفصيل. التقرير الطبي كان واضحاً وشاملاً. أنصح الجميع بهذا المركز المتميز.",
      },
    }),

    // Review 2: Ahmed reviews Laser Teeth Whitening - 4 stars
    prisma.review.create({
      data: {
        userId: patient1.id,
        serviceId: serviceTeethWhitening.id,
        rating: 4,
        comment:
          "نتائج رائعة وتبييض واضح من الجلسة الأولى. الفريق الطبي محترف والمكان نظيف. لاحظت حساسية بسيطة في الأسنان لبضعة أيام لكنها اختفت بسرعة.",
      },
    }),

    // Review 3: Fatima Zohra reviews Physiotherapy Session - 5 stars
    prisma.review.create({
      data: {
        userId: patient2.id,
        serviceId: servicePhysiotherapy.id,
        rating: 5,
        comment:
          "أخصائي العلاج الطبيعي كان خبيراً ومتعاطفاً. تحسنت حالتي بشكل ملحوظ بعد ثلاث جلسات فقط. الأجهزة المستخدمة حديثة والجو العام مريح.",
      },
    }),

    // Review 4: Fatima Zohra reviews Eye Exam & Correction - 4 stars
    prisma.review.create({
      data: {
        userId: patient2.id,
        serviceId: serviceEyeExam.id,
        rating: 4,
        comment:
          "فحص دقيق وشامل للنظر. الطبيبة كانت صبورة ومتأنية في الشرح. النظارات جاهزة في الوقت المحدد. خدمة ممتازة ونتائج مرضية.",
      },
    }),
  ]);

  console.log(`  ✓ Created 4 reviews\n`);

  // ─────────────────────────────────────────────
  // 7. MESSAGES (3 total)
  // ─────────────────────────────────────────────
  console.log("💬 Creating messages...");

  await Promise.all([
    // Message 1: Fatima Zohra asks Dr. Samira about her confirmed acne treatment booking
    prisma.message.create({
      data: {
        bookingId: booking2.id,
        senderId: patient2.id,
        content:
          "مرحباً دكتورة سميرة، هل أحتاج لإحضار أي تحاليل أو تقارير طبية سابقة قبل موعد الجلسة؟ وهل هناك تعليمات معينة يجب اتباعها قبل العلاج؟",
      },
    }),

    // Message 2: Dr. Samira responds
    prisma.message.create({
      data: {
        bookingId: booking2.id,
        senderId: provider2User.id,
        content:
          "أهلاً فاطمة الزهراء، لا تحتاجين لإحضار تحاليل سابقة. يُفضل تجنب وضع أي مستحضرات تجميل على الوجه يوم الجلسة، والتوقف عن استخدام العلاجات الموضعية لمدة 48 ساعة قبل الموعد. نلتقي قريباً إن شاء الله!",
      },
    }),

    // Message 3: Fatima Zohra asks about remote nutrition consultation
    prisma.message.create({
      data: {
        bookingId: booking4.id,
        senderId: patient2.id,
        content:
          "مرحباً، أنا من وهران وأود الاستفسار إمكانية إجراء الاستشارة الغذائية عن بُعد عبر الإنترنت بدلاً من الحضور شخصياً إلى الجزائر العاصمة.",
      },
    }),
  ]);

  console.log(`  ✓ Created 3 messages\n`);

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log("═".repeat(50));
  console.log("✅ Seed completed successfully!\n");
  console.log("📊 Summary:");
  console.log("   Users:      7");
  console.log("   Providers:  4");
  console.log("   Categories: 10");
  console.log("   Services:   12");
  console.log("   Bookings:   4");
  console.log("   Reviews:    4");
  console.log("   Messages:   3");
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
