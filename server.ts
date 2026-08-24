import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { rateLimit } from "express-rate-limit";
import propertyRoutes from "./server/routes/properties";
import testimonialRoutes from "./server/routes/testimonials";
import chatRoutes from "./server/routes/chat";
import contentRoutes from "./server/routes/content";
import uploadRoutes from "./server/routes/uploads";
import authRoutes from "./server/routes/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { supabaseAdmin } from "./server/utils/supabase";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === "production";

  // Behind a reverse proxy (Render/Railway/Cloud Run/nginx) the client IP
  // arrives in X-Forwarded-For; trust the first hop so rate limits key on
  // the real visitor IP instead of the proxy's.
  if (isProduction) app.set("trust proxy", 1);

  // Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              // Tailwind and motion inject inline styles at runtime.
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "blob:", "https:"],
              mediaSrc: ["'self'", "blob:", "https:"],
              connectSrc: ["'self'", "https://*.supabase.co"],
              frameAncestors: ["'self'"],
            },
          }
        : false,
    }),
  );

  // Same-origin app: only allow cross-origin calls from the configured URL.
  const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
  const allowedOrigins = appUrl && !/MY_APP_URL/i.test(appUrl) ? [appUrl] : [];
  app.use(
    cors({
      origin: isProduction && allowedOrigins.length > 0 ? allowedOrigins : true,
    }),
  );

  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));

  // Rate limits: general API guard plus strict caps on the two public,
  // abuse-prone endpoints (Gemini cost, inquiry spam).
  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many chat messages. Please wait a moment." },
  });
  const inquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many inquiries from this connection. Please try again later." },
  });
  app.use("/api", generalLimiter);
  app.use("/api/chat", chatLimiter);
  app.use("/api/properties/inquiries", (req, res, next) =>
    req.method === "POST" ? inquiryLimiter(req, res, next) : next(),
  );

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api/testimonials", testimonialRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/uploads", uploadRoutes);

  // Health check — 503 when degraded so load balancers can react;
  // internal error details stay in the server log only.
  app.get("/api/health", async (_req, res) => {
    try {
      const { error } = await supabaseAdmin
        .from("properties")
        .select("id")
        .limit(1);
      if (error) console.error("Health check degraded:", error.message);
      res.status(error ? 503 : 200).json({
        status: error ? "degraded" : "ok",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Health check error:", error?.message ?? error);
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Vite middleware for development; static dist/ for production.
  if (process.env.NODE_ENV !== "production") {
    // Dynamic import so `vite` can stay a devDependency and is never
    // loaded on a production host.
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global error handler: always JSON, never an HTML stack-trace page.
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (err?.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Malformed JSON body" });
      }
      if (err?.type === "entity.too.large") {
        return res.status(413).json({ error: "Request body too large" });
      }
      console.error("Unhandled request error:", err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Last-resort guards: log instead of crashing the whole process.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
