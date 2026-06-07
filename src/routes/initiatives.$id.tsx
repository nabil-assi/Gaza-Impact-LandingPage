import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Users,
  Calendar,
  CheckCircle2,
  Share2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api/api";

// ─── Route ──────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/initiatives/$id")({
  component: InitiativeDetail,
});

// ─── Types ───────────────────────────────────────────────────────────────────────

interface Initiative {
  id: string;
  title: string;
  description: string;
  raisedAmount: string;
  targetAmount: string;
  images?: string[];
  category?: string;
  createdAt?: string;
  updates?: { date: string; text: string }[];
  donorsCount?: number;
}

// ─── Page ────────────────────────────────────────────────────────────────────────

function InitiativeDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchInitiative = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/initiatives/${id}`);
        setInitiative(res.data);
      } catch (err: any) {
        setError(err?.message || "Failed to load initiative.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitiative();
  }, [id]);

  // ── Loading state ──
  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  // ── Error state ──
  if (error || !initiative) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl py-32 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive/60" />
          <h2 className="text-2xl font-bold text-foreground">Initiative not found</h2>
          <p className="mt-3 text-muted-foreground">{error ?? "This campaign may have ended."}</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </PageShell>
    );
  }

  const raised = parseFloat(initiative.raisedAmount || "0");
  const goal = parseFloat(initiative.targetAmount || "1");
  const percent = Math.min(100, Math.round((raised / goal) * 100));
  const images = initiative.images ?? [];

  const handleDonate = () => {
    navigate({ to: "/donate", search: { initiativeId: initiative.id } });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All Initiatives
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-5">
          {/* ── Left col: images + description ── */}
          <div className="lg:col-span-3">
            {/* Image gallery */}
            {images.length > 0 ? (
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={images[activeImg]}
                  alt={initiative.title}
                  className="h-80 w-full object-cover sm:h-96"
                />
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                          activeImg === i ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                No images available
              </div>
            )}

            {/* Category badge + title */}
            <div className="mt-8">
              {initiative.category && (
                <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-moss">
                  {initiative.category}
                </span>
              )}
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {initiative.title}
              </h1>

              {initiative.createdAt && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Launched{" "}
                  {new Date(initiative.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 prose prose-sm max-w-none text-foreground/80 leading-relaxed">
              <p>{initiative.description}</p>
            </div>

            {/* Updates timeline */}
            {initiative.updates && initiative.updates.length > 0 && (
              <div className="mt-10">
                <h3 className="mb-5 text-lg font-semibold text-foreground">
                  Field Updates{" "}
                  <span className="font-arabic text-muted-foreground">| تحديثات ميدانية</span>
                </h3>
                <ol className="space-y-5 border-l-2 border-primary/20 pl-6">
                  {initiative.updates.map((u, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.5625rem] flex h-4 w-4 items-center justify-center rounded-full bg-primary-soft ring-2 ring-background">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </span>
                      <p className="text-xs font-medium text-muted-foreground">{u.date}</p>
                      <p className="mt-1 text-sm text-foreground/80">{u.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* ── Right col: donation card ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-7 shadow-sm">
              {/* Progress */}
              <div className="mb-2 flex justify-between text-sm font-medium">
                <span className="text-foreground">
                  <span className="text-xl font-bold text-primary">
                    ${raised.toLocaleString()}
                  </span>{" "}
                  raised
                </span>
                <span className="text-primary font-semibold">{percent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-primary-soft">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                of ${goal.toLocaleString()} goal
              </p>

              {/* Donors count */}
              {initiative.donorsCount != null && (
                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    <strong className="text-foreground">{initiative.donorsCount.toLocaleString()}</strong>{" "}
                    donors
                  </span>
                </div>
              )}

              {/* Donate CTA */}
              <button
                onClick={handleDonate}
                className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 active:scale-[0.98]"
              >
                <Heart className="h-5 w-5" />
                Donate to this Initiative
                <span className="font-arabic">| تبرع لهذه المبادرة</span>
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                100% of your donation reaches the field.
              </p>

              {/* Share */}
              <button
                onClick={() =>
                  navigator.share?.({
                    title: initiative.title,
                    url: window.location.href,
                  })
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground/80 transition hover:border-primary hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
                Share this campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Shared page shell with nav ───────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Heart className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-foreground">GAZA IMPACT</span>
              <span className="font-arabic text-xs text-muted-foreground">أثر غزة</span>
            </span>
          </Link>

          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Donate Now <span className="font-arabic">| تبرع</span>
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
