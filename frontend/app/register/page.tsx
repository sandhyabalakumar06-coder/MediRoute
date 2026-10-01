"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  User,
  Mail,
  Lock,
  Phone,
  Loader2,
} from "lucide-react";

import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        phone,
        password,
      });

      const { token, user } = response.data.data;

      localStorage.setItem(
        "mediroute_token",
        token
      );

      localStorage.setItem(
        "mediroute_user",
        JSON.stringify(user)
      );

      router.push("/patient/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500">
              <HeartPulse size={26} />
            </div>

            <span className="text-2xl font-bold">
              MediRoute
            </span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Create Account
          </h1>

          <p className="mt-2 text-slate-400">
            Create your MediRoute patient account
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl">
          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 outline-none transition focus:border-red-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 outline-none transition focus:border-red-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Phone
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 outline-none transition focus:border-red-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 outline-none transition focus:border-red-500"
                />
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-3.5 font-semibold transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          MediRoute • Emergency Coordination Platform
        </p>
      </div>
    </main>
  );
}