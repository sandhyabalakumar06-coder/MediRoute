"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  Loader2,
  MapPin,
  Siren,
} from "lucide-react";

import api from "@/lib/api";

export default function NewEmergencyPage() {
  const router = useRouter();

  const [severity, setSeverity] =
    useState("MEDIUM");

  const [description, setDescription] =
    useState("");

  const [requiredDepartment, setRequiredDepartment] =
    useState("Emergency");

  const [requiredBloodGroup, setRequiredBloodGroup] =
    useState("");

  const [pickupAddress, setPickupAddress] =
    useState("");

  const [latitude, setLatitude] =
    useState("11.0183");

  const [longitude, setLongitude] =
    useState("76.9674");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/emergencies",
        {
          severity,
          description,
          requiredDepartment,
          requiredBloodGroup:
            requiredBloodGroup || undefined,
          pickupAddress,
          pickupLatitude: Number(latitude),
          pickupLongitude: Number(longitude),
        }
      );

      const emergency =
        response.data.data?.emergency ||
        response.data.data;

      router.push(
        `/patient/emergency/${emergency.id}`
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to create emergency request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/patient/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <HeartPulse size={22} />
            </div>

            <div>
              <p className="font-bold">
                MediRoute
              </p>

              <p className="text-xs text-slate-500">
                Emergency Request
              </p>
            </div>
          </Link>

          <Link
            href="/patient/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <Siren size={25} />
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Create Emergency Request
          </h1>

          <p className="mt-2 text-slate-400">
            Provide the emergency details so MediRoute
            can coordinate available resources.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Severity */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <label className="mb-3 block text-sm font-semibold">
              Emergency Severity
            </label>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                "LOW",
                "MEDIUM",
                "HIGH",
                "CRITICAL",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setSeverity(item)
                  }
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    severity === item
                      ? "border-red-500 bg-red-500/15 text-red-400"
                      : "border-white/10 bg-slate-900 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <label className="mb-2 block text-sm font-semibold">
              Emergency Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Briefly describe the emergency situation..."
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">
              Resource Requirements
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Required Department
                </label>

                <input
                  value={requiredDepartment}
                  onChange={(e) =>
                    setRequiredDepartment(
                      e.target.value
                    )
                  }
                  placeholder="Example: Emergency"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Blood Group
                </label>

                <select
                  value={requiredBloodGroup}
                  onChange={(e) =>
                    setRequiredBloodGroup(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-red-500"
                >
                  <option value="">
                    Not specified
                  </option>

                  <option value="A_POSITIVE">
                    A+
                  </option>

                  <option value="A_NEGATIVE">
                    A-
                  </option>

                  <option value="B_POSITIVE">
                    B+
                  </option>

                  <option value="B_NEGATIVE">
                    B-
                  </option>

                  <option value="AB_POSITIVE">
                    AB+
                  </option>

                  <option value="AB_NEGATIVE">
                    AB-
                  </option>

                  <option value="O_POSITIVE">
                    O+
                  </option>

                  <option value="O_NEGATIVE">
                    O-
                  </option>
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Availability information only; not a
                  clinical compatibility decision.
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2">
              <MapPin
                size={19}
                className="text-red-400"
              />

              <h2 className="text-lg font-semibold">
                Pickup Location
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Address
                </label>

                <input
                  value={pickupAddress}
                  onChange={(e) =>
                    setPickupAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter pickup address"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) =>
                      setLatitude(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) =>
                      setLongitude(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 font-semibold transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={19}
                  className="animate-spin"
                />
                Creating Emergency...
              </>
            ) : (
              <>
                <Siren size={19} />
                Create Emergency Request
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-600">
          MediRoute is a demonstration platform for emergency
          coordination. It does not provide medical diagnosis
          or treatment advice.
        </p>
      </div>
    </main>
  );
}