"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import api from "@/lib/api";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setError("");

      const response = await api.get("/dashboard/admin");

      console.log("Admin users response:", response.data);

      const responseData = response.data?.data;

      const dashboard =
        responseData?.dashboard ||
        responseData ||
        {};

      const userData = Array.isArray(dashboard?.users)
        ? dashboard.users
        : [];

      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err: any) {
      console.error("Users loading error:", err);

      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        localStorage.removeItem("mediroute_token");
        localStorage.removeItem("mediroute_user");
        router.push("/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    if (search.trim()) {
      const term = search.toLowerCase();

      result = result.filter((user) =>
        [
          user.name,
          user.email,
          user.phone,
          user.role,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(term)
          )
      );
    }

    if (roleFilter !== "ALL") {
      result = result.filter(
        (user) => user.role === roleFilter
      );
    }

    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const getRoleStyle = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-400";

      case "HOSPITAL":
        return "bg-emerald-500/10 text-emerald-400";

      case "AMBULANCE_OPERATOR":
        return "bg-amber-500/10 text-amber-400";

      case "EMERGENCY_COORDINATOR":
        return "bg-purple-500/10 text-purple-400";

      case "PATIENT":
        return "bg-blue-500/10 text-blue-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const formatRole = (role?: string) => {
    if (!role) return "Unknown";

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-red-400"
          />

          <p className="mt-4 text-slate-400">
            Loading users...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="font-bold">
                MediRoute
              </p>

              <p className="text-xs text-slate-500">
                Admin Portal
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

        </div>
      </nav>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* BACK */}
        <button
          onClick={() =>
            router.push("/admin/dashboard")
          }
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </button>

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold">
                User Management
              </h1>

              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                ADMIN
              </span>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              View registered MediRoute users and
              their assigned roles.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">

            <Users
              size={20}
              className="text-blue-400"
            />

            <div>
              <p className="text-xs text-slate-500">
                Total Users
              </p>

              <p className="font-bold">
                {users.length}
              </p>
            </div>

          </div>

        </div>

        {/* SEARCH + FILTER */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">

            {/* SEARCH */}
            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, email, phone or role..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500/50"
              />

            </div>

            {/* ROLE FILTER */}
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="ADMIN">
                Admin
              </option>

              <option value="HOSPITAL">
                Hospital
              </option>

              <option value="AMBULANCE_OPERATOR">
                Ambulance Operator
              </option>

              <option value="EMERGENCY_COORDINATOR">
                Emergency Coordinator
              </option>

              <option value="PATIENT">
                Patient
              </option>
            </select>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* USERS */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="border-b border-white/10 px-6 py-5">

            <h2 className="font-semibold">
              Registered Users
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Showing {filteredUsers.length} of{" "}
              {users.length} users
            </p>

          </div>

          {filteredUsers.length === 0 ? (

            <div className="p-12 text-center">

              <Users
                size={40}
                className="mx-auto text-slate-700"
              />

              <p className="mt-4 text-slate-500">
                No users found.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-white/5">

              {filteredUsers.map((user) => (

                <div
                  key={user.id}
                  className="p-5 transition hover:bg-white/[0.02]"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* USER INFO */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-slate-300">
                        {(
                          user.name ||
                          user.email ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="font-semibold">
                          {user.name ||
                            "Unnamed User"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {user.email ||
                            "No email"}
                        </p>

                        {user.phone && (
                          <p className="mt-1 text-xs text-slate-600">
                            {user.phone}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* ROLE + STATUS */}
                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getRoleStyle(
                          user.role
                        )}`}
                      >
                        {formatRole(user.role)}
                      </span>

                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          user.isActive !== false
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >

                        {user.isActive !== false ? (
                          <>
                            <UserCheck size={13} />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX size={13} />
                            Inactive
                          </>
                        )}

                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* DISCLAIMER */}
        <p className="mt-8 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform for
          emergency coordination and healthcare
          resource availability.
        </p>

      </div>
    </main>
  );
}