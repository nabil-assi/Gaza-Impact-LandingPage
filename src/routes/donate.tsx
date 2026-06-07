import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Heart,
  CreditCard,
  Bitcoin,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { api } from "@/lib/api/api";

// ─── Route (with optional search param `initiativeId`) ───────────────────────

const donateSearchSchema = z.object({
  initiativeId: z.string().optional(),
});

export const Route = createFileRoute("/donate")({
  validateSearch: donateSearchSchema,
  component: DonatePage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface InitiativeSummary {
  id: string;
  title: string;
  raisedAmount: string;
  targetAmount: string;
}

// ─── Page ────────────────────────────────────────────────────────────────────

function DonatePage() {
  const { initiativeId } = Route.useSearch();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<number>(50);
  const [method, setMethod] = useState<"card" | "crypto">("card");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // If linked to a specific initiative, load its title for display
  const [initiative, setInitiative] = useState<InitiativeSummary | null>(null);
  const [loadingInit, setLoadingInit] = useState(false);

  const WALLET_ADDRESS = "TXYZ1234567890ABCDEF1234567890ABCDEF"; // replace with real address

  useEffect(() => {
    if (!initiativeId) return;
    setLoadingInit(true);
    api
      .get(`/initiatives/${initiativeId}`)
      .then((res) => setInitiative(res.data))
      .catch(() => setInitiative(null))
      .finally(() => setLoadingInit(false));
  }, [initiativeId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!amount || amount <= 0) return;
    setSubmitting(true);
    try {
      await api.post("/donations", {
        amount,
        method,
        name: name || undefined,
        contact: contact || undefined,
        message: message || undefined,
        initiativeId: initiativeId ?? null,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Donation submission failed:", err);
      // In a real app, show a toast/error here
    } finally {
      setSubmitting(false);
    }
  };

  const presets = [25, 50, 100, 250];

  // ── Success screen ──
  if (success) {
    return (
      <PageShell>
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </span>
          <h2 className="mt-8 text-3xl font-bold tracking-tight text-foreground">
            Thank you for your generosity
          </h2>
          <p className="font-arabic mt-2 text-xl text-moss" dir="rtl">
            شكراً على كرمك
          </p>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Your donation of{" "}
            <strong className="text-foreground">${amount.toLocaleString()}</strong>{" "}
            {initiative ? (
              <>
                to <strong className="text-foreground">{initiative.title}</strong>
              </>
            ) : (
              "to the General Fund"
            )}{" "}
            has been recorded. Our team will follow up if needed.
          </p>
          {method === "crypto" && (
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary-soft/40 p-4 text-left text-sm text-moss">
              <p className="font-semibold">Next step for crypto transfer:</p>
              <p className="mt-1 text-foreground/80">
                Please send <strong>${amount}</strong> USDT (TRC-20) to the wallet below and
                contact us via WhatsApp with your transfer screenshot.
              </p>
              <code className="mt-2 block break-all rounded bg-white/70 px-3 py-2 text-xs font-mono text-foreground">
                {WALLET_ADDRESS}
              </code>
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              to="/"
              hash="initiatives"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Browse Initiatives
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Back */}
        <button
          onClick={() => navigate({ to: initiativeId ? `/initiatives/${initiativeId}` : "/" })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {initiativeId ? "Back to Initiative" : "Back to Home"}
        </button>

        {/* Page header */}
        <div className="mt-8 mb-12 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Donate</p>

          {/* Show initiative context if linked */}
          {initiativeId && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary-soft/40 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-sm">
                {loadingInit ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading initiative…
                  </span>
                ) : initiative ? (
                  <>
                    <span className="font-semibold text-foreground">
                      Donating to: {initiative.title}
                    </span>
                    <ProgressMini
                      raised={parseFloat(initiative.raisedAmount)}
                      goal={parseFloat(initiative.targetAmount)}
                    />
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Initiative not found — defaulting to General Fund.
                  </span>
                )}
              </div>
            </div>
          )}

          {!initiativeId && (
            <>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Make a Donation
              </h1>
              <p className="font-arabic mt-2 text-xl text-moss" dir="rtl">
                تبرع للصندوق العام
              </p>
              <p className="mt-4 text-base text-muted-foreground">
                Your contribution goes to the General Humanitarian Fund, supporting wherever the
                need is greatest.
              </p>
            </>
          )}

          {initiativeId && initiative && (
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              Support this Campaign
            </h1>
          )}
        </div>

        {/* Form card */}
        <div className="grid gap-10 rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12 lg:grid-cols-5">
          {/* ── Left: amount + payment ── */}
          <div className="lg:col-span-3 lg:border-r lg:border-border lg:pr-12">
            {/* Amount presets */}
            <FieldLabel en="Select amount (USD)" ar="اختر المبلغ بالدولار" />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    amount === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="Custom amount"
            />

            {/* Payment method */}
            <div className="mt-8">
              <FieldLabel en="Payment method" ar="طريقة الدفع" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <PaymentOption
                  active={method === "card"}
                  onClick={() => setMethod("card")}
                  icon={<CreditCard className="h-5 w-5" />}
                  title="Binance Pay"
                  titleAr="دفع عبر بينانس"
                  hint="Instant & Secure"
                />
                <PaymentOption
                  active={method === "crypto"}
                  onClick={() => setMethod("crypto")}
                  icon={<Bitcoin className="h-5 w-5" />}
                  title="USDT (TRC-20)"
                  titleAr="عملة رقمية USDT"
                  hint="Manual transfer"
                />
              </div>

              {/* Payment details panel */}
              {method === "crypto" ? (
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary-soft/40 p-4">
                  <p className="text-xs font-semibold text-moss">USDT (TRC-20) Wallet Address:</p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-white/70 p-2 text-xs font-mono text-foreground">
                      {WALLET_ADDRESS}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground/70 transition hover:border-primary hover:text-primary"
                      aria-label="Copy wallet address"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    * After transferring, contact us via WhatsApp with your transfer screenshot.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
                  You'll be redirected to Binance Pay to complete your secure payment.
                  <span className="font-arabic mt-1 block" dir="rtl">
                    ستُحوَّل إلى صفحة بينانس لإتمام الدفع الآمن.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: personal info + submit ── */}
          <div className="lg:col-span-2">
            <div className="space-y-5">
              <div>
                <FieldLabel en="Name (Optional)" ar="الاسم (اختياري)" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <FieldLabel en="Contact Info" ar="معلومات التواصل" />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email or phone"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <FieldLabel en="Message of Support (Optional)" ar="رسالة دعم" />
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A few kind words for the families…"
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !amount || amount <= 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                {submitting ? "Processing…" : `Donate $${amount}`}
                {!submitting && <span className="font-arabic">| تبرع الآن</span>}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                100% of your donation reaches the field.
              </p>

              {/* Show which fund this goes to */}
              <p className="rounded-lg bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
                {initiativeId && initiative ? (
                  <>
                    This donation is earmarked for{" "}
                    <strong className="text-foreground">{initiative.title}</strong>.
                  </>
                ) : (
                  <>This donation goes to the <strong className="text-foreground">General Humanitarian Fund</strong>.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressMini({ raised, goal }: { raised: number; goal: number }) {
  const percent = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-foreground/80">${raised.toLocaleString()} raised</span>
        <span className="text-primary font-semibold">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">of ${goal.toLocaleString()} goal</p>
    </div>
  );
}

function FieldLabel({ en, ar }: { en: string; ar: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm font-semibold text-foreground">{en}</span>
      <span className="font-arabic text-xs text-muted-foreground" dir="rtl">
        {ar}
      </span>
    </div>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  titleAr,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  titleAr: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? "border-primary bg-primary-soft/50"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <p className="font-arabic text-xs text-muted-foreground" dir="rtl">
          {titleAr}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </button>
  );
}

// ─── Shared page shell ────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
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

          <nav className="hidden items-center gap-6 md:flex">
            <a href="/#initiatives" className="text-sm text-foreground/80 transition hover:text-primary">
              Initiatives
            </a>
            <Link to="/" className="text-sm text-foreground/80 transition hover:text-primary">
              Home
            </Link>
          </nav>

          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Heart className="h-3.5 w-3.5" />
            Donate <span className="font-arabic">| تبرع</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
