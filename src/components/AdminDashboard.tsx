import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  MapPin,
  Bed,
  Bath,
  Square,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Home,
  MessageSquare,
  Info,
  Settings,
  UserCircle,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Star,
  Quote,
  Upload,
  Search,
  Menu as MenuIcon,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { logoutAdmin, getCurrentUser } from "../services/authService";
import {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  seedProperties,
  getInquiries,
  deleteInquiry,
  getAboutContent,
  updateAboutContent,
  getSiteSettings,
  updateSiteSettings,
  uploadMedia,
  getMediaLibrary,
  renameMedia,
  deleteMedia,
  MediaItem,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_SITE_SETTINGS,
  Property,
  Inquiry,
  PROPERTY_TYPES,
} from "../services/propertyService";
import {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  Testimonial,
} from "../services/testimonialService";

type Tab =
  | "dashboard"
  | "properties"
  | "inquiries"
  | "testimonials"
  | "media"
  | "about"
  | "settings";

const INITIAL_PROPERTIES: Property[] = [
  {
    title: "Bole Skyline Villa",
    location: "Bole, Addis Ababa",
    price: "ETB 85,000,000",
    beds: 5,
    baths: 6,
    sqft: "650",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
    description:
      "A modern architectural villa minutes from Bole International Airport, with a rooftop terrace and landscaped compound.",
    amenities: [
      "Rooftop Terrace",
      "Backup Generator",
      "Water Reservoir",
      "Smart Home System",
      "24/7 Security",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600607687940-4e2a09695d51?auto=format&fit=crop&q=80&w=800",
    ],
  },
  {
    title: "Old Airport Garden Residence",
    location: "Old Airport, Addis Ababa",
    price: "ETB 120,000,000",
    beds: 6,
    baths: 7,
    sqft: "850",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    description:
      "An elegant residence in the diplomatic quarter with a mature garden compound and guest wing.",
    amenities: [
      "Landscaped Garden",
      "Staff Quarters",
      "Guest Wing",
      "Double Garage",
      "Guard House",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?auto=format&fit=crop&q=80&w=800",
    ],
  },
  {
    title: "Summit Modern Family Home",
    location: "Summit, Addis Ababa",
    price: "ETB 45,000,000",
    beds: 4,
    baths: 4,
    sqft: "400",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800",
    description: "A contemporary G+2 family home in the fast-growing Summit area.",
    amenities: [
      "Fitted Kitchen",
      "Courtyard",
      "Backup Generator",
      "Study Room",
      "Parking for 3 Cars",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800",
    ],
  },
  {
    title: "CMC Courtyard House",
    location: "CMC, Addis Ababa",
    price: "ETB 32,000,000",
    beds: 3,
    baths: 3,
    sqft: "300",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    description: "A light-filled home built around a private courtyard in CMC.",
    amenities: [
      "Private Courtyard",
      "Water Tank",
      "Solar Water Heater",
      "Tiled Compound",
      "Service Quarter",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1449156001437-3a1661dc926b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800",
    ],
  },
  {
    title: "Entoto View Estate",
    location: "Ayat, Addis Ababa",
    price: "ETB 150,000,000",
    beds: 8,
    baths: 9,
    sqft: "1,200",
    image:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800",
    description:
      "A sprawling estate on a large titled plot with views toward the Entoto mountains.",
    amenities: [
      "Mountain Views",
      "Grand Reception Hall",
      "Home Office Wing",
      "Large Titled Plot",
      "Staff Quarters",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=800",
    ],
  },
  {
    title: "Kazanchis Luxury Penthouse",
    location: "Kazanchis, Addis Ababa",
    price: "ETB 60,000,000",
    beds: 4,
    baths: 5,
    sqft: "350",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    description: "A duplex penthouse in the Kazanchis business district.",
    amenities: [
      "City Views",
      "Private Roof Lounge",
      "Elevator",
      "Basement Parking",
      "24/7 Security",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800",
    ],
  },
];

// Small "upload from computer" button that uploads to Supabase Storage
// and hands back the public URL.
function UploadButton({
  accept,
  onUploaded,
  onError,
  label = "Upload",
}: {
  accept: string;
  onUploaded: (url: string) => void;
  onError: (message: string) => void;
  label?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadMedia(file);
      onUploaded(url);
    } catch (err: any) {
      onError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 hover:border-gold text-white/70 hover:text-gold px-4 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        {isUploading ? "Uploading..." : label}
      </button>
    </>
  );
}

export default function AdminDashboard({
  onClose,
  onLogout,
  initialTab = "dashboard",
}: {
  onClose: () => void;
  onLogout?: () => void;
  initialTab?: Tab;
}) {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [renamingMediaId, setRenamingMediaId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [aboutContent, setAboutContent] = useState<any>(DEFAULT_ABOUT_CONTENT);
  const [siteSettings, setSiteSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState(false);
  const [currentProperty, setCurrentProperty] =
    useState<Partial<Property> | null>(null);
  const [currentTestimonial, setCurrentTestimonial] =
    useState<Partial<Testimonial> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [props, inqs, about, settings, tests, media] = await Promise.all([
        getProperties(),
        getInquiries(),
        getAboutContent(),
        getSiteSettings(),
        getTestimonials(),
        getMediaLibrary(),
      ]);
      setProperties(props);
      setInquiries(inqs);
      setTestimonials(tests);
      setMediaItems(media);
      setAboutContent(about || DEFAULT_ABOUT_CONTENT);
      setSiteSettings(settings || DEFAULT_SITE_SETTINGS);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMedia = async () => {
    setMediaItems(await getMediaLibrary());
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    if (
      !window.confirm(
        `Delete "${item.name}"? The file is removed from storage; anywhere it is used on the site will stop displaying it.`,
      )
    )
      return;
    try {
      await deleteMedia(item.id);
      setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
      setMessage({ type: "success", text: "File deleted" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to delete file" });
    }
  };

  const handleRenameMedia = async (item: MediaItem) => {
    const name = renameValue.trim();
    setRenamingMediaId(null);
    if (!name || name === item.name) return;
    try {
      await renameMedia(item.id, name);
      setMediaItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, name } : m)),
      );
      setMessage({ type: "success", text: "File renamed" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to rename file" });
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAboutContent(aboutContent);
      setMessage({ type: "success", text: "About content updated" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update about content" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSiteSettings(siteSettings);
      setMessage({ type: "success", text: "Settings updated" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await deleteInquiry(id);
      setInquiries(inquiries.filter((i) => i.id !== id));
      setMessage({ type: "success", text: "Inquiry deleted" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete inquiry" });
    }
  };

  const renderSidebar = () => (
    <>
      {/* Mobile overlay behind the sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-dark/80 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-dark lg:bg-dark/50 backdrop-blur-xl flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      <div className="p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gold p-1.5 rounded-lg">
              <Home className="w-5 h-5 text-dark" />
            </div>
            <div className="text-lg font-serif tracking-widest">{t("admin")}</div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-white/40 hover:text-gold"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {[
            { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
            { id: "properties", label: t("properties"), icon: Home },
            { id: "inquiries", label: t("inquiries"), icon: MessageSquare },
            { id: "testimonials", label: "Testimonials", icon: Quote },
            { id: "media", label: "Media", icon: ImageIcon },
            { id: "about", label: t("about_content"), icon: Info },
            { id: "settings", label: t("settings"), icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-medium transition-all ${
                activeTab === item.id
                  ? "bg-gold text-dark"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30 shrink-0">
            <UserCircle className="w-5 h-5 text-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white truncate">
              {currentUser?.name || "Administrator"}
            </div>
            <div className="text-[10px] text-gold/80 uppercase tracking-wider truncate">
              {currentUser?.email || "admin@esayas.com"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>{t("view_website")}</span>
        </button>

        <button
          type="button"
          onClick={async () => {
            await logoutAdmin();
            if (onLogout) onLogout();
            else window.location.href = "/";
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t("sign_out")}</span>
        </button>
      </div>

      </aside>
    </>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t("total_listings"), value: properties.length, icon: Home },
          {
            label: t("new_inquiries"),
            value: inquiries.length,
            icon: MessageSquare,
          },
          { label: t("site_views"), value: "1,240", icon: Globe },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gold/10 rounded-xl">
                <stat.icon className="w-6 h-6 text-gold" />
              </div>
              <span className="text-green-500 text-[10px] uppercase tracking-widest font-bold">
                +12%
              </span>
            </div>
            <div className="text-3xl font-serif mb-1">{stat.value}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h3 className="text-lg font-serif mb-6 uppercase tracking-widest">
            {t("recent_inquiries")}
          </h3>
          <div className="space-y-4">
            {inquiries.slice(0, 5).map((inquiry) => (
              <div
                key={inquiry.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
              >
                <div>
                  <div className="text-sm font-medium">{inquiry.name}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">
                    {inquiry.email}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className="text-gold hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className="text-white/20 text-xs italic">No inquiries yet.</p>
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5">
          <h3 className="text-lg font-serif mb-6 uppercase tracking-widest">
            {t("quick_actions")}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab("properties")}
              className="p-6 bg-white/5 rounded-xl hover:bg-gold/10 transition-all text-left group"
            >
              <Plus className="w-6 h-6 text-gold mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs uppercase tracking-widest font-bold">
                {t("add_property")}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className="p-6 bg-white/5 rounded-xl hover:bg-gold/10 transition-all text-left group"
            >
              <Settings className="w-6 h-6 text-gold mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs uppercase tracking-widest font-bold">
                {t("site_settings")}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInquiries = () => (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">
              {t("client")}
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">
              {t("contact")}
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">
              {t("date")}
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">
              {t("message")}
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">
              {t("actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-medium">{inquiry.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-xs text-white/60">{inquiry.email}</div>
                <div className="text-[10px] text-white/40">{inquiry.phone}</div>
              </td>
              <td className="px-6 py-4 text-xs text-white/60">
                {inquiry.createdAt?.toDate
                  ? inquiry.createdAt.toDate().toLocaleDateString()
                  : "Recent"}
              </td>
              <td className="px-6 py-4">
                <p className="text-xs text-white/40 line-clamp-1 max-w-xs">
                  {inquiry.notes || "No notes provided"}
                </p>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleDeleteInquiry(inquiry.id!)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {inquiries.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-white/20 italic"
              >
                No inquiries found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
  };

  const renderMediaLibrary = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-serif">Media Library</h3>
          <p className="text-white/40 text-xs mt-1">
            {mediaItems.length} file{mediaItems.length === 1 ? "" : "s"} — click
            a URL to copy it, then paste it into any property, about, or
            settings field.
          </p>
        </div>
        <div className="flex gap-2">
          <UploadButton
            accept="image/*"
            label="Upload Image"
            onUploaded={() => {
              void refreshMedia();
              setMessage({ type: "success", text: "Image uploaded" });
            }}
            onError={(text) => setMessage({ type: "error", text })}
          />
          <UploadButton
            accept="video/*"
            label="Upload Video"
            onUploaded={() => {
              void refreshMedia();
              setMessage({ type: "success", text: "Video uploaded" });
            }}
            onError={(text) => setMessage({ type: "error", text })}
          />
        </div>
      </div>

      {mediaItems.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 p-16 text-center text-white/40 text-sm">
          No uploads yet. Use the buttons above to upload images and videos
          from your computer.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl border border-white/5 overflow-hidden group"
            >
              <div className="aspect-square bg-black/40 relative">
                {item.kind === "image" ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseEnter={(e) => void e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                )}
                <span className="absolute top-2 left-2 bg-dark/80 text-[8px] uppercase tracking-widest text-gold px-2 py-1 rounded-full">
                  {item.kind}
                </span>
                <button
                  onClick={() => handleDeleteMedia(item)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete file"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                {renamingMediaId === item.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => void handleRenameMedia(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleRenameMedia(item);
                      if (e.key === "Escape") setRenamingMediaId(null);
                    }}
                    className="w-full bg-white/5 border border-gold/50 rounded-lg py-1 px-2 text-xs focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setRenamingMediaId(item.id);
                      setRenameValue(item.name);
                    }}
                    className="w-full text-left text-xs truncate hover:text-gold transition-colors"
                    title="Click to rename"
                  >
                    {item.name}
                  </button>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">
                    {formatBytes(item.size_bytes)}
                  </span>
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(item.url);
                      setMessage({ type: "success", text: "URL copied" });
                    }}
                    className="text-[9px] uppercase tracking-widest text-gold hover:text-white transition-colors font-bold"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAboutEditor = () => (
    <form
      onSubmit={handleSaveAbout}
      className="glass p-8 rounded-2xl border border-white/5 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              {t("title")}
            </label>
            <input
              type="text"
              value={aboutContent.title}
              onChange={(e) =>
                setAboutContent({ ...aboutContent, title: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              Subtitle
            </label>
            <input
              type="text"
              value={aboutContent.subtitle}
              onChange={(e) =>
                setAboutContent({ ...aboutContent, subtitle: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              {t("description")}
            </label>
            <textarea
              rows={8}
              value={aboutContent.description}
              onChange={(e) =>
                setAboutContent({
                  ...aboutContent,
                  description: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              {t("images")}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={aboutContent.image}
                onChange={(e) =>
                  setAboutContent({ ...aboutContent, image: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
              />
              <UploadButton
                accept="image/*"
                onUploaded={(url) =>
                  setAboutContent((prev: any) => ({ ...prev, image: url }))
                }
                onError={(text) => setMessage({ type: "error", text })}
              />
            </div>
          </div>
          {aboutContent.image && (
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
              <img
                src={aboutContent.image}
                alt="About Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-gold text-dark px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t("save_content")}
        </button>
      </div>
    </form>
  );

  const renderSettingsEditor = () => (
    <form
      onSubmit={handleSaveSettings}
      className="glass p-8 rounded-2xl border border-white/5 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              {t("name")}
            </label>
            <input
              type="text"
              value={siteSettings.siteName}
              onChange={(e) =>
                setSiteSettings({ ...siteSettings, siteName: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              {t("email")}
            </label>
            <input
              type="email"
              value={siteSettings.contactEmail}
              onChange={(e) =>
                setSiteSettings({
                  ...siteSettings,
                  contactEmail: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              {t("phone")}
            </label>
            <input
              type="text"
              value={siteSettings.contactPhone}
              onChange={(e) =>
                setSiteSettings({
                  ...siteSettings,
                  contactPhone: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              Office Address
            </label>
            <textarea
              rows={2}
              value={siteSettings.officeAddress || ""}
              onChange={(e) =>
                setSiteSettings({
                  ...siteSettings,
                  officeAddress: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
              placeholder={"Bole Road, Friendship Business Center\nAddis Ababa, Ethiopia"}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              Hero Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={siteSettings.heroImageUrl || ""}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    heroImageUrl: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
                placeholder="https://..."
              />
              <UploadButton
                accept="image/*"
                onUploaded={(url) =>
                  setSiteSettings((prev: any) => ({
                    ...prev,
                    heroImageUrl: url,
                  }))
                }
                onError={(text) => setMessage({ type: "error", text })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              Hero Background Video (Home Page)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={siteSettings.heroVideoUrl || ""}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    heroVideoUrl: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
                placeholder="https://... (direct .mp4) or upload → — empty uses the hero image"
              />
              <UploadButton
                accept="video/*"
                onUploaded={(url) =>
                  setSiteSettings((prev: any) => ({
                    ...prev,
                    heroVideoUrl: url,
                  }))
                }
                onError={(text) => setMessage({ type: "error", text })}
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
            Membership Section
          </h4>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/20 ml-4">
              Trust Line (e.g. "Trusted by 50+ Property Investors in Ethiopia")
            </label>
            <input
              type="text"
              value={siteSettings.membershipTrustText || ""}
              onChange={(e) =>
                setSiteSettings({
                  ...siteSettings,
                  membershipTrustText: e.target.value,
                })
              }
              maxLength={120}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
              placeholder="Trusted by Property Investors in Ethiopia"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/20 ml-4">
              Assets Under Advisory (leave empty to hide)
            </label>
            <input
              type="text"
              value={siteSettings.membershipAssetsValue || ""}
              onChange={(e) =>
                setSiteSettings({
                  ...siteSettings,
                  membershipAssetsValue: e.target.value,
                })
              }
              maxLength={40}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
              placeholder="e.g. ETB 4.2B+"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/20 ml-4">
              Membership Image
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={siteSettings.membershipImageUrl || ""}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    membershipImageUrl: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
                placeholder="https://..."
              />
              <UploadButton
                accept="image/*"
                onUploaded={(url) =>
                  setSiteSettings((prev: any) => ({
                    ...prev,
                    membershipImageUrl: url,
                  }))
                }
                onError={(text) => setMessage({ type: "error", text })}
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
            Social Media Links
          </h4>
          {["instagram", "linkedin", "twitter", "tiktok"].map((platform) => (
            <div key={platform} className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/20 ml-4">
                {platform}
              </label>
              <input
                type="url"
                value={siteSettings.socialLinks?.[platform] || ""}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    socialLinks: {
                      ...siteSettings.socialLinks,
                      [platform]: e.target.value,
                    },
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>
          ))}

          <h4 className="text-[10px] uppercase tracking-widest text-white/40 ml-4 pt-4">
            Homepage Stats
          </h4>
          {(siteSettings.stats?.length
            ? siteSettings.stats
            : DEFAULT_SITE_SETTINGS.stats
          ).map((stat: { label: string; value: string }, i: number) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={stat.label}
                onChange={(e) => {
                  const stats = [
                    ...(siteSettings.stats?.length
                      ? siteSettings.stats
                      : DEFAULT_SITE_SETTINGS.stats),
                  ];
                  stats[i] = { ...stats[i], label: e.target.value };
                  setSiteSettings({ ...siteSettings, stats });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
                placeholder="Label (e.g. Properties Sold)"
              />
              <input
                type="text"
                value={stat.value}
                onChange={(e) => {
                  const stats = [
                    ...(siteSettings.stats?.length
                      ? siteSettings.stats
                      : DEFAULT_SITE_SETTINGS.stats),
                  ];
                  stats[i] = { ...stats[i], value: e.target.value };
                  setSiteSettings({ ...siteSettings, stats });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold transition-colors text-sm"
                placeholder="Value (e.g. 300+)"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-gold text-dark px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t("save_settings")}
        </button>
      </div>
    </form>
  );

  const renderProperties = () => {
    const query = propertySearch.trim().toLowerCase();
    const visibleProperties = properties.filter((property) => {
      const matchesSearch =
        !query ||
        (property.title || "").toLowerCase().includes(query) ||
        (property.location || "").toLowerCase().includes(query) ||
        (property.price || "").toLowerCase().includes(query);
      const matchesType =
        propertyTypeFilter === "all" || property.type === propertyTypeFilter;
      return matchesSearch && matchesType;
    });

    return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <h2 className="text-xl font-serif uppercase tracking-widest">
          Property Listings
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="Search title, location, price..."
              className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-xs focus:border-gold outline-none placeholder:text-white/20"
            />
          </div>
          <select
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full py-2.5 px-5 text-xs focus:border-gold outline-none capitalize cursor-pointer"
          >
            <option value="all" className="bg-dark">
              {t("all")}
            </option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type} className="bg-dark capitalize">
                {t(type)}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setCurrentProperty({
                title: "",
                location: "",
                price: "",
                beds: 0,
                baths: 0,
                sqft: "",
                image: "",
                description: "",
                type: "house",
                amenities: [],
                gallery: [],
              });
              setIsEditing(true);
            }}
            className="bg-gold text-dark px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center glass rounded-2xl">
          <AlertCircle className="w-12 h-12 text-white/20 mb-4" />
          <h2 className="text-xl font-serif mb-2">No properties found</h2>
          <button
            onClick={async () => {
              setIsSaving(true);
              await seedProperties(INITIAL_PROPERTIES);
              fetchAllData();
              setIsSaving(false);
            }}
            className="text-gold border border-gold/30 px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-dark transition-all"
          >
            Seed Initial Data
          </button>
        </div>
      ) : visibleProperties.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-center glass rounded-2xl">
          <AlertCircle className="w-8 h-8 text-white/20 mb-3" />
          <p className="text-white/40 text-sm">
            No properties match your search/filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProperties.map((property) => (
            <div
              key={property.id}
              className="glass rounded-2xl overflow-hidden group border border-white/5 hover:border-gold/30 transition-colors"
            >
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  {property.type ? (
                    <span className="bg-dark/70 backdrop-blur-md text-gold text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-gold/20 capitalize">
                      {t(property.type)}
                    </span>
                  ) : (
                    <span className="bg-red-500/20 backdrop-blur-md text-red-400 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-red-500/30">
                      No category
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentProperty(property);
                      setIsEditing(true);
                    }}
                    className="bg-dark/60 backdrop-blur-md p-2 rounded-full hover:bg-gold hover:text-dark transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete?")) {
                        await deleteProperty(property.id!);
                        fetchAllData();
                      }
                    }}
                    className="bg-dark/60 backdrop-blur-md p-2 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-serif mb-1 uppercase tracking-tight">
                  {property.title}
                </h3>
                <div className="text-gold font-serif">{property.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    );
  };

  const renderTestimonials = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif uppercase tracking-widest">
          {t("testimonials")}
        </h2>
        <button
          onClick={() => {
            setCurrentTestimonial({
              name: "",
              role: "",
              content: "",
              rating: 5,
              image: "",
            });
            setIsEditingTestimonial(true);
          }}
          className="bg-gold text-dark px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("add_testimonial")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="glass p-8 rounded-2xl border border-white/5 relative group"
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => {
                  setCurrentTestimonial(testimonial);
                  setIsEditingTestimonial(true);
                }}
                className="bg-dark/60 backdrop-blur-md p-2 rounded-full hover:bg-gold hover:text-dark transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={async () => {
                  if (window.confirm("Delete this testimonial?")) {
                    await deleteTestimonial(testimonial.id!);
                    fetchAllData();
                  }
                }}
                className="bg-dark/60 backdrop-blur-md p-2 rounded-full hover:bg-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gold/20 bg-gold/5 shrink-0">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold font-serif text-xl border border-gold/30">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="font-serif text-lg">{testimonial.name}</div>
                <div className="text-[10px] text-gold uppercase tracking-widest">
                  {testimonial.role}
                </div>
              </div>
            </div>

            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < testimonial.rating ? "text-gold fill-gold" : "text-white/20"}`}
                />
              ))}
            </div>

            <p className="text-white/60 text-sm italic leading-relaxed">
              "{testimonial.content}"
            </p>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center glass rounded-2xl border border-white/5">
            <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
            <h2 className="text-xl font-serif mb-2">No testimonials yet</h2>
            <p className="text-white/40 text-sm">
              Add your first client success story.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] bg-dark flex overflow-hidden">
      <div className="relative z-10 flex flex-1 min-w-0">
      {renderSidebar()}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-white/5 flex justify-between items-center bg-dark/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-white/60 hover:text-gold transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-serif uppercase tracking-widest truncate">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                window.location.href = "/";
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider text-white/60 hover:text-gold hover:bg-white/5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t("view_website")}</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center border border-gold/30">
                <UserCircle className="w-4 h-4 text-gold" />
              </div>
              <span className="text-xs text-white/80 hidden md:inline truncate max-w-[140px]">
                {currentUser?.name || "Admin"}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logoutAdmin();
                if (onLogout) onLogout();
                else window.location.href = "/";
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
              title={t("sign_out")}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("sign_out")}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </motion.div>
            )}

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-gold animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "dashboard" && renderDashboard()}
                  {activeTab === "properties" && renderProperties()}
                  {activeTab === "inquiries" && renderInquiries()}
                  {activeTab === "testimonials" && renderTestimonials()}
                  {activeTab === "media" && renderMediaLibrary()}
                  {activeTab === "about" && renderAboutEditor()}
{activeTab === "settings" && renderSettingsEditor()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* Property Edit Modal (Keep existing logic but simplified) */}
      <AnimatePresence>
        {isEditing && currentProperty && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-dark/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] glass rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <header className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-serif uppercase tracking-widest">
                  {currentProperty.id ? "Edit Property" : "New Property"}
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="hover:text-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </header>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSaving(true);
                  try {
                    if (currentProperty.id)
                      await updateProperty(currentProperty.id, currentProperty);
                    else await addProperty(currentProperty as any);
                    setIsEditing(false);
                    fetchAllData();
                    setMessage({
                      type: "success",
                      text: "Property saved successfully",
                    });
                  } catch (error) {
                    setMessage({
                      type: "error",
                      text: "Failed to save property",
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="flex-1 overflow-y-auto p-8 space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Property Title
                      </label>
                      <input
                        required
                        type="text"
                        value={currentProperty.title || ""}
                        onChange={(e) =>
                          setCurrentProperty({
                            ...currentProperty,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        placeholder="e.g. Bole Skyline Villa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Location
                      </label>
                      <input
                        required
                        type="text"
                        value={currentProperty.location || ""}
                        onChange={(e) =>
                          setCurrentProperty({
                            ...currentProperty,
                            location: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        placeholder="e.g. Bole, Addis Ababa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Price
                      </label>
                      <input
                        required
                        type="text"
                        value={currentProperty.price || ""}
                        onChange={(e) =>
                          setCurrentProperty({
                            ...currentProperty,
                            price: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        placeholder="e.g. ETB 45,000,000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Category
                      </label>
                      <select
                        required
                        value={currentProperty.type || ""}
                        onChange={(e) =>
                          setCurrentProperty({
                            ...currentProperty,
                            type: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none capitalize cursor-pointer"
                      >
                        <option value="" disabled className="bg-dark">
                          Select a category...
                        </option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-dark capitalize">
                            {t(type)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                          Beds
                        </label>
                        <input
                          required
                          type="number"
                          value={currentProperty.beds || 0}
                          onChange={(e) =>
                            setCurrentProperty({
                              ...currentProperty,
                              beds: parseInt(e.target.value),
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                          Baths
                        </label>
                        <input
                          required
                          type="number"
                          value={currentProperty.baths || 0}
                          onChange={(e) =>
                            setCurrentProperty({
                              ...currentProperty,
                              baths: parseInt(e.target.value),
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                          Sqft
                        </label>
                        <input
                          required
                          type="text"
                          value={currentProperty.sqft || ""}
                          onChange={(e) =>
                            setCurrentProperty({
                              ...currentProperty,
                              sqft: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Main Image
                      </label>
                      <div className="flex gap-2">
                        <input
                          required
                          type="url"
                          value={currentProperty.image || ""}
                          onChange={(e) =>
                            setCurrentProperty({
                              ...currentProperty,
                              image: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                          placeholder="https://... or upload →"
                        />
                        <UploadButton
                          accept="image/*"
                          onUploaded={(url) =>
                            setCurrentProperty((prev) => ({
                              ...prev,
                              image: url,
                            }))
                          }
                          onError={(text) => setMessage({ type: "error", text })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Description
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={currentProperty.description || ""}
                        onChange={(e) =>
                          setCurrentProperty({
                            ...currentProperty,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm resize-none focus:border-gold outline-none"
                        placeholder="Property details..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Amenities (comma separated)
                      </label>
                      <input
                        type="text"
                        value={currentProperty.amenities?.join(", ") || ""}
                        onChange={(e) =>
                          setCurrentProperty({
                            ...currentProperty,
                            amenities: e.target.value
                              .split(",")
                              .map((s) => s.trim()),
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        placeholder="Pool, Spa, Gym..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Gallery Images (comma separated URLs)
                      </label>
                      <div className="flex gap-2 items-start">
                        <textarea
                          rows={2}
                          value={currentProperty.gallery?.join(", ") || ""}
                          onChange={(e) =>
                            setCurrentProperty({
                              ...currentProperty,
                              gallery: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s !== ""),
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm resize-none focus:border-gold outline-none"
                          placeholder="https://..., https://... or upload →"
                        />
                        <UploadButton
                          accept="image/*"
                          label="Add"
                          onUploaded={(url) =>
                            setCurrentProperty((prev) => ({
                              ...prev,
                              gallery: [...(prev?.gallery || []), url],
                            }))
                          }
                          onError={(text) => setMessage({ type: "error", text })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        Video (YouTube/Vimeo/Direct)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={currentProperty.videoUrl || ""}
                          onChange={(e) =>
                            setCurrentProperty({
                              ...currentProperty,
                              videoUrl: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                          placeholder="https://youtube.com/watch?v=... or upload →"
                        />
                        <UploadButton
                          accept="video/*"
                          onUploaded={(url) =>
                            setCurrentProperty((prev) => ({
                              ...prev,
                              videoUrl: url,
                            }))
                          }
                          onError={(text) => setMessage({ type: "error", text })}
                        />
                      </div>
                    </div>
                    {currentProperty.gallery &&
                      currentProperty.gallery.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {currentProperty.gallery.map((url, idx) => (
                            <div
                              key={idx}
                              className="aspect-square rounded-lg overflow-hidden border border-white/10 relative group"
                            >
                              <img
                                src={url}
                                alt={`Gallery ${idx}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newGallery =
                                    currentProperty.gallery?.filter(
                                      (_, i) => i !== idx,
                                    );
                                  setCurrentProperty({
                                    ...currentProperty,
                                    gallery: newGallery,
                                  });
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-3 uppercase tracking-widest text-[10px] font-bold text-white/40 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gold text-dark px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {currentProperty.id ? "Update Property" : "Create Property"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isEditingTestimonial && currentTestimonial && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingTestimonial(false)}
              className="absolute inset-0 bg-dark/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] glass rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <header className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-serif uppercase tracking-widest">
                  {currentTestimonial.id
                    ? t("edit_testimonial")
                    : t("add_testimonial")}
                </h2>
                <button
                  onClick={() => setIsEditingTestimonial(false)}
                  className="hover:text-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </header>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSaving(true);
                  try {
                    if (currentTestimonial.id)
                      await updateTestimonial(
                        currentTestimonial.id,
                        currentTestimonial,
                      );
                    else await addTestimonial(currentTestimonial as any);
                    setIsEditingTestimonial(false);
                    fetchAllData();
                    setMessage({
                      type: "success",
                      text: "Testimonial saved successfully",
                    });
                  } catch (error) {
                    setMessage({
                      type: "error",
                      text: "Failed to save testimonial",
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="flex-1 overflow-y-auto p-8 space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        {t("client_name")}
                      </label>
                      <input
                        required
                        type="text"
                        value={currentTestimonial.name || ""}
                        onChange={(e) =>
                          setCurrentTestimonial({
                            ...currentTestimonial,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        placeholder="e.g. Abebe Kebede"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                        {t("client_role")}
                      </label>
                      <input
                        required
                        type="text"
                        value={currentTestimonial.role || ""}
                        onChange={(e) =>
                          setCurrentTestimonial({
                            ...currentTestimonial,
                            role: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        placeholder="e.g. Homeowner in Bole"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                      {t("rating")} (1-5)
                    </label>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setCurrentTestimonial({
                              ...currentTestimonial,
                              rating: star,
                            })
                          }
                          className={`p-2 rounded-lg transition-all ${currentTestimonial.rating === star ? "bg-gold/20 text-gold border border-gold/30" : "bg-white/5 text-white/20 hover:text-white/40"}`}
                        >
                          <Star
                            className={`w-5 h-5 ${currentTestimonial.rating! >= star ? "fill-current" : ""}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                      {t("testimonial_content")}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={currentTestimonial.content || ""}
                      onChange={(e) =>
                        setCurrentTestimonial({
                          ...currentTestimonial,
                          content: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm resize-none focus:border-gold outline-none"
                      placeholder="The service was exceptional..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
                      {t("images")} (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentTestimonial.image || ""}
                        onChange={(e) =>
                          setCurrentTestimonial({
                            ...currentTestimonial,
                            image: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-gold outline-none"
                        placeholder="https://... or upload →"
                      />
                      <UploadButton
                        accept="image/*"
                        onUploaded={(url) =>
                          setCurrentTestimonial((prev) => ({
                            ...prev,
                            image: url,
                          }))
                        }
                        onError={(text) => setMessage({ type: "error", text })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingTestimonial(false)}
                    className="px-8 py-3 uppercase tracking-widest text-[10px] font-bold text-white/40 hover:text-white transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gold text-dark px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {t("save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
