import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ReturnRefundPolicyPage() {
  return (
    <main>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Return &amp; Refund Policy</h1>
        <div className="space-y-5 text-sm text-sc-muted leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Returns</h2>
          <p>
            If an item arrives damaged, defective, or different from what you ordered, contact us within
            7 days of delivery via our <Link href="/contact" className="text-sc-accent">Contact page</Link>{" "}
            with your order number and a photo of the issue. We'll arrange a replacement or return
            pickup at no extra cost to you.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Refunds</h2>
          <p>
            Once a return is received and inspected, refunds for online (card/wallet) payments are
            issued back to the original payment method within 5–10 business days. Cash on Delivery
            orders are refunded via bank transfer or store credit, as agreed with our support team.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Non-returnable items</h2>
          <p>
            Items marked as final sale, or products damaged through misuse after delivery, are not
            eligible for return.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}