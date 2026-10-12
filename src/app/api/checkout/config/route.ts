import { NextResponse } from "next/server";

/** Cache checkout config at the CDN — keys rarely change */
export const revalidate = 300;

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const publicKey =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || keyId || "";
  const configured = Boolean(keyId && keySecret);

  return NextResponse.json(
    {
      mode: configured ? "razorpay" : "demo",
      publicKey: configured ? publicKey : "",
      emailEnabled: Boolean(process.env.RESEND_API_KEY?.trim()),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "Vercel-CDN-Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
