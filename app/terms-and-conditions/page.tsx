import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Terms &amp; Conditions</h1>
        <div className="space-y-5 text-sm text-sc-muted leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            By using Smart Click, you agree to these terms. Please read them carefully before placing an
            order.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Orders and pricing</h2>
          <p>
            All prices are listed in Pakistani Rupees (PKR) and include applicable taxes unless stated
            otherwise. We reserve the right to correct pricing errors and to cancel an order affected by
            an obvious pricing mistake, with a full refund if payment was already collected.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Product listings</h2>
          <p>
            Product descriptions are drafted with AI assistance from seller-provided photos and reviewed
            before publishing. While we aim for accuracy, minor variations in color or packaging may
            occur.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Payments</h2>
          <p>
            We accept Cash on Delivery and online payment via card and local wallet/bank methods through
            our payment partners. A flat handling fee applies to Cash on Delivery orders.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Limitation of liability</h2>
          <p>
            Smart Click is not liable for indirect or consequential damages arising from use of the site
            or products purchased through it, to the extent permitted by law.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Contact</h2>
          <p>
            Questions about these terms can be sent to us via our{" "}
            <Link href="/contact" className="text-sc-accent">Contact page</Link>.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}