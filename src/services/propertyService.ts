const API_BASE_URL = "/api/properties";

const authHeaders = { "Content-Type": "application/json" };

export interface Property {
  id?: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  image: string;
  description: string;
  type?: string;
  amenities?: string[];
  gallery?: string[];
  videoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

/** Property categories shown in filters and the admin form. */
export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "land",
  "commercial",
] as const;

export const getProperties = async (): Promise<Property[]> => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch properties");
    return await response.json();
  } catch (error) {
    console.error("Error getting properties:", error);
    return [];
  }
};

export const addProperty = async (
  property: Omit<Property, "id" | "createdAt" | "updatedAt">,
) => {
  try {
    const headers = authHeaders;
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(property),
    });
    if (!response.ok) throw new Error("Failed to add property");
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error adding property:", error);
  }
};

export const updateProperty = async (
  id: string,
  property: Partial<Property>,
) => {
  try {
    const headers = authHeaders;
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(property),
    });
    if (!response.ok) throw new Error("Failed to update property");
  } catch (error) {
    console.error("Error updating property:", error);
  }
};

export const deleteProperty = async (id: string) => {
  try {
    const headers = authHeaders;
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) throw new Error("Failed to delete property");
  } catch (error) {
    console.error("Error deleting property:", error);
  }
};

// Inquiries Service
export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  date?: string;
  notes?: string;
  propertyId?: string;
  createdAt?: any;
}

export const getInquiries = async (): Promise<Inquiry[]> => {
  try {
    const headers = authHeaders;
    const response = await fetch(`${API_BASE_URL}/inquiries`, { headers });
    if (!response.ok) throw new Error("Failed to fetch inquiries");
    return await response.json();
  } catch (error) {
    console.error("Error getting inquiries:", error);
    return [];
  }
};

export const addInquiry = async (
  inquiry: Omit<Inquiry, "id" | "createdAt">,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to send inquiry");
  }
};

export const deleteInquiry = async (id: string) => {
  try {
    const headers = authHeaders;
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) throw new Error("Failed to delete inquiry");
  } catch (error) {
    console.error("Error deleting inquiry:", error);
  }
};

export const seedProperties = async (
  properties: Omit<Property, "id" | "createdAt" | "updatedAt">[],
) => {
  try {
    const promises = properties.map((p) => addProperty(p));
    await Promise.all(promises);
  } catch (error) {
    console.error("Error seeding properties:", error);
  }
};

// Uploads an image/video file to Supabase Storage via the backend.
// Returns the public URL to store on the property/content record.
export const uploadMedia = async (file: File): Promise<string> => {
  const response = await fetch(
    `/api/uploads?filename=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    },
  );
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Upload failed");
  }
  const data = await response.json();
  return data.url;
};

// Media library — browse, rename, and delete uploaded files.
export interface MediaItem {
  id: string;
  name: string;
  path: string;
  url: string;
  kind: "image" | "video";
  size_bytes: number;
  created_at: string;
}

export const getMediaLibrary = async (): Promise<MediaItem[]> => {
  try {
    const headers = authHeaders;
    const response = await fetch("/api/uploads", { headers });
    if (!response.ok) throw new Error("Failed to fetch media library");
    return await response.json();
  } catch (error) {
    console.error("Error getting media library:", error);
    return [];
  }
};

export const renameMedia = async (id: string, name: string) => {
  const headers = authHeaders;
  const response = await fetch(`/api/uploads/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to rename media");
};

export const deleteMedia = async (id: string) => {
  const headers = authHeaders;
  const response = await fetch(`/api/uploads/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error("Failed to delete media");
};

// Content & Settings persisted in Supabase via /api/content.
const CONTENT_API_URL = "/api/content";

export interface SiteStat {
  label: string;
  value: string;
}

export const DEFAULT_ABOUT_CONTENT = {
  title: "ESAYAS ADAL",
  subtitle: "The Real Estate Agents",
  description: "",
  image: "",
  stats: [] as SiteStat[],
};

export const DEFAULT_SITE_SETTINGS = {
  siteName: "ESAYAS ADAL",
  contactEmail: "contact@esayasadal.com",
  contactPhone: "+251 911 234 567",
  officeAddress: "Bole Road, Friendship Business Center\nAddis Ababa, Ethiopia",
  socialLinks: {} as Record<string, string>,
  heroImageUrl:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920",
  // Real Addis Ababa city footage (Pixabay), looped behind the
  // home page hero. Falls back to heroImageUrl when empty.
  heroVideoUrl:
    "https://cdn.pixabay.com/video/2023/02/15/150831-799327500_large.mp4",
  stats: [
    { label: "Sales Volume", value: "ETB 2.5B+" },
    { label: "Properties Sold", value: "300+" },
    { label: "Client Satisfaction", value: "100%" },
    { label: "Years of Experience", value: "15+" },
  ] as SiteStat[],
};

const getContent = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const response = await fetch(`${CONTENT_API_URL}/${key}`);
    if (!response.ok) return fallback;
    const data = await response.json();
    if (!data || typeof data !== "object") return fallback;
    return { ...fallback, ...data };
  } catch (error) {
    console.error(`Error getting ${key} content:`, error);
    return fallback;
  }
};

const updateContent = async (key: string, value: unknown) => {
  const headers = authHeaders;
  const response = await fetch(`${CONTENT_API_URL}/${key}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`Failed to update ${key} content`);
};

export const getAboutContent = async () => {
  return getContent("about", DEFAULT_ABOUT_CONTENT);
};

export const updateAboutContent = async (content: any) => {
  await updateContent("about", content);
};

export const getSiteSettings = async () => {
  return getContent("settings", DEFAULT_SITE_SETTINGS);
};

export const updateSiteSettings = async (settings: any) => {
  await updateContent("settings", settings);
};
