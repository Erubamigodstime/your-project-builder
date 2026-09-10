import { useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, CircleHelp, FileText, LifeBuoy, Paperclip, ShieldCheck, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pearl 27 Support | Submit a ticket" },
      { name: "description", content: "Submit a Sphere account support request to the Pearl 27 System Support team." },
      { property: "og:title", content: "Pearl 27 Support | Submit a ticket" },
      { property: "og:description", content: "Submit a Sphere account support request to the Pearl 27 System Support team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setFile(null);
    setError("");
  };

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Please choose a file smaller than 10 MB.");
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  return (
    <main className="min-h-screen bg-canvas text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-label="Pearl 27">
              <span className="font-display text-lg font-bold">P27</span>
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none">Pearl 27</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">System support</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <CircleHelp className="size-4" />
            <span>Need a hand with Sphere?</span>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(280px,0.8fr)_minmax(520px,1.2fr)] lg:gap-24 lg:py-16">
          <section className="animate-rise-in max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="size-2 rounded-full bg-brand" />
              Support request
            </div>
            <h1 className="max-w-lg text-5xl font-semibold leading-[0.98] tracking-tight text-primary sm:text-6xl">
              Let’s get your Sphere account back on track.
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">
              Tell us what’s happening and the System Support team will review your request as soon as possible.
            </p>

            <div className="mt-12 grid gap-5 border-t border-border pt-6 sm:grid-cols-2 lg:block">
              <SupportPoint icon={<LifeBuoy />} title="Human support" copy="A clear path from issue to resolution." />
              <SupportPoint icon={<ShieldCheck />} title="Your details are safe" copy="We only use your information to help." />
            </div>
          </section>

          <section className="animate-rise-in rounded-lg border border-border bg-surface p-6 shadow-[0_20px_60px_-30px_var(--color-primary)] sm:p-9" style={{ animationDelay: "100ms" }}>
            {submitted ? (
              <Confirmation onReset={resetForm} />
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-8 flex items-start justify-between gap-6 border-b border-border pb-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">New ticket</p>
                    <h2 className="mt-2 text-3xl font-semibold text-primary">How can we help?</h2>
                  </div>
                  <FileText className="mt-1 size-7 shrink-0 text-brand" strokeWidth={1.5} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Employee name" htmlFor="employee-name">
                    <Input id="employee-name" name="employeeName" placeholder="e.g. Amaka Okafor" required />
                  </Field>
                  <Field label="Work email" htmlFor="employee-email">
                    <Input id="employee-email" name="employeeEmail" type="email" placeholder="name@pearl27.com" required />
                  </Field>
                </div>

                <div className="mt-5">
                  <Field label="Issue title" htmlFor="issue-title">
                    <Input id="issue-title" name="issueTitle" placeholder="e.g. I can’t sign in to Sphere" required />
                  </Field>
                </div>

                <div className="mt-5">
                  <Field label="What’s going on?" htmlFor="issue-description" hint="Include any message you see on screen.">
                    <Textarea id="issue-description" name="issueDescription" placeholder="Describe the issue in a few sentences..." className="min-h-36 resize-y" required />
                  </Field>
                </div>

                <div className="mt-5">
                  <Field label="Screenshot or file" htmlFor="issue-file" hint="Optional · PNG, JPG or PDF · max 10 MB">
                    <input ref={fileInputRef} id="issue-file" name="issueFile" type="file" accept="image/png,image/jpeg,application/pdf" className="sr-only" onChange={(event) => handleFileChange(event.target.files?.[0])} />
                    {file ? (
                      <div className="flex min-h-16 items-center justify-between gap-4 rounded-md border border-brand bg-brand-soft px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface text-brand"><Paperclip className="size-4" /></div>
                          <span className="truncate text-sm font-medium text-primary">{file.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" aria-label="Remove attached file" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                          <X />
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" className="h-auto min-h-16 w-full justify-start border-dashed px-4 py-3 text-left" onClick={() => fileInputRef.current?.click()}>
                        <span className="flex size-9 items-center justify-center rounded-md bg-brand-soft text-brand"><Upload className="size-4" /></span>
                        <span className="flex flex-col items-start gap-0.5">
                          <span className="font-semibold">Attach a file</span>
                          <span className="text-xs font-normal text-muted-foreground">Click to browse your device</span>
                        </span>
                      </Button>
                    )}
                  </Field>
                </div>

                {error && <p className="mt-4 text-sm font-medium text-destructive" role="alert">{error}</p>}

                <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
                  <p className="text-xs leading-5 text-muted-foreground">We’ll use your work email to follow up.</p>
                  <Button type="submit" size="lg" className="group min-w-44">
                    Submit request
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Pearl 27 · Internal support desk</span>
          <span>Support hours: Monday–Friday, 8:00–17:00</span>
        </footer>
      </div>
    </main>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SupportPoint({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-brand [&_svg]:size-5">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-primary">{title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}

function Confirmation({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
      <div className="animate-check-in flex size-16 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="size-8" strokeWidth={2.5} />
      </div>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-brand">Request received</p>
      <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight text-primary">You’re all set.</h2>
      <p className="mt-5 max-w-sm text-base leading-7 text-muted-foreground">
        Your support request has been sent to the System Support team. We’ll follow up by email shortly.
      </p>
      <Button type="button" variant="outline" className="mt-9" onClick={onReset}>Submit another request</Button>
    </div>
  );
}
