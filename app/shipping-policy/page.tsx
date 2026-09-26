import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ShippingPolicyPage() {
  return (
    <main>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Shipping Policy</h1>
        <div className="space-y-5 text-sm text-sc-muted leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Processing time</h2>
          <p>
            Orders are typically packed and marked "Ready to Ship" within 1–2 business days of being
            placed. You'll receive an email and in-app notification at each step: order confirmed, ready
            to ship, and shipped.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Delivery areas and times</h2>
          <p>
            We currently ship within Pakistan. Delivery typically takes 3–7 business days depending on
            your city, handled by our courier partners.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Shipping fees</h2>
          <p>
            Shipping fees, where applicable, are shown at checkout before you place your order. Some
            products and vouchers qualify for free shipping, shown on the product page or applied
            automatically at checkout.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}