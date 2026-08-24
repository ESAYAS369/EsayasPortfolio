import { Request, Response } from "express";
import { supabaseAdmin } from "../utils/supabase";

const CONTENT_TABLE = "site_content";
const ALLOWED_KEYS = ["about", "settings"];

export const getContent = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(404).json({ error: "Unknown content key" });
    }

    const { data, error } = await supabaseAdmin
      .from(CONTENT_TABLE)
      .select("*")
      .eq("key", key)
      .single();

    if (error) {
      // No row yet — the client falls back to its defaults.
      if (error.code === "PGRST116") return res.json(null);
      throw error;
    }
    res.json(data?.value ?? null);
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

    const { error } = await supabaseAdmin.from(CONTENT_TABLE).upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating site content:", error);
    res.status(500).json({ error: "Failed to update site content" });
  }
};
