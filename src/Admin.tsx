import React, { useEffect, useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Search,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { supabase } from "./lib/supabase";

const statuses = [
  "NEW",
  "CONTACTED",
  "IN DISCUSSION",
  "APPROVED",
  "COMPLETED",
  "CANCELLED",
];

/* =========================
   ADMIN LOGIN
========================= */

export function AdminLogin() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!supabase) {
    return (
      <AuthShell>
        <p className="text-red-300">
          Supabase is not configured.
        </p>
      </AuthShell>
    );
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setBusy(true);
    setErr("");

    const { error } =
      await supabase!.auth.signInWithPassword({
        email,
        password: pw,
      });

    if (error) {
      setErr(
        "Unable to sign in. Please check your credentials."
      );
      setBusy(false);
      return;
    }

    nav("/admin");
    setBusy(false);
  };

  return (
    <AuthShell>
      <form
        onSubmit={login}
        className="surface rounded-2xl p-7"
      >
        <div className="mb-7">
          <Shield className="mb-5 text-violet-400" />

          <h1 className="text-2xl font-semibold">
            Admin sign in
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Private workspace for project requests.
          </p>
        </div>

        <label className="grid gap-2 text-sm">
          <span>Email</span>

          <input
            required
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="rounded-lg border border-white/10 bg-[#0b0b0d] px-4 py-3 outline-none focus:border-violet-500"
            placeholder="Admin email"
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm">
          <span>Password</span>

          <input
            required
            type="password"
            value={pw}
            onChange={(e) =>
              setPw(e.target.value)
            }
            className="rounded-lg border border-white/10 bg-[#0b0b0d] px-4 py-3 outline-none focus:border-violet-500"
            placeholder="Password"
          />
        </label>

        {err && (
          <p className="mt-4 text-sm text-red-300">
            {err}
          </p>
        )}

        <button
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-violet-600 py-3 font-medium transition hover:bg-violet-500 disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

/* =========================
   AUTH SHELL
========================= */

function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#080808] p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

/* =========================
   ADMIN GUARD
========================= */

export function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase!.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: admin, error } =
        await supabase!
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (!mounted) return;

      setIsAdmin(!error && !!admin);
      setLoading(false);
    };

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#080808] text-zinc-400">
        Loading secure workspace...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#080808] p-6 text-zinc-100">
        <div className="surface max-w-md rounded-2xl p-8 text-center">
          <Shield className="mx-auto mb-5 h-10 w-10 text-red-400" />

          <h1 className="text-2xl font-semibold">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Your account is authenticated but does
            not have administrator access.
          </p>

          <button
            onClick={async () => {
              await supabase?.auth.signOut();
              window.location.href =
                "/admin/login";
            }}
            className="mt-6 rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium transition hover:bg-violet-500"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/* =========================
   ADMIN LAYOUT
========================= */

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = useNavigate();

  const logout = async () => {
    await supabase?.auth.signOut();
    nav("/admin/login");
  };

  const menu = [
    [
      "/admin",
      "Dashboard",
      LayoutDashboard,
    ],
    [
      "/admin/bookings",
      "Bookings",
      ClipboardList,
    ],
    [
      "/admin/analytics",
      "Analytics",
      BarChart3,
    ],
    [
      "/admin/settings",
      "Settings",
      Settings,
    ],
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 md:grid md:grid-cols-[230px_1fr]">
      <aside className="hidden border-r border-white/5 bg-[#0b0b0d] p-5 md:block">
        <div className="mb-10 font-semibold">
          PG
          <span className="text-violet-400">
            .
          </span>{" "}
          Admin
        </div>

        <div className="space-y-1 text-sm">
          {menu.map(
            ([u, t, I]: any) => (
              <button
                key={u}
                onClick={() => nav(u)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-zinc-400 transition hover:bg-white/[.04] hover:text-white"
              >
                <I className="h-4 w-4" />
                {t}
              </button>
            )
          )}
        </div>

        <button
          onClick={logout}
          className="mt-10 flex items-center gap-3 px-3 text-sm text-zinc-500 transition hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="p-4 sm:p-7">
        {children}
      </main>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

export function Dashboard() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold">
        Dashboard
      </h1>

      <p className="mt-2 text-zinc-500">
        Your project request overview.
      </p>

      <Stats />

      <Recent />
    </AdminLayout>
  );
}

/* =========================
   STATS
========================= */

function Stats() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase
      ?.from("bookings")
      .select("status,created_at")
      .then(({ data }) => {
        setRows(data || []);
      });
  }, []);

  const month = new Date();

  const count = (status?: string) =>
    rows.filter(
      (r) => !status || r.status === status
    ).length;

  const cards = [
    ["Total Requests", rows.length],
    ["New Requests", count("NEW")],
    ["Contacted", count("CONTACTED")],
    ["In Discussion", count("IN DISCUSSION")],
    ["Approved", count("APPROVED")],
    ["Completed", count("COMPLETED")],
    ["Cancelled", count("CANCELLED")],
    [
      "This Month",
      rows.filter((r) => {
        const d = new Date(r.created_at);

        return (
          d.getMonth() === month.getMonth() &&
          d.getFullYear() ===
            month.getFullYear()
        );
      }).length,
    ],
  ];

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([title, number]) => (
        <div
          key={title as string}
          className="surface rounded-xl p-5"
        >
          <p className="text-sm text-zinc-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {number}
          </p>
        </div>
      ))}
    </div>
  );
}

/* =========================
   RECENT BOOKINGS
========================= */

function Recent() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase
      ?.from("bookings")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(8)
      .then(({ data }) => {
        setRows(data || []);
      });
  }, []);

  return (
    <div className="mt-8 surface overflow-hidden rounded-xl">
      <div className="border-b border-white/5 p-5 font-medium">
        Recent requests
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-zinc-500">
          No project requests yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                {[
                  "Request ID",
                  "Client",
                  "Type",
                  "Budget",
                  "Status",
                  "Date",
                ].map((x) => (
                  <th
                    key={x}
                    className="p-4 font-medium"
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-white/5"
                >
                  <td className="p-4 font-mono text-violet-300">
                    {r.request_id}
                  </td>

                  <td className="p-4">
                    {r.full_name}
                  </td>

                  <td className="p-4 text-zinc-400">
                    {r.website_type}
                  </td>

                  <td className="p-4 text-zinc-400">
                    {r.budget}
                  </td>

                  <td className="p-4">
                    <Status s={r.status} />
                  </td>

                  <td className="p-4 text-zinc-500">
                    {new Date(
                      r.created_at
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================
   STATUS
========================= */

function Status({ s }: { s: string }) {
  return (
    <span className="rounded-full border border-violet-400/20 bg-violet-500/5 px-2.5 py-1 text-xs text-violet-300">
      {s}
    </span>
  );
}

/* =========================
   BOOKINGS
========================= */

export function Bookings() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = () => {
    supabase
      ?.from("bookings")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .then(({ data }) => {
        setRows(data || []);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) =>
    [
      r.full_name,
      r.email,
      r.request_id,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold">
        Bookings
      </h1>

      <div className="mt-7 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            placeholder="Search client, email or request ID"
            className="w-full rounded-lg border border-white/10 bg-[#111113] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="mt-5 surface overflow-x-auto rounded-xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr>
              {[
                "Request ID",
                "Client",
                "Email",
                "Website Type",
                "Budget",
                "Timeline",
                "Date",
                "Status",
              ].map((x) => (
                <th
                  key={x}
                  className="p-4 font-medium"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() =>
                  location.href =
                    "/admin/bookings/" +
                    r.id
                }
                className="cursor-pointer border-t border-white/5 hover:bg-white/[.02]"
              >
                <td className="p-4 font-mono text-violet-300">
                  {r.request_id}
                </td>

                <td className="p-4">
                  {r.full_name}
                </td>

                <td className="p-4 text-zinc-400">
                  {r.email}
                </td>

                <td className="p-4 text-zinc-400">
                  {r.website_type}
                </td>

                <td className="p-4 text-zinc-400">
                  {r.budget}
                </td>

                <td className="p-4 text-zinc-400">
                  {r.timeline}
                </td>

                <td className="p-4 text-zinc-500">
                  {new Date(
                    r.created_at
                  ).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <Status s={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            No project requests yet.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

/* =========================
   BOOKING DETAIL
========================= */

export function BookingDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [r, setR] = useState<any>(null);

  useEffect(() => {
    supabase
      ?.from("bookings")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setR(data);
      });
  }, [id]);

  if (!r) {
    return (
      <AdminLayout>
        <p className="text-zinc-500">
          Loading request...
        </p>
      </AdminLayout>
    );
  }

  const update = async (status: string) => {
    const { data, error } =
      await supabase!
        .from("bookings")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (!error && data) {
      setR(data);
    }
  };

  const archive = async () => {
    if (
      confirm(
        "Archive this request?"
      )
    ) {
      await update("CANCELLED");
      nav("/admin/bookings");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-violet-300">
            {r.request_id}
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            {r.full_name}
          </h1>
        </div>

        <Status s={r.status} />
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {Object.entries(r)
          .filter(
            ([key]) =>
              ![
                "id",
                "status",
                "created_at",
                "updated_at",
              ].includes(key)
          )
          .map(([key, value]) => (
            <div
              key={key}
              className="surface rounded-xl p-5"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                {key.replaceAll("_", " ")}
              </p>

              <p className="mt-2 break-words text-sm text-zinc-300">
                {String(
                  value || "Not provided"
                )}
              </p>
            </div>
          ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() =>
              update(status)
            }
            className="rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:border-violet-500/50"
          >
            {status}
          </button>
        ))}

        <a
          href={"mailto:" + r.email}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:border-violet-500/50"
        >
          <Mail className="mr-1 inline h-3 w-3" />
          Email
        </a>

        <button
          onClick={archive}
          className="rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/5"
        >
          <Trash2 className="mr-1 inline h-3 w-3" />
          Archive
        </button>
      </div>
    </AdminLayout>
  );
}

/* =========================
   ANALYTICS
========================= */

export function Analytics() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase
      ?.from("bookings")
      .select(
        "website_type,budget,status,created_at"
      )
      .then(({ data }) => {
        setRows(data || []);
      });
  }, []);

  const group = (key: string) =>
    Object.entries(
      rows.reduce((acc, row) => {
        acc[row[key]] =
          (acc[row[key]] || 0) + 1;

        return acc;
      }, {} as Record<string, number>)
    );

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold">
        Analytics
      </h1>

      <p className="mt-2 text-zinc-500">
        Live summaries from booking data.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Chart
          title="Website types"
          data={group("website_type")}
        />

        <Chart
          title="Budget distribution"
          data={group("budget")}
        />

        <Chart
          title="Status distribution"
          data={group("status")}
        />
      </div>

      <div className="mt-4 surface rounded-xl p-6">
        <h2 className="font-medium">
          Requests over time
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          {rows.length
            ? `${rows.length} recorded requests. Use the created dates in the bookings table for exact history.`
            : "No booking data yet."}
        </p>
      </div>
    </AdminLayout>
  );
}

/* =========================
   CHART
========================= */

function Chart({
  title,
  data,
}: {
  title: string;
  data: [string, unknown][];
}) {
  return (
    <div className="surface rounded-xl p-6">
      <h2 className="font-medium">
        {title}
      </h2>

      {data.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-600">
          No data yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">
                  {key}
                </span>

                <span>
                  {String(value)}
                </span>
              </div>

              <div className="mt-2 h-1.5 rounded bg-white/5">
                <div
                  className="h-full rounded bg-violet-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Number(value) * 15
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   SETTINGS
========================= */

export function SettingsPage() {
  const [user, setUser] =
    useState<any>(null);

  useEffect(() => {
    supabase
      ?.auth.getUser()
      .then(({ data }) => {
        setUser(data.user);
      });
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold">
        Settings
      </h1>

      <div className="mt-7 max-w-xl space-y-4">
        <div className="surface rounded-xl p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Admin profile
          </p>

          <p className="mt-2">
            {user?.email ||
              "Authenticated admin"}
          </p>
        </div>

        <div className="surface rounded-xl p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Booking notification email
          </p>

          <p className="mt-2">
            goudaparth07@gmail.com
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Provider credentials stay
            server-side and are not exposed
            here.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}