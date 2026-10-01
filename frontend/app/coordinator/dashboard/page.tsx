"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Ambulance,
  Building2,
  Clock,
  HeartPulse,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import api from "@/lib/api";

interface DashboardData {
  statistics?: {
    totalEmergencies?: number;
    activeEmergencies?: number;
    totalHospitals?: number;
    activeHospitals?: number;
    totalAmbulances?: number;
    availableAmbulances?: number;
  };

  activeEmergencies?: any[];
  hospitals?: any[];
  ambulances?: any[];
  notifications?: any[];
}

export default function CoordinatorDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/coordinator"
      );

      setDashboard(response.data.data);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to load coordinator dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-slate-300">
            Loading Coordinator Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-xl mx-auto mt-20 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <h1 className="text-xl font-bold text-red-400">
            Dashboard Error
          </h1>

          <p className="mt-2 text-slate-300">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-5 rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const stats = dashboard?.statistics || {};

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2">
                <ShieldCheck className="h-7 w-7 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  MediRoute
                </h1>

                <p className="text-sm text-slate-400">
                  Emergency Coordination Center
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <p className="text-sm font-medium text-cyan-400">
            LIVE CONTROL CENTER
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            Emergency Coordinator Dashboard
          </h2>

          <p className="mt-2 text-slate-400">
            Monitor emergencies, hospitals and ambulance
            availability from one place.
          </p>
        </div>

        {/* Statistics */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Emergencies"
            value={stats.activeEmergencies ?? 0}
            icon={<Activity />}
            description="Currently being coordinated"
          />

          <StatCard
            title="Hospitals"
            value={stats.totalHospitals ?? 0}
            icon={<Building2 />}
            description={`${stats.activeHospitals ?? 0} active`}
          />

          <StatCard
            title="Ambulances"
            value={stats.totalAmbulances ?? 0}
            icon={<Ambulance />}
            description={`${stats.availableAmbulances ?? 0} available`}
          />

          <StatCard
            title="Total Emergencies"
            value={stats.totalEmergencies ?? 0}
            icon={<HeartPulse />}
            description="All recorded requests"
          />
        </section>

        {/* Main content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Active emergencies */}
          <section className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Active Emergencies
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Current emergency coordination status
                </p>
              </div>

              <Link
                href="/coordinator/emergencies"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                View All
              </Link>
            </div>

            {dashboard?.activeEmergencies?.length ? (
              <div className="space-y-4">
                {dashboard.activeEmergencies.map(
                  (emergency: any) => (
                    <div
                      key={emergency.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                              {emergency.severity ||
                                "UNKNOWN"}
                            </span>

                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                              {emergency.status ||
                                "UNKNOWN"}
                            </span>
                          </div>

                          <h4 className="mt-3 font-semibold">
                            Emergency Request
                          </h4>

                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                            <MapPin className="h-4 w-4" />

                            {emergency.pickupAddress ||
                              "Location unavailable"}
                          </div>
                        </div>

                        <Link
                          href={`/patient/emergency/${emergency.id}`}
                          className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm hover:bg-slate-800"
                        >
                          Open Emergency
                        </Link>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">
                <HeartPulse className="mx-auto h-10 w-10 text-slate-600" />

                <p className="mt-3 font-medium text-slate-300">
                  No active emergencies
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  New emergency requests will appear here.
                </p>
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-bold">
              Quick Actions
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Coordinator tools
            </p>

            <div className="mt-6 space-y-3">
              <QuickAction
                href="/coordinator/emergencies"
                icon={<Activity />}
                title="Emergency Control"
                description="Manage emergency requests"
              />

              <QuickAction
                href="/coordinator/hospitals"
                icon={<Building2 />}
                title="Hospitals"
                description="View hospital availability"
              />

              <QuickAction
                href="/coordinator/ambulances"
                icon={<Ambulance />}
                title="Ambulances"
                description="Monitor ambulance fleet"
              />
            </div>
          </section>
        </div>

        {/* Hospitals + Ambulances */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Hospitals */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Hospital Availability
                </h3>

                <p className="text-sm text-slate-400">
                  Current hospital status
                </p>
              </div>

              <Building2 className="h-6 w-6 text-cyan-400" />
            </div>

            <div className="mt-5 space-y-3">
              {dashboard?.hospitals
                ?.slice(0, 5)
                .map((hospital: any) => (
                  <div
                    key={hospital.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {hospital.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {hospital.city ||
                          "Location unavailable"}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                      {hospital.status ||
                        "ACTIVE"}
                    </span>
                  </div>
                ))}

              {!dashboard?.hospitals?.length && (
                <p className="py-6 text-center text-sm text-slate-500">
                  No hospital data available.
                </p>
              )}
            </div>
          </section>

          {/* Ambulances */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Ambulance Fleet
                </h3>

                <p className="text-sm text-slate-400">
                  Current ambulance status
                </p>
              </div>

              <Ambulance className="h-6 w-6 text-cyan-400" />
            </div>

            <div className="mt-5 space-y-3">
              {dashboard?.ambulances
                ?.slice(0, 5)
                .map((ambulance: any) => (
                  <div
                    key={ambulance.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {ambulance.vehicleNumber ||
                          "Ambulance"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {ambulance.driverName ||
                          "Demo ambulance"}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                      {ambulance.status ||
                        "AVAILABLE"}
                    </span>
                  </div>
                ))}

              {!dashboard?.ambulances?.length && (
                <p className="py-6 text-center text-sm text-slate-500">
                  No ambulance data available.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-400">
          <strong className="text-amber-400">
            Demo Platform:
          </strong>{" "}
          MediRoute is a demonstration platform for
          emergency coordination and healthcare resource
          availability. It does not provide medical diagnosis
          or treatment advice. In a real emergency, contact
          local emergency services and qualified healthcare
          professionals.
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-cyan-500/40 hover:bg-slate-800"
    >
      <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
        {icon}
      </div>

      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}