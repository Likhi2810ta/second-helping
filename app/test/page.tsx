import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase/server";

async function Rows() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("ping").select("*");

  if (error) {
    return <p className="text-danger">Error: {error.message}</p>;
  }
  return (
    <pre className="rounded-lg bg-green-100 p-4 text-green-900">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function TestPage() {
  return (
    <main className="min-h-screen bg-bg p-10">
      <h1 className="font-heading text-3xl font-bold text-green-900">
        Supabase connection test
      </h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <Rows />
        </Suspense>
      </div>
    </main>
  );
}
