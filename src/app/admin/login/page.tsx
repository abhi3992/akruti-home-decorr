import { redirect } from "next/navigation";
import {
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) redirect("/admin");
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const password = String(formData.get("password") || "");
    if (!verifyAdminPassword(password)) {
      redirect("/admin/login?error=1");
    }
    await setAdminSession();
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Admin login
      </h1>
      <form action={login} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink)]/70">Password</span>
          <input
            type="password"
            name="password"
            required
            className="w-full border border-[var(--ink)]/20 px-3 py-2.5"
          />
        </label>
        {error && (
          <p className="text-sm text-red-700">Incorrect password.</p>
        )}
        <button
          type="submit"
          className="w-full bg-[var(--ink)] py-3 text-sm text-white"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
