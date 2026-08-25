import "dotenv/config";
import { supabaseAdmin, isSupabaseConfigured } from "./utils/supabase";

const TEST_PROPERTIES = [
  {
    title: "Bole Skyline Luxury Villa",
    location: "Bole, Addis Ababa",
    price: "ETB 85,000,000",
    beds: 5,
    baths: 6,
    sqft: "650",
    type: "villa",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
    description: "An extraordinary modern architectural villa minutes from Bole International Airport. Features an infinity terrace, private garden courtyard, backup solar generator, and luxury master suite with panoramic city views.",
    amenities: ["Rooftop Terrace", "Backup Generator", "Water Reservoir (10,000L)", "Smart Home Automation", "24/7 Security", "Staff Quarters", "Covered Parking for 4"],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687940-4e2a09695d51?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"
    ],
    video_url: "https://cdn.pixabay.com/video/2023/02/15/150831-799327500_large.mp4"
  },
  {
    title: "Old Airport Diplomatic Estate",
    location: "Old Airport, Addis Ababa",
    price: "ETB 140,000,000",
    beds: 6,
    baths: 7,
    sqft: "900",
    type: "villa",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
    description: "Nestled in the prestigious diplomatic quarter of Old Airport, this sprawling estate offers supreme privacy, manicured gardens, embassy-grade security, an expansive reception hall, and detached guest lodge.",
    amenities: ["Embassy-Grade Security", "Expansive Garden", "Detached Guest House", "Heated Swimming Pool", "CCTV & Laser Perimeters", "Solar Water Heating", "Wine Cellar"],
    gallery: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200"
    ],
    video_url: "https://www.youtube.com/watch?v=ScMzIvxBSi4"
  },
  {
    title: "Kazanchis Executive Duplex Penthouse",
    location: "Kazanchis, Addis Ababa",
    price: "ETB 62,000,000",
    beds: 4,
    baths: 5,
    sqft: "380",
    type: "apartment",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200",
    description: "A breathtaking top-floor duplex penthouse in the central financial district. Floor-to-ceiling glass reveals Addis Ababa's dramatic skyline, complemented by custom Italian marble interiors and private elevator key access.",
    amenities: ["Private Elevator Access", "Panoramic Skyline Views", "Italian Marble Finishes", "Gym & Spa Access", "Dedicated Concierge", "Underground Parking"],
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200"
    ],
    video_url: "https://cdn.pixabay.com/video/2023/02/15/150831-799327500_large.mp4"
  },
  {
    title: "CMC Modern Courtyard Residence",
    location: "CMC, Addis Ababa",
    price: "ETB 38,000,000",
    beds: 4,
    baths: 4,
    sqft: "350",
    type: "house",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
    description: "Contemporary G+2 home designed around a tranquil internal courtyard. Excellent natural lighting, bespoke kitchen cabinetry, rooftop social pavilion, and a quiet residential neighborhood.",
    amenities: ["Private Central Courtyard", "Rooftop Social Pavilion", "Modern Fitted Kitchen", "Backup Water & Power", "Quiet Residential Street"],
    gallery: [
      "https://images.unsplash.com/photo-1449156001437-3a1661dc926b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200"
    ],
    video_url: "https://cdn.pixabay.com/video/2023/02/15/150831-799327500_large.mp4"
  },
  {
    title: "Entoto Foothills Hilltop Estate",
    location: "Yeka / Entoto, Addis Ababa",
    price: "ETB 165,000,000",
    beds: 7,
    baths: 8,
    sqft: "1,200",
    type: "villa",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200",
    description: "An iconic luxury hilltop sanctuary surrounded by lush pine trees and mountain air. Includes a grand ballroom, private tennis court, infinity terrace, and separate staff quarters on a massive titled parcel.",
    amenities: ["1,500m² Titled Compound", "Mountain & City Views", "Tennis Court", "Guardhouse & Perimeter Walls", "High-Speed Fiber", "Private Borehole"],
    gallery: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1200"
    ],
    video_url: "https://www.youtube.com/watch?v=ScMzIvxBSi4"
  },
  {
    title: "Sarbet Prime Commercial Complex",
    location: "Sarbet, Addis Ababa",
    price: "ETB 210,000,000",
    beds: 0,
    baths: 12,
    sqft: "2,500",
    type: "commercial",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    description: "Brand new multi-story commercial building facing the main ring road. High rental yield potential, dedicated transformer, high-capacity passenger elevators, and underground parking for 30+ vehicles.",
    amenities: ["Prime Main Road Frontage", "30+ Underground Parking Spots", "Dedicated 500kVA Transformer", "Dual High-Speed Elevators", "Commercial Fire Suppression"],
    gallery: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200"
    ]
  }
];

const TEST_TESTIMONIALS = [
  {
    name: "Dr. Henok Tadesse",
    role: "Diaspora Investor, London",
    content: "Esayas Adal made purchasing our family villa in Bole completely stress-free from the UK. The transparency, legal verification, and personalized video walkthroughs were world-class.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Elena Rostova",
    role: "International Diplomat",
    content: "Finding an embassy-compliant residence in Addis Ababa was a challenge until we partnered with Esayas. His team curated only top-tier properties meeting all our security and lifestyle criteria.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Ato Dawit Bekele",
    role: "Managing Director, Skyline Group",
    content: "The level of discretion and market intelligence Esayas brings to prime commercial and luxury residential transactions in Ethiopia is unmatched. Highly recommended.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
  }
];

const DEFAULT_ABOUT = {
  title: "ESAYAS ADAL",
  subtitle: "Luxury Real Estate Advisor & Consultant",
  description: `With over 15 years of distinguished leadership in the Ethiopian high-end property market, Esayas Adal specializes in connecting discerning private clients, diaspora investors, and international diplomats with the finest residences and investment opportunities in Addis Ababa.\n\nFrom grand diplomatic estates in Old Airport and hilltop sanctuaries overlooking Entoto, to luxury sky penthouses in Bole and Kazanchis, every portfolio listing is vetted for architectural excellence, clear legal title, and high capital appreciation.`,
  image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1200"
};

const DEFAULT_SETTINGS = {
  siteName: "ESAYAS ADAL",
  contactEmail: "info@esayas.com",
  contactPhone: "+251 911 000 000",
  officeLocation: "Bole Medhanialem, Addis Ababa, Ethiopia",
  heroVideoUrl: "https://cdn.pixabay.com/video/2023/02/15/150831-799327500_large.mp4",
  heroImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600"
};

async function runSeed() {
  console.log("=========================================");
  console.log("  SEEDING SUPABASE DATABASE WITH TEST DATA");
  console.log("=========================================\n");

  if (!isSupabaseConfigured) {
    console.error("❌ Supabase is not configured! Check your .env file.");
    process.exit(1);
  }

  console.log("Connected to Supabase URL:", process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);

  // 1. Seed Properties
  console.log("\n🏡 Seeding Properties...");
  for (const prop of TEST_PROPERTIES) {
    const { data, error } = await supabaseAdmin
      .from("properties")
      .insert({
        ...prop,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id, title")
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert property "${prop.title}":`, error.message);
    } else {
      console.log(`  ✓ Inserted property: "${data.title}" (ID: ${data.id})`);
    }
  }

  // 2. Seed Testimonials
  console.log("\n⭐ Seeding Testimonials...");
  for (const test of TEST_TESTIMONIALS) {
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .insert({
        ...test,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id, name")
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert testimonial from "${test.name}":`, error.message);
    } else {
      console.log(`  ✓ Inserted testimonial: "${data.name}" (ID: ${data.id})`);
    }
  }

  // 3. Seed Site Content (About & Settings)
  console.log("\n📝 Seeding Site Content (About & Settings)...");
  const { error: aboutErr } = await supabaseAdmin
    .from("site_content")
    .upsert({
      key: "about",
      value: DEFAULT_ABOUT,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });

  if (aboutErr) {
    console.error("  ❌ Failed to upsert about content:", aboutErr.message);
  } else {
    console.log("  ✓ Upserted 'about' section content");
  }

  const { error: settingsErr } = await supabaseAdmin
    .from("site_content")
    .upsert({
      key: "settings",
      value: DEFAULT_SETTINGS,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });

  if (settingsErr) {
    console.error("  ❌ Failed to upsert site settings:", settingsErr.message);
  } else {
    console.log("  ✓ Upserted 'settings' section content");
  }

  // 4. Seed Inquiries
  console.log("\n📬 Seeding Inquiries...");
  const TEST_INQUIRIES = [
    {
      name: "Tewodros Kassahun",
      email: "teddy.k@gmail.com",
      phone: "+251 911 345 678",
      date: "2026-08-28",
      notes: "Looking for an exclusive diplomatic residence in Old Airport. Need high security perimeter and staff quarters.",
      created_at: new Date().toISOString(),
    },
    {
      name: "Bethlehem Tilahun",
      email: "bethlehem@solerebels.com",
      phone: "+251 912 889 900",
      date: "2026-08-30",
      notes: "Interested in the Kazanchis Executive Duplex Penthouse. Please send detailed floorplans and HOA documents.",
      created_at: new Date().toISOString(),
    },
  ];

  for (const inq of TEST_INQUIRIES) {
    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .insert(inq)
      .select("id, name")
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert inquiry from "${inq.name}":`, error.message);
    } else {
      console.log(`  ✓ Inserted inquiry: "${data.name}" (ID: ${data.id})`);
    }
  }

  console.log("\n🎉 Seeding completed successfully!");
}

runSeed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
