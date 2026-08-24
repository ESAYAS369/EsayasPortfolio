import { Request, Response } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../utils/supabase";

const BUCKET = "media";
const MEDIA_TABLE = "media";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

let bucketReady = false;

const ensureBucket = async () => {
  if (bucketReady) return;
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
  });
  // "already exists" is fine; anything else propagates on first upload.
  if (error && !`${error.message}`.toLowerCase().includes("already")) {
    throw error;
  }
  bucketReady = true;
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured) {
      return res
        .status(503)
        .json({ error: "File uploads require Supabase to be configured" });
    }

    const body = req.body as Buffer;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      return res.status(400).json({ error: "No file data received" });
    }

    const contentType = req.headers["content-type"] || "application/octet-stream";
    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");
    if (!isImage && !isVideo) {
      return res
        .status(400)
        .json({ error: "Only image and video files are allowed" });
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (body.length > maxBytes) {
      return res.status(413).json({
        error: `File too large. Max ${isVideo ? "100MB for videos" : "15MB for images"}.`,
      });
    }

    const rawName = String(req.query.filename || "upload");
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const folder = isVideo ? "videos" : "images";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    await ensureBucket();

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, body, { contentType, upsert: false });
    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    // Record in the media library table so uploads can be browsed,
    // renamed, and deleted from the admin page.
    const { data: record, error: dbError } = await supabaseAdmin
      .from(MEDIA_TABLE)
      .insert({
        name: rawName,
        path,
        url: publicUrl,
        kind: isVideo ? "video" : "image",
        size_bytes: body.length,
      })
      .select()
      .single();
    if (dbError) {
      console.error("Media record insert failed:", dbError);
    }

    res.status(201).json({
      url: publicUrl,
      path,
      id: record?.id ?? null,
      kind: isVideo ? "video" : "image",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload file" });
  }
};

export const listMedia = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(MEDIA_TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (error: any) {
    console.error("Error listing media:", error);
    res.status(500).json({ error: "Failed to list media" });
  }
};

export const updateMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const { error } = await supabaseAdmin
      .from(MEDIA_TABLE)
      .update({ name: name.trim() })
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating media:", error);
    res.status(500).json({ error: "Failed to update media" });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: record, error: fetchError } = await supabaseAdmin
      .from(MEDIA_TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError || !record) {
      return res.status(404).json({ error: "Media not found" });
    }

    // Remove the file from storage first, then the DB record.
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([record.path]);
    if (storageError) {
      console.error("Storage delete failed:", storageError);
    }

    const { error } = await supabaseAdmin
      .from(MEDIA_TABLE)
      .delete()
      .eq("id", id);
    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
};
