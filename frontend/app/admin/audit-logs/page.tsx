"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import api from "@/lib/api";

interface AuditLog {
  id: string;
  action?: string;
  entity?: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  User?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * The audit-log endpoint can differ depending on the backend schema.
       * We first try the dedicated endpoint.
       */
      const response = await api.get("/audit-logs");

      const responseData = response.data?.data;

      let data: AuditLog[] = [];

      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (Array.isArray(responseData?.logs)) {
        data = responseData.logs;
      } else if (Array.isArray(response.data?.logs)) {
        data = response.data.logs;
      }

      setLogs(data);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);

      setError(
        err?.response?.data?.message ||
          "Audit log API is not available yet."
      );

      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const actions = useMemo(() => {
    const uniqueActions = logs
      .map((log) => log.action)
      .filter(Boolean) as string[];

    return ["ALL", ...Array.from(new Set(uniqueActions))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        log.action?.toLowerCase().includes(query) ||
        log.entity?.toLowerCase().includes(query) ||
        log.entityId?.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        log.user?.name?.toLowerCase().includes(query) ||
        log.User?.name?.toLowerCase().includes(query) ||
        log.user?.email?.toLowerCase().includes(query) ||
        log.User?.email?.toLowerCase().includes(query);

      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const getUser = (log: AuditLog) => {
    return log.user || log.User;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getActionIcon = (action?: string) => {
    const value = action?.toLowerCase() || "";

    if (
      value.includes("login") ||
      value.includes("success") ||
      value.includes("create")
    ) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }

    if (
      value.includes("delete") ||
      value.includes("fail") ||
      value.includes("error")
    ) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }

    if (
      value.includes("update") ||
      value.includes("change") ||
      value.includes("edit")
    ) {
      return <Activity className="h-5 w-5 text-blue-600" />;
    }

    return <FileText className="h-5 w-5 text-slate-600" />;
  };

  const getActionBadge = (action?: string) => {
    const value = action?.toLowerCase() || "";

    if (
      value.includes("delete") ||
      value.includes("fail") ||
      value.includes("error")
    ) {
      return "bg-red-100 text-red-700";
    }

    if (
      value.includes("login") ||
      value.includes("success") ||
      value.includes("create")
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      value.includes("update") ||
      value.includes("change") ||
      value.includes("edit")
    ) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-blue-600" />

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                ADMIN
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Audit Logs
            </h1>

            <p className="mt-1 text-slate-600">
              Monitor important system activities and administrative events.
            </p>
          </div>

          <button
            onClick={loadLogs}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Logs
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {logs.length}
                </p>
              </div>

              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Displayed
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {filteredLogs.length}
                </p>
              </div>

              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Action Types
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {Math.max(actions.length - 1, 0)}
                </p>
              </div>

              <ShieldCheck className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search logs, users, actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action === "ALL" ? "All Actions" : action}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />

              <div>
                <h3 className="font-semibold text-amber-900">
                  Audit log service
                </h3>

                <p className="mt-1 text-sm text-amber-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading audit logs...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredLogs.length === 0 && !error && (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No audit logs found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              System activity logs will appear here when available.
            </p>
          </div>
        )}

        {/* Logs */}
        {!loading && filteredLogs.length > 0 && (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const user = getUser(log);

              return (
                <div
                  key={log.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        {getActionIcon(log.action)}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {log.action || "System Activity"}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getActionBadge(
                              log.action
                            )}`}
                          >
                            {log.entity || "SYSTEM"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          {log.description ||
                            "No description available for this activity."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />

                            {user?.name ||
                              user?.email ||
                              "System User"}
                          </span>

                          {user?.role && (
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {user.role}
                            </span>
                          )}

                          {log.entityId && (
                            <span>
                              ID: {log.entityId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-4 w-4" />

                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs leading-5 text-blue-800">
            <strong>Admin note:</strong> Audit logs are intended for
            demonstration and system monitoring purposes. In a production
            healthcare system, access to audit information should be
            restricted and handled according to applicable privacy,
            security, and compliance requirements.
          </p>
        </div>
      </div>
    </main>
  );
}