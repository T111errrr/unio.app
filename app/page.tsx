import messages from "@/messages/id.json";

/**
 * Layar sementara (tugas 1.02): hanya untuk memastikan app bisa dipasang di Home Screen.
 * Diganti layar Today / onboarding di tugas berikutnya.
 */
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-24 bg-background p-24 text-center">
      <div aria-hidden className="flex gap-16 rounded-card bg-accent p-32 shadow-card-soft">
        <span className="h-32 w-12 rounded-full bg-on-accent" />
        <span className="h-32 w-12 rounded-full bg-on-accent" />
      </div>
      <div className="flex flex-col gap-8">
        <h1 className="t-large-title text-text-primary">{messages.app.name}</h1>
        <p className="t-subheadline text-text-secondary">{messages.app.tagline}</p>
      </div>
    </main>
  );
}
