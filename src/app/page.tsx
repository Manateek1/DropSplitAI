import Link from "next/link";
import { ArrowRight, Bot, ChartLine, Clock3, MessagesSquare, Upload } from "lucide-react";

import { LogoMark } from "@/components/common/logo-mark";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { LANDING_FAQS } from "@/lib/constants";
import { pricingTiers } from "@/lib/stripe";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Coach-style weekly planning",
    description: "Get a full week built around your events, schedule, times, and how your body handles training.",
    icon: Clock3,
  },
  {
    title: "Chat-first swim coaching",
    description: "Ask normal questions like you would text a real coach and get practical answers fast.",
    icon: MessagesSquare,
  },
  {
    title: "Real progress tracking",
    description: "Log times, see your trend by event, and understand where you are actually dropping time.",
    icon: ChartLine,
  },
  {
    title: "Screenshot-friendly uploads",
    description: "Upload meet results, splits, or a practice board and let the coach summarize the useful parts.",
    icon: Upload,
  },
];

const sampleChats = [
  {
    user: "hey i swam 50 free today i got a 25.29",
    coach:
      "Nice. 25.29 is real progress. Good sign: you are getting speed without falling apart late. Next goal is keeping the last 10 yards calmer so you hold more water through the finish.",
  },
  {
    user: "make today easier, i'm sore",
    coach:
      "Good call. Keep the warmup, cut the hardest reps in half, and turn the rest into smooth aerobic swimming with clean turns. If the soreness feels sharp, stop and talk to your coach and a parent.",
  },
  {
    user: "what's a good warmup for breaststroke day?",
    coach:
      "Try 300 easy swim, 4 x 50 kick with line focus, 4 x 50 as 25 drill + 25 swim, then 4 x 25 build. That wakes up timing without loading the legs too early.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-white/70 bg-white/90 px-5 py-4 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.18)] backdrop-blur">
          <LogoMark />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-950">Log in</Link>
            <Link href="/signup" className={cn(buttonVariants({ className: "rounded-full bg-slate-950 text-white hover:bg-slate-800" }))}>
              Start free
            </Link>
          </div>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
              <Bot className="h-4 w-4" />
              Personalized swim coaching, powered by AI
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Personalized swim coaching that feels like texting your coach.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Enter your events, current times, schedule, and goals, and get a personalized weekly swim plan with coach-style adjustments, easy logging, and smart event guidance.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className={cn(buttonVariants({ className: "rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800" }))}
              >
                Start free
              </Link>
              <Link
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline", className: "rounded-full border-slate-200 px-6 text-slate-700" }))}
              >
                See how it works
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Built for", value: "Middle + high school swimmers" },
                { label: "Best fit", value: "Intermediate swimmers who want more 1-on-1 help" },
                { label: "Main value", value: "Plans, workouts, logs, and coach-style chat" },
              ].map((item) => (
                <Card key={item.label} className="border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)]">
                  <CardContent className="space-y-2 p-5">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-base font-semibold text-slate-950">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.25)]">
            <div className="rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(20,216,230,0.18),_transparent_55%),#0f172a] p-5 text-white">
              <div className="rounded-[24px] bg-white/8 p-4 backdrop-blur">
                <p className="text-sm text-white/70">This week</p>
                <p className="mt-2 text-4xl font-semibold">17.8k yds</p>
                <p className="mt-2 text-sm text-white/70">Freestyle speed endurance + backstroke underwaters</p>
              </div>
              <div className="mt-4 space-y-3 rounded-[24px] bg-white/8 p-4 backdrop-blur">
                <div className="rounded-2xl bg-white px-4 py-3 text-slate-700 shadow-sm">hey i swam 50 free today i got a 25.29</div>
                <div className="rounded-2xl border border-white/15 bg-[#112033] px-4 py-4 shadow-sm">
                  <p className="text-sm leading-7 text-white">Nice. 25.29 is a real step. I logged it for today and I want you thinking about one thing next: calm last 10 yards.</p>
                  <div className="mt-3 rounded-2xl bg-cyan-50 px-3 py-3 text-sm font-medium text-cyan-700">50 free logged today — 25.29</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="space-y-8 py-8 lg:py-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-600">How it works</p>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950">Set up once, then coach chat becomes the center of the product.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Tell DropSplit AI your age, events, times, schedule, and goals.",
              "Get a weekly plan, daily workouts, and a dashboard that actually feels useful.",
              "Text the coach after practice to log times, adjust workouts, explain sets, or decide event focus.",
            ].map((step, index) => (
              <Card key={step} className="border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)]">
                <CardContent className="space-y-3 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-lg font-semibold text-cyan-700">{index + 1}</div>
                  <p className="text-base leading-7 text-slate-700">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="space-y-8 py-8 lg:py-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-600">Sample chat</p>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950">Simple messages, useful coaching.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {sampleChats.map((example) => (
              <Card key={example.user} className="border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)]">
                <CardContent className="space-y-4 p-5">
                  <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm leading-7 text-white">{example.user}</div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">{example.coach}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:py-16">
          <Card className="border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)]">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-600">Progress tracking</p>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950">Times should feel satisfying to watch.</h2>
              <p className="text-sm leading-7 text-slate-500">DropSplit AI tracks times since joining, highlights personal bests, and makes trend lines easy to understand.</p>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Progress charts by event",
              "Days swum this week",
              "Coach notes attached to real swims",
              "Consistency streak and weekly yardage snapshots",
            ].map((item) => (
              <Card key={item} className="border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)]">
                <CardContent className="p-6 text-base font-medium text-slate-700">{item}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8 py-8 lg:py-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-600">Pricing</p>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950">Generous free tier. Unlimited coaching when swimmers are ready.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)] ${"highlighted" in tier && tier.highlighted ? "bg-[radial-gradient(circle_at_top,_rgba(20,216,230,0.16),_transparent_55%),white]" : ""}`}
              >
                <CardContent className="space-y-5 p-6">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{tier.name}</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                      {tier.priceLabel}
                      <span className="text-base font-medium text-slate-500">
                        {"cadence" in tier ? tier.cadence : ""}
                      </span>
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{tier.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {tier.features.map((feature) => <li key={feature}>• {feature}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4 py-8 lg:py-16">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950">FAQ</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {LANDING_FAQS.map((faq) => (
              <Card key={faq.question} className="border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.18)]">
                <CardContent className="space-y-3 p-6">
                  <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
                  <p className="text-sm leading-7 text-slate-500">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(20,216,230,0.16),_transparent_55%),white] p-8 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.24)] sm:p-10 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-600">Ready to swim smarter?</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Build your first personalized week with DropSplit AI.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">Get an MVP that already feels like a real startup product — polished, fast, and centered around coach chat.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0">
            <Link
              href="/signup"
              className={cn(buttonVariants({ className: "rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800" }))}
            >
              Start free
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", className: "rounded-full border-slate-200 px-6 text-slate-700" }))}
            >
              See app shell
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
