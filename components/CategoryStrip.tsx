import { fetchCategories } from "@/lib/categories";
import CategorySlider from "./CategorySlider";

export default async function CategoryStrip() {
  const categoryList = await fetchCategories();
  return <CategorySlider items={categoryList} />;
}