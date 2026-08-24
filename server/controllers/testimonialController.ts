import { Request, Response } from "express";
import { supabaseAdmin } from "../utils/supabase";
import { Testimonial } from "../models/Testimonial";

const TESTIMONIALS_TABLE = "testimonials";

/** Whitelists known columns so stray client keys can't break inserts. */
const toTestimonialRow = (t: Partial<Testimonial> & Record<string, any>) => {
  const row: Record<string, any> = {};
  if (t.name !== undefined) row.name = String(t.name).slice(0, 120);
  if (t.role !== undefined) row.role = String(t.role).slice(0, 120);
  if (t.content !== undefined) row.content = String(t.content).slice(0, 2000);
  if (t.image !== undefined) row.image = t.image ? String(t.image).slice(0, 500) : null;
  if (t.rating !== undefined) {
    const rating = Number(t.rating);
    row.rating = Number.isFinite(rating)
      ? Math.min(5, Math.max(1, Math.round(rating)))
      : 5;
  }
  return row;
};

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TESTIMONIALS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json((data || []).map((item: any) => ({ id: item.id, ...item })));
  } catch (error) {
    console.error("Error getting testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

export const addTestimonial = async (req: Request, res: Response) => {
  try {
    const testimonial: Testimonial = req.body;
    const { data, error } = await supabaseAdmin
      .from(TESTIMONIALS_TABLE)
      .insert({
        ...toTestimonialRow(testimonial),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ id: data.id, ...testimonial });
  } catch (error) {
    console.error("Error adding testimonial:", error);
    res.status(500).json({ error: "Failed to add testimonial" });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testimonial: Partial<Testimonial> = req.body;
    const { error } = await supabaseAdmin
      .from(TESTIMONIALS_TABLE)
      .update({
        ...toTestimonialRow(testimonial),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    res.json({ id, ...testimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from(TESTIMONIALS_TABLE)
      .delete()
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
};
