"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Ambulance,
  ArrowLeft,
  Bed,
  CheckCircle2,
  Clock,
  Hospital,
  Loader2,
  MapPin,
  RefreshCw,
  Siren,
} from "lucide-react";

import api from "@/lib/api";

interface Emergency {
  id: string;
  severity: string;
  status: string;
  description?: string;
  requiredDepartment?: string;
  requiredBloodGroup?: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationEta?: number;
  createdAt: string;

  Hospital?: {
    id: string;
    name: string;
    city: string;
    address: string;
    emergencyDepartment: string;
    icuBedsAvailable: number;
    generalBedsAvailable: number;
  };

  Ambulance?: {
    id: string;
    vehicleNumber: string;
    driverName?: string;
    phone?: string;
    status: string;
    currentEta?: number;
  };

  EmergencyStatusHistory?: {
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }[];
}

const formatStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const getSeverityStyle = (severity: string) => {
  if (severity === "CRITICAL") {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (severity === "HIGH") {
    return "border-orange-500/30 bg-orange-500/10 text-orange-400";
  }

  if (severity === "MEDIUM") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-400";
};

export default function HospitalEmergencyDetailPage() {
  const params = useParams();

  const emergencyId = params.id as string;

  const [emergency, setEmergency] =
    useState<Emergency | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadEmergency = async () => {
    try {
      setError("");

      const response = await api.get(
        `/emergencies/${emergencyId}`
      );

      const data =
        response.data.data?.emergency ||
        response.data.data;

      setEmergency(data);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load emergency."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmergency();
  }, [emergencyId]);

  const refresh = () => {
    setRefreshing(true);
    loadEmergency();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-red-400"
          />

          <p className="mt-4 text-slate-400">
            Loading emergency...
          </p>
        </div>
      </main>
    );
  }

  if (error || !emergency) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <Siren
            size={40}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-4 text-xl font-bold">
            Emergency Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {error ||
              "Unable to load emergency details."}
          </p>

          <Link
            href="/hospital/emergencies"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Back to Emergencies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}

      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/hospital/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <Hospital size={21} />
            </div>

            <div>
              <p className="font-bold">
                MediRoute
              </p>

              <p className="text-xs text-slate-500">
                Hospital Emergency
              </p>
            </div>
          </Link>

          <div className="flex gap-3">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <Link
              href="/hospital/emergencies"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              Emergencies
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                Emergency Details
              </h1>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                  emergency.severity
                )}`}
              >
                {emergency.severity}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Emergency ID: {emergency.id}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            {formatStatus(emergency.status)}
          </div>
        </div>

        {/* MAIN GRID */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* PATIENT REQUEST */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Siren size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Emergency Request
                </h2>

                <p className="text-sm text-slate-500">
                  Patient emergency information
                </p>
              </div>
            </div>

            {emergency.description && (
              <div className="mt-6 rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-slate-600">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {emergency.description}
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-slate-600">
                  Required Department
                </p>

                <p className="mt-2 font-medium">
                  {emergency.requiredDepartment ||
                    "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-slate-600">
                  Blood Group
                </p>

                <p className="mt-2 font-medium">
                  {emergency.requiredBloodGroup
                    ? emergency.requiredBloodGroup
                        .replace(
                          "_POSITIVE",
                          "+"
                        )
                        .replace(
                          "_NEGATIVE",
                          "-"
                        )
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-900 p-4">
              <div className="flex items-center gap-2">
                <MapPin
                  size={17}
                  className="text-red-400"
                />

                <p className="text-xs text-slate-600">
                  Pickup Location
                </p>
              </div>

              <p className="mt-2 text-sm text-slate-300">
                {emergency.pickupAddress}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                {emergency.pickupLatitude},{" "}
                {emergency.pickupLongitude}
              </p>
            </div>
          </div>

          {/* HOSPITAL */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <Hospital
                size={22}
                className="text-blue-400"
              />

              <h2 className="text-lg font-bold">
                Hospital Resources
              </h2>
            </div>

            {emergency.Hospital && (
              <>
                <p className="mt-6 font-semibold">
                  {emergency.Hospital.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {emergency.Hospital.address}
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                    <span className="text-sm text-slate-500">
                      Emergency Department
                    </span>

                    <span className="text-sm font-semibold text-emerald-400">
                      {
                        emergency.Hospital
                          .emergencyDepartment
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <Bed size={15} />
                      ICU Beds
                    </span>

                    <span className="font-bold text-purple-400">
                      {
                        emergency.Hospital
                          .icuBedsAvailable
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <Bed size={15} />
                      General Beds
                    </span>

                    <span className="font-bold text-blue-400">
                      {
                        emergency.Hospital
                          .generalBedsAvailable
                      }
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* AMBULANCE */}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Ambulance size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Ambulance Information
              </h2>

              <p className="text-sm text-slate-500">
                Incoming emergency vehicle
              </p>
            </div>
          </div>

          {emergency.Ambulance ? (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-slate-600">
                  Vehicle
                </p>

                <p className="mt-2 font-bold">
                  {
                    emergency.Ambulance
                      .vehicleNumber
                  }
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-slate-600">
                  Driver
                </p>

                <p className="mt-2 font-medium">
                  {emergency.Ambulance
                    .driverName ||
                    "Assigned"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-slate-600">
                  Status
                </p>

                <p className="mt-2 font-medium text-blue-400">
                  {formatStatus(
                    emergency.Ambulance
                      .status
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-slate-600">
                  ETA
                </p>

                <p className="mt-2 font-bold text-emerald-400">
                  {emergency.Ambulance
                    .currentEta !==
                  undefined
                    ? `${emergency.Ambulance.currentEta} min`
                    : "Updating"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
              <p className="text-sm text-yellow-400">
                Ambulance has not been assigned yet.
              </p>
            </div>
          )}
        </div>

        {/* TIMELINE */}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-bold">
            Emergency Timeline
          </h2>

          <div className="mt-6 space-y-5">
            {emergency.EmergencyStatusHistory?.map(
              (item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 size={17} />
                    </div>

                    {index <
                      (emergency
                        .EmergencyStatusHistory
                        ?.length || 0) -
                        1 && (
                      <div className="mt-2 h-8 w-px bg-white/10" />
                    )}
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row">
                      <p className="font-semibold">
                        {formatStatus(
                          item.status
                        )}
                      </p>

                      <p className="text-xs text-slate-600">
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    {item.note && (
                      <p className="mt-1 text-sm text-slate-500">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* QUICK STATUS */}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-bold">
            Coordination Status
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-emerald-500/5 p-4">
              <CheckCircle2
                size={20}
                className="text-emerald-400"
              />

              <p className="mt-3 text-sm font-semibold">
                Emergency Received
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/5 p-4">
              <Hospital
                size={20}
                className="text-blue-400"
              />

              <p className="mt-3 text-sm font-semibold">
                Hospital Coordination
              </p>
            </div>

            <div className="rounded-xl bg-purple-500/5 p-4">
              <Ambulance
                size={20}
                className="text-purple-400"
              />

              <p className="mt-3 text-sm font-semibold">
                Ambulance Tracking
              </p>
            </div>

            <div className="rounded-xl bg-orange-500/5 p-4">
              <Clock
                size={20}
                className="text-orange-400"
              />

              <p className="mt-3 text-sm font-semibold">
                Pre-Arrival Coordination
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform for emergency
          coordination and healthcare resource availability.
          It does not provide medical diagnosis or treatment
          advice.
        </p>
      </div>
    </main>
  );
}