import { Request, Response } from "express";
import { supabaseAdmin } from "../utils/supabase";

const CONTENT_TABLE = "site_content";
const ALLOWED_KEYS = ["about", "settings"];

const contentCache: Record<string, any> = {
  about: {
    title: "ESAYAS ADAL",
    subtitle: "Luxury Real Estate Advisor & Consultant",
    description: "With over 15 years of distinguished leadership in the Ethiopian high-end property market, Esayas Adal specializes in connecting discerning private clients, diaspora investors, and international diplomats with the finest residences and investment opportunities in Addis Ababa.\n\nFrom grand diplomatic estates in Old Airport and hilltop sanctuaries overlooking Entoto, to luxury sky penthouses in Bole and Kazanchis, every portfolio listing is vetted for architectural excellence, clear legal title, and high capital appreciation.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1200",
  },
  settings: {
    siteName: "ESAYAS ADAL",
    contactEmail: "info@esayas.com",
    contactPhone: "+251 911 000 000",
    officeLocation: "Bole Medhanialem, Addis Ababa, Ethiopia",
    heroVideoUrl: "https://cdn.pixabay.com/video/2023/02/15/150831-799327500_large.mp4",
    heroImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600",
  },
};

export const getContent = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(404).json({ error: "Unknown content key" });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from(CONTENT_TABLE)
        .select("*")
        .eq("key", key)
        .single();

      if (!error && data?.value) {
        contentCache[key] = { ...contentCache[key], ...data.value };
      }
    } catch (sbErr) {
      console.warn(`Supabase get ${key} notice:`, sbErr);
    }

    res.json(contentCache[key] ?? null);
  } catch (error) {
    console.error("Error getting site content:", error);
    res.status(500).json({ error: "Failed to fetch site content" });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(404).json({ error: "Unknown content key" });
    }
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Content body is required" });
    }
    // Cap payload size and keep link fields to http(s) URLs only, so a
    // stored javascript: URL can never end up in an <a href>.
    if (JSON.stringify(req.body).length > 100_000) {
      return res.status(413).json({ error: "Content body too large" });
    }
    const value = { ...req.body } as Record<string, any>;
    if (value.socialLinks && typeof value.socialLinks === "object") {
      const cleaned: Record<string, string> = {};
      for (const [platform, href] of Object.entries(value.socialLinks)) {
        if (typeof href === "string" && /^https?:\/\//i.test(href.trim())) {
          cleaned[platform] = href.trim().slice(0, 500);
        }
      }
      value.socialLinks = cleaned;
    }
    for (const field of ["heroImageUrl", "heroVideoUrl", "membershipImageUrl", "image"]) {
      if (typeof value[field] === "string" && value[field] && !/^https?:\/\//i.test(value[field].trim())) {
        value[field] = "";
      }
    }

    // 1. Update cache immediately
    contentCache[key] = { ...contentCache[key], ...value };

    // 2. Persist in Supabase
    try {
      const { error } = await supabaseAdmin.from(CONTENT_TABLE).upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
      if (error) {
        console.warn(`Supabase ${key} update notice:`, error.message);
      }
    } catch (sbErr: any) {
      console.warn(`Supabase ${key} update error:`, sbErr.message);
    }

    res.json({ success: true, value: contentCache[key] });
  } catch (error) {
    console.error("Error updating site content:", error);
    res.status(500).json({ error: "Failed to update site content" });
  }
};
