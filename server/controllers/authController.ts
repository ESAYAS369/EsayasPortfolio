import { Request, Response } from "express";
import crypto from "crypto";
import { supabaseAdmin, isSupabaseConfigured } from "../utils/supabase";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@esayas.com").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Esayas Adal";
const AUTH_SECRET = process.env.AUTH_SECRET || "esayas-luxury-portfolio-secret-key-2026";

// Simple signature generator for stateless secure session token
function createToken(payload: { email: string; role: string; exp: number }) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { email: string; role: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch (error) {
    return null;
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, username, password, rememberMe } = req.body;
    const inputIdentifier = (email || username || "").toString().toLowerCase().trim();
    const inputPassword = (password || "").toString();

    if (!inputIdentifier || !inputPassword) {
      return res.status(400).json({ error: "Email/username and password are required." });
    }

    let authenticated = false;
    let userEmail = ADMIN_EMAIL;
    let userName = ADMIN_NAME;

    // 1. If Supabase is configured, try Supabase Auth first
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: inputIdentifier,
          password: inputPassword,
        });

        if (!error && data?.user) {
          authenticated = true;
          userEmail = data.user.email || inputIdentifier;
          userName = data.user.user_metadata?.full_name || ADMIN_NAME;
        }
      } catch (sbErr) {
        // Fallback to local admin credentials check if Supabase fails
      }
    }

    // 2. Check local configured admin credentials
    if (!authenticated) {
      const isEmailMatch =
        inputIdentifier === ADMIN_EMAIL ||
        inputIdentifier === "admin" ||
        inputIdentifier === "admin@esayas.com";
      const isPasswordMatch = inputPassword === ADMIN_PASSWORD;

      if (isEmailMatch && isPasswordMatch) {
        authenticated = true;
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your email and password." });
    }

    // Expiration: 30 days if rememberMe, otherwise 24 hours
    const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const exp = Date.now() + duration;

    const token = createToken({
      email: userEmail,
      role: "admin",
      exp,
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        email: userEmail,
        name: userName,
        role: "admin",
      },
      expiresAt: new Date(exp).toISOString(),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error during authentication." });
  }
};

export const verifySession = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header." });
    }

    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);

    if (!payload || payload.role !== "admin") {
      return res.status(401).json({ error: "Invalid or expired session token." });
    }

    return res.status(200).json({
      valid: true,
      user: {
        email: payload.email,
        name: ADMIN_NAME,
        role: payload.role,
      },
    });
  } catch (error: any) {
    console.error("Session verification error:", error);
    return res.status(500).json({ error: "Failed to verify session." });
  }
};

export const logout = async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Logged out successfully." });
};
