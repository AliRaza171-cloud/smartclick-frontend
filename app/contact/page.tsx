import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getStoreInfo() {
  try {
    const res = await fetch(`${API_BASE}/store-info`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const store = await getStoreInfo();

  return (
    <main>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Contact Us</h1>
        <div className="space-y-4 text-sm text-sc-muted">
          <div>
            <div className="text-sc-faint text-xs mb-1">Store name</div>
            {store?.name || "Smart Click"}
          </div>
          <div>
            <div className="text-sc-faint text-xs mb-1">Office address</div>
            {store?.address || "—"}, {store?.city || "—"}
          </div>
          <div>
            <div className="text-sc-faint text-xs mb-1">Phone</div>
            {store?.phone || "—"}
          </div>
          <div>
            <div className="text-sc-faint text-xs mb-1">Email</div>
            <Link href="mailto:hello@smartclick.local" className="text-sc-accent">hello@smartclick.local</Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}                          