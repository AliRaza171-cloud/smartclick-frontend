import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">About Smart Click</h1>
        <div className="space-y-5 text-sm text-sc-muted leading-relaxed">
          <p>
            Smart Click is an AI-curated store — every listing is drafted with the help of an AI
            assistant that categorizes products and writes descriptions from the seller's photos, then
            reviewed by a real person before it ever goes live.
          </p>
          <p>
            We built this to make listing and shopping simpler: sellers spend less time writing
            descriptions from scratch, and buyers get consistent, clear listings across every category.
          </p>
          <p>
            Have a question or want to get in touch? Reach us at{" "}
            <a href="mailto:hello@smartclick.local" className="text-sc-accent">hello@smartclick.local</a>.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}