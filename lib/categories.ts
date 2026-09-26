const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  image_url: string | null;
}

export async function fetchCategories(): Promise<CategoryMeta[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryMeta | null> {
  const all = await fetchCategories();
  return all.find((c) => c.slug === slug) || null;
}