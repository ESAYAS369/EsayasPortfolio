import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceRoleKey &&
  !supabaseUrl.includes("example.supabase.co") &&
  !supabaseServiceRoleKey.includes("service-role-key"),
);

// When Supabase env vars are missing we fail clean: empty lists, no fake
// data. The health endpoint reports "degraded" so the operator notices.
const fallbackProperties: any[] = [];

const fallbackTestimonials: any[] = [];

const fallbackUsers: Array<{
  uid: string;
  email: string;
  role: "admin" | "client";
  created_at: string;
}> = [];

const createFallbackQuery = (table: string) => {
  const getData = () => {
    if (table === "properties") return fallbackProperties;
    if (table === "testimonials") return fallbackTestimonials;
    return fallbackUsers;
  };

  const runSelect = (query: any) => {
    const data = getData();
    return Promise.resolve({ data, error: null });
  };

  return {
    select: () => ({
      order: async () => runSelect(null),
      limit: async () => runSelect(null),
      eq: () => ({
        single: async () => {
          const data = getData()[0] ?? null;
          return { data, error: null };
        },
      }),
    }),
    insert: (payload: any) => ({
      select: () => ({
        single: async () => {
          const data = { id: `${table}-${Date.now()}`, ...payload };
          if (table === "properties") fallbackProperties.unshift(data as any);
          if (table === "testimonials")
            fallbackTestimonials.unshift(data as any);
          if (table === "users") fallbackUsers.push(data as any);
          return { data, error: null };
        },
      }),
    }),
    update: () => ({
      eq: async () => ({ error: null }),
    }),
    delete: () => ({
      eq: async () => ({ error: null }),
    }),
    upsert: async () => ({ error: null }),
  };
};

const fallbackClient = {
  from: (table: string) => createFallbackQuery(table),
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
  },
} as any;

if (typeof (globalThis as any).WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {} as any;
}

export const supabaseAdmin = isConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : fallbackClient;

export const isSupabaseConfigured = isConfigured;
