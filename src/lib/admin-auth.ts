import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "akruti_admin_session";

function tokenForPassword(password: string): string {
  return crypto.createHash("sha256").update(`akruti:${password}`).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD || "akruti-admin";
  const jar = await cookies();
  const session = jar.get(COOKIE)?.value;
  return session === tokenForPassword(password);
}

export async function setAdminSession(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD || "akruti-admin";
  const jar = await cookies();
  jar.set(COOKIE, tokenForPassword(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function verifyAdminPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD || "akruti-admin";
  return input === password;
}
