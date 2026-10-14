import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg p-10">
      <h1 className="font-heading text-4xl font-bold text-green-900">
        Second Helping
      </h1>
      <p className="mt-2 text-muted-foreground">
        Surplus food, shared with people who need it.
      </p>

      <div className="mt-6 flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Danger</Button>
      </div>

      <div className="mt-8 flex gap-2">
        <div className="h-16 w-16 rounded-lg bg-green-100" />
        <div className="h-16 w-16 rounded-lg bg-green-600" />
        <div className="h-16 w-16 rounded-lg bg-green-700" />
        <div className="h-16 w-16 rounded-lg bg-green-900" />
        <div className="h-16 w-16 rounded-lg bg-warn" />
        <div className="h-16 w-16 rounded-lg bg-danger" />
      </div>
    </main>
  );
}