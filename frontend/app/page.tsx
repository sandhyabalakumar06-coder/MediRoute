"use client";

import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  Bed,
  HeartPulse,
  Hospital,
  MapPin,
  ShieldCheck,
  Siren,
  Activity,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <HeartPulse size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                MediRoute
              </h1>

              <p className="text-xs text-slate-400">
                Emergency Coordination
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              How It Works
            </a>

            <Link
              href="/login"
              className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              <Activity size={16} />
              Real-Time Emergency Coordination
            </div>

            <h2 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Connecting
              <span className="text-red-400">
                {" "}
                emergencies
              </span>
              <br />
              to the right resources.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              MediRoute helps coordinate emergency requests,
              hospital availability, ambulance assignment and
              real-time patient transport updates in one platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3.5 font-semibold transition hover:bg-red-600"
              >
                Access MediRoute
                <ArrowRight size={18} />
              </Link>

              <a
                href="#how-it-works"
                className="rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Explore Platform
              </a>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Demo platform • Simulated emergency data
            </p>
          </div>

          {/* Emergency Card */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Emergency Coordination
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Active Emergency
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                  <Siren size={24} />
                </div>
              </div>

              <div className="space-y-4">
                <StatusItem
                  icon={<MapPin size={18} />}
                  title="Emergency Request"
                  text="Patient location received"
                  active
                />

                <StatusItem
                  icon={<Hospital size={18} />}
                  title="Hospital Selected"
                  text="Green Valley Medical Center"
                  active
                />

                <StatusItem
                  icon={<Ambulance size={18} />}
                  title="Ambulance En Route"
                  text="ETA: 8 minutes"
                  active
                />

                <StatusItem
                  icon={<ShieldCheck size={18} />}
                  title="Hospital Notified"
                  text="Pre-arrival alert sent"
                  active
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-white/10 bg-slate-900/60"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
              Platform Features
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              One platform for emergency coordination
            </h2>

            <p className="mt-4 text-slate-400">
              MediRoute brings hospitals, ambulances, patients and
              emergency coordinators together through a shared
              coordination system.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Hospital />}
              title="Hospital Availability"
              description="View emergency department, ICU and general bed availability."
            />

            <FeatureCard
              icon={<Ambulance />}
              title="Ambulance Coordination"
              description="Assign ambulances and track simulated movement in real time."
            />

            <FeatureCard
              icon={<MapPin />}
              title="Live Location"
              description="Monitor emergency pickup and ambulance locations on a map."
            />

            <FeatureCard
              icon={<Bed />}
              title="Resource Visibility"
              description="View hospital beds and blood inventory availability."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-white/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              From emergency request to hospital arrival
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <Step
              number="01"
              title="Emergency Request"
              text="Create an emergency request with pickup location and requirements."
            />

            <Step
              number="02"
              title="Hospital Matching"
              text="Compare nearby hospitals using availability information."
            />

            <Step
              number="03"
              title="Ambulance Assignment"
              text="Assign an available ambulance and start the journey."
            />

            <Step
              number="04"
              title="Hospital Alert"
              text="Notify the destination hospital before patient arrival."
            />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-sm leading-6 text-slate-400">
              <span className="font-semibold text-yellow-400">
                Medical Disclaimer:
              </span>{" "}
              MediRoute is a demonstration platform for emergency
              coordination and healthcare resource availability.
              It does not provide medical diagnosis or treatment
              advice. In a real emergency, contact local emergency
              services and qualified healthcare professionals.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            © 2026 MediRoute • Emergency Coordination Platform
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatusItem({
  icon,
  title,
  text,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/70 p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-red-500/15 text-red-400"
            : "bg-white/5 text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:bg-white/[0.06]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <span className="text-sm font-bold text-red-400">
        {number}
      </span>

      <h3 className="mt-4 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}