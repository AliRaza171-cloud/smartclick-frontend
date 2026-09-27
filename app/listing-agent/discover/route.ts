import { NextResponse } from "next/server";

/**
 * Tells Listing Agent (the AI listing tool) where this store's backend is, so a seller
 * only has to type the website address (e.g. https://frontend-smartclick.vercel.app).
 * Nothing secret here: the API address is already public in the site's own code.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    platform: "smartclick",
    store_name: "Smart Click",
    api_url: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, ""),
    connect_path: "/listing-agent/connect",
  });
}
