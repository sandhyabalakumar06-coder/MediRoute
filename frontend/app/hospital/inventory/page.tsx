"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Droplets,
  Hospital,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";

import api from "@/lib/api";

interface BloodItem {
  bloodGroup: string;
  units: number;
  lastUpdated: string;
}

const bloodGroups = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const bloodLabel = (group: string) => {
  const labels: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };

  return labels[group] || group;
};

export default function HospitalInventoryPage() {
  const [inventory, setInventory] = useState<BloodItem[]>([]);
  const [hospitalId, setHospitalId] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [savingGroup, setSavingGroup] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [units, setUnits] =
    useState<Record<string, number>>({});

  // ==========================================
  // LOAD BLOOD INVENTORY
  // ==========================================

  const loadInventory = async () => {
    try {
      setError("");
      setMessage("");

      // First get hospital dashboard
      const dashboardResponse =
        await api.get("/dashboard/hospital");

      const dashboard =
        dashboardResponse.data.data?.dashboard ||
        dashboardResponse.data.data;

      if (!dashboard?.hospital?.id) {
        throw new Error(
          "Hospital information not found."
        );
      }

      const id = dashboard.hospital.id;

      setHospitalId(id);

      // Correct backend route
      const response = await api.get(
        `/blood/hospital/${id}`
      );

      const data =
        response.data.data?.inventory ||
        response.data.data ||
        [];

      setInventory(data);

      const unitMap: Record<string, number> = {};

      data.forEach((item: BloodItem) => {
        unitMap[item.bloodGroup] =
          item.units;
      });

      setUnits(unitMap);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load blood inventory."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadInventory();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadInventory();
  };

  // ==========================================
  // UPDATE BLOOD INVENTORY
  // ==========================================

  const handleSave = async (
    bloodGroup: string
  ) => {
    try {
      setSavingGroup(bloodGroup);
      setError("");
      setMessage("");

      const value = Number(
        units[bloodGroup] || 0
      );

      if (value < 0) {
        setError(
          "Blood units cannot be negative."
        );
        setSavingGroup("");
        return;
      }

      // Correct backend PATCH route
      await api.patch(
        `/blood/hospital/${hospitalId}`,
        {
          bloodGroup,
          units: value,
        }
      );

      setMessage(
        `${bloodLabel(
          bloodGroup
        )} inventory updated successfully.`
      );

      // Reload latest data
      await loadInventory();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update blood inventory."
      );
    } finally {
      setSavingGroup("");
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-red-400"
          />

          <p className="mt-4 text-slate-400">
            Loading blood inventory...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* LOGO */}

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
                Hospital Portal
              </p>
            </div>
          </Link>

          {/* NAV BUTTONS */}

          <div className="flex items-center gap-3">

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
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
              href="/hospital/dashboard"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={16} />

              Dashboard
            </Link>

          </div>
        </div>
      </nav>

      {/* ======================================
          CONTENT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Droplets size={25} />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Blood Inventory
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage available blood units
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* ======================================
            SUCCESS MESSAGE
        ====================================== */}

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {/* ======================================
            ERROR MESSAGE
        ====================================== */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ======================================
            BLOOD GROUP CARDS
        ====================================== */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {bloodGroups.map(
            (bloodGroup) => {

              const currentUnits =
                units[bloodGroup] ?? 0;

              const item =
                inventory.find(
                  (entry) =>
                    entry.bloodGroup ===
                    bloodGroup
                );

              return (
                <div
                  key={bloodGroup}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-red-500/20"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                      <Droplets
                        size={22}
                        className="text-red-400"
                      />
                    </div>

                    <span className="text-2xl font-bold text-red-400">
                      {bloodLabel(
                        bloodGroup
                      )}
                    </span>

                  </div>

                  {/* AVAILABLE UNITS */}

                  <div className="mt-6">

                    <p className="text-xs text-slate-500">
                      Available Units
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {currentUnits}
                    </p>

                  </div>

                  {/* INPUT */}

                  <div className="mt-5">

                    <label className="text-xs text-slate-500">
                      Update Units
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={currentUnits}
                      onChange={(e) =>
                        setUnits(
                          (previous) => ({
                            ...previous,
                            [bloodGroup]:
                              Number(
                                e.target.value
                              ),
                          })
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500"
                    />

                  </div>

                  {/* UPDATE BUTTON */}

                  <button
                    onClick={() =>
                      handleSave(
                        bloodGroup
                      )
                    }
                    disabled={
                      savingGroup ===
                      bloodGroup
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {savingGroup ===
                    bloodGroup ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />

                        Update
                      </>
                    )}

                  </button>

                  {/* LAST UPDATED */}

                  {item?.lastUpdated && (
                    <p className="mt-3 text-center text-[11px] text-slate-600">
                      Updated{" "}
                      {new Date(
                        item.lastUpdated
                      ).toLocaleString()}
                    </p>
                  )}

                </div>
              );
            }
          )}

        </div>

        {/* ======================================
            INFORMATION BOX
        ====================================== */}

        <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

          <div className="flex items-start gap-3">

            <Droplets
              size={21}
              className="mt-0.5 text-blue-400"
            />

            <div>

              <h2 className="font-semibold text-blue-400">
                Inventory Information
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This section displays simulated/demo
                blood inventory for the MediRoute
                demonstration platform. It is intended
                for resource availability tracking only
                and does not provide blood compatibility
                or clinical decision support.
              </p>

            </div>

          </div>

        </div>

        {/* ======================================
            FOOTER
        ====================================== */}

        <p className="mt-8 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform for
          emergency coordination and healthcare
          resource availability. It does not provide
          medical diagnosis or treatment advice.
        </p>

      </div>

    </main>
  );
}