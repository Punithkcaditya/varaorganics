import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-[400px] py-12">
      <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Admin sign in</h1>
      <p className="mb-8 text-sm text-navy/60">
        Use your Supabase account for Vara Organics.
      </p>
      <Suspense fallback={<p className="text-navy/50">Loading…</p>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
