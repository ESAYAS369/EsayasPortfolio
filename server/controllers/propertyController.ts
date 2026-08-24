import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "../utils/supabase";
import { Property, Inquiry } from "../models/Property";

const PROPERTIES_TABLE = "properties";
const INQUIRIES_TABLE = "inquiries";

const PROPERTY_TYPES = ["apartment", "house", "villa", "land", "commercial"];

let emailTransporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (emailTransporter) return emailTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  if (!host || !user || !pass) return null;
  emailTransporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return emailTransporter;
};

/**
 * Maps a client payload to DB columns. Whitelists known fields so stray
 * keys (id, createdAt, camelCase variants) can't break the insert/update.
 */
const toPropertyRow = (property: Partial<Property> & Record<string, any>) => {
  const row: Record<string, any> = {};
  if (property.title !== undefined) row.title = property.title;
  if (property.location !== undefined) row.location = property.location;
  if (property.price !== undefined) row.price = property.price;
  if (property.beds !== undefined) row.beds = property.beds;
  if (property.baths !== undefined) row.baths = property.baths;
  if (property.sqft !== undefined) row.sqft = property.sqft;
  if (property.image !== undefined) row.image = property.image;
  if (property.description !== undefined) row.description = property.description;
  if (property.amenities !== undefined) row.amenities = property.amenities;
  if (property.gallery !== undefined) row.gallery = property.gallery;
  const videoUrl = property.videoUrl ?? property.video_url;
  if (videoUrl !== undefined) row.video_url = videoUrl;
  if (property.type !== undefined) {
    row.type = PROPERTY_TYPES.includes(property.type as string)
      ? property.type
      : null;
  }
  return row;
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(PROPERTIES_TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(
      (data || []).map((item: any) => ({
        ...item,
        id: item.id,
        videoUrl: item.video_url ?? undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
    );
  } catch (error) {
    console.error("Error getting properties:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const addProperty = async (req: Request, res: Response) => {
  try {
    const property: Property = req.body;
    const { data, error } = await supabaseAdmin
      .from(PROPERTIES_TABLE)
      .insert({
        ...toPropertyRow(property),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ id: data.id, ...property });
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ error: "Failed to add property" });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property: Partial<Property> = req.body;
    const { error } = await supabaseAdmin
      .from(PROPERTIES_TABLE)
      .update({
        ...toPropertyRow(property),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    res.json({ id, ...property });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from(PROPERTIES_TABLE)
      .delete()
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
};

export const addInquiry = async (req: Request, res: Response) => {
  try {
    const inquiry: Inquiry & Record<string, any> = req.body ?? {};

    // Validate required fields and cap lengths — this endpoint is public.
    const name = typeof inquiry.name === "string" ? inquiry.name.trim() : "";
    const email = typeof inquiry.email === "string" ? inquiry.email.trim() : "";
    const phone = typeof inquiry.phone === "string" ? inquiry.phone.trim() : "";
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ error: "Name, email and phone are required" });
    }
    if (
      name.length > 120 ||
      email.length > 200 ||
      phone.length > 40 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({ error: "Invalid inquiry fields" });
    }

    // Whitelist columns; client uses propertyId, DB column is property_id.
    const row: Record<string, any> = {
      name,
      email,
      phone,
      created_at: new Date().toISOString(),
    };
    if (typeof inquiry.date === "string" && inquiry.date.length <= 40) {
      row.date = inquiry.date;
    }
    if (typeof inquiry.notes === "string" && inquiry.notes.trim()) {
      row.notes = inquiry.notes.trim().slice(0, 2000);
    }
    const propertyId = inquiry.propertyId ?? inquiry.property_id;
    if (typeof propertyId === "string" && propertyId.length <= 100) {
      row.property_id = propertyId;
    }

    // Try to save to Supabase, but don't block the response if it fails.
    let savedInquiry = null;
    try {
      const { data, error } = await supabaseAdmin
        .from(INQUIRIES_TABLE)
        .insert(row)
        .select()
        .single();
      if (!error) savedInquiry = data;
    } catch (dbErr) {
      console.error("Supabase insert error:", dbErr);
    }

    // Always try to send email notification to admin.
    try {
      const transporter = getTransporter();
      const adminEmail = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || "";
      if (transporter && adminEmail) {
        const siteName = process.env.SITE_NAME || "ESAYAS ADAL";
        void transporter
          .sendMail({
            from: `"${siteName}" <${adminEmail}>`,
            to: adminEmail,
            subject: `New Inquiry from ${name}`,
            text: `A new inquiry has been received.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}${row.date ? `\nDate: ${row.date}` : ""}${row.notes ? `\nNotes: ${row.notes}` : ""}${row.property_id ? `\nProperty ID: ${row.property_id}` : ""}`,
          })
          .catch((err) => console.error("Email send error:", err.message));
      }
    } catch {
      /* email failure should not block the inquiry */
    }

    res.status(201).json({ id: savedInquiry?.id ?? row.created_at, ...row });
  } catch (error) {
    console.error("Error adding inquiry:", error);
    res.status(500).json({ error: "Failed to add inquiry" });
  }
};

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(INQUIRIES_TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json((data || []).map((item: any) => ({ id: item.id, ...item })));
  } catch (error) {
    console.error("Error getting inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
};

export const deleteInquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from(INQUIRIES_TABLE)
      .delete()
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
};
