"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Ambulance,
  ArrowRight,
  HeartPulse,
  Hospital,
  LogOut,
  MapPin,
  Plus,
  ShieldCheck,
} from "lucide-react";

import api from "@/lib/api";

interface Emergency {
  id: string;
  severity: string;
  status: string;
  pickupAddress: string;
  createdAt: string;
  Hospital?: {
    name: string;
    city: string;
  } | null;
  Ambulance?: {
    vehicleNumber: string;
    status: string;
    currentEta: number | null;
  } | null;
}

interface DashboardData {
  patient: {
    id: string;
    bloodGroup: string | null;
    address: string | null;
  };
  totalEmergencies: number;
  activeEmergencies: number;
  emergencies: Emergency[];
}

export default function PatientDashboard() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get(
          "/dashboard/patient"
        );

        setData(response.data.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(
      "mediroute_token"
    );

    localStorage.removeItem(
      "mediroute_user"
    );

    window.location.href = "/login";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Activity
            size={32}
            className="mx-auto animate-pulse text-red-400"
          />

          <p className="mt-3 text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">
            {error}
          </p>

          <button
            onClick={() =>
              (window.location.href = "/login")
            }
            className="mt-5 rounded-lg bg-red-500 px-5 py-2 font-medium"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <HeartPulse size={22} />
            </div>

            <div>
              <h1 className="font-bold">
                MediRoute
              </h1>

              <p className="text-xs text-slate-500">
                Patient Portal
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-red-400">
              Patient Dashboard
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Emergency Coordination
            </h2>

            <p className="mt-2 text-slate-400">
              Monitor your emergency requests and
              coordination status.
            </p>
          </div>

          <Link
            href="/patient/emergency/new"
            className="flex w-fit items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold transition hover:bg-red-600"
          >
            <Plus size={18} />
            New Emergency
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <StatCard
            icon={<Activity />}
            title="Total Emergencies"
            value={data?.totalEmergencies ?? 0}
          />

          <StatCard
            icon={<Ambulance />}
            title="Active Emergencies"
            value={data?.activeEmergencies ?? 0}
          />

          <StatCard
            icon={<ShieldCheck />}
            title="Blood Group"
            value={
              data?.patient.bloodGroup
                ?.replace("_", " ")
                .replace("POSITIVE", "+")
                .replace("NEGATIVE", "-") ||
              "Not Set"
            }
          />
        </div>

        {/* Active Emergency */}
        {data?.activeEmergencies &&
          data.activeEmergencies > 0 && (
            <section className="mt-10">
              <h3 className="mb-4 text-xl font-semibold">
                Active Emergency
              </h3>

              {data.emergencies
                .filter(
                  (item) =>
                    ![
                      "COMPLETED",
                      "CANCELLED",
                    ].includes(item.status)
                )
                .map((emergency) => (
                  <EmergencyCard
                    key={emergency.id}
                    emergency={emergency}
                  />
                ))}
            </section>
          )}

        {/* History */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Emergency History
            </h3>
          </div>

          {data?.emergencies.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <Activity
                size={40}
                className="mx-auto text-slate-600"
              />

              <p className="mt-4 text-slate-400">
                No emergency requests yet.
              </p>

              <Link
                href="/patient/emergency/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 font-medium"
              >
                Create Emergency
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.emergencies.map(
                (emergency) => (
                  <EmergencyCard
                    key={emergency.id}
                    emergency={emergency}
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="mt-10 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <p className="text-xs leading-5 text-slate-400">
            <span className="font-semibold text-yellow-400">
              Medical Disclaimer:
            </span>{" "}
            MediRoute is a demonstration platform for
            emergency coordination and healthcare
            resource availability. It does not provide
            medical diagnosis or treatment advice.
          </p>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function EmergencyCard({
  emergency,
}: {
  emergency: Emergency;
}) {
  return (
    <Link
      href={`/patient/emergency/${emergency.id}`}
      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-red-500/30 hover:bg-white/[0.05]"
    >
      <div className="flex flex-col justify-between gap-5 md:flex-row">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
              {emergency.severity}
            </span>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              {emergency.status.replace(
                /_/g,
                " "
              )}
            </span>
          </div>

          <h4 className="mt-4 font-semibold">
            Emergency Request
          </h4>

          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <MapPin size={15} />
              {emergency.pickupAddress}
            </p>

            {emergency.Hospital && (
              <p className="flex items-center gap-2">
                <Hospital size={15} />
                {emergency.Hospital.name}
              </p>
            )}

            {emergency.Ambulance && (
              <p className="flex items-center gap-2">
                <Ambulance size={15} />
                {emergency.Ambulance.vehicleNumber}
                {emergency.Ambulance.currentEta !==
                  null &&
                  ` • ETA ${emergency.Ambulance.currentEta} min`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center text-slate-500">
          <ArrowRight size={22} />
        </div>
      </div>
    </Link>
  );
}