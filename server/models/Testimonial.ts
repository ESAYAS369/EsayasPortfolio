export type TimestampLike = string | Date;

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
}
