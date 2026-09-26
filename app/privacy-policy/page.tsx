import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Privacy Policy</h1>
        <div className="space-y-5 text-sm text-sc-muted leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            Smart Click ("we", "us") collects the information you provide when creating an account,
            placing an order, or contacting us — including your name, email, phone number, and shipping
            address. We also collect basic usage data (pages visited, products viewed) to improve the
            store.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">How we use your information</h2>
          <p>
            Your information is used to process and deliver orders, communicate order updates, respond
            to support requests, and improve our product catalog and site experience. We do not sell
            your personal information to third parties.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Payment information</h2>
          <p>
            Card and wallet payment details are handled entirely by our payment processors (Stripe and
            our local payment gateway partners) — we never see or store your full card number or wallet
            credentials on our own servers.
          </p>
          <h2 className="font-display text-lg font-semibold text-sc-ink pt-2">Your rights</h2>
          <p>
            You can request access to, correction of, or deletion of your personal data at any time by
            contacting us at the details on our{" "}
            <Link href="/contact" className="text-sc-accent">Contact page</Link>.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}