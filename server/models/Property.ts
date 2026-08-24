export type TimestampLike = string | Date;

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
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  date?: string;
  notes?: string;
  propertyId?: string;
  createdAt?: TimestampLike;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: "admin" | "client";
  createdAt?: TimestampLike;
}
