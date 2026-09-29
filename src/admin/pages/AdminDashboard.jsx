import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import DashboardCards from "../components/DashboardCards";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FiRefreshCw, FiArrowRight } from "react-icons/fi";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const AdminDashboard = ({ setActivePage }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/orders/admin/stats");
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Fetch Stats Error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time statistics & business analytics
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Top Stat Metric Cards */}
      <div className="w-full">
        <DashboardCards stats={stats} loading={loading} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full min-w-0">
        {/* Monthly Revenue Trend (Area Chart) */}
        <div className="xl:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm flex flex-col justify-between min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Revenue Analytics</h2>
              <p className="text-xs text-slate-400">Monthly revenue trend overview</p>
            </div>
          </div>

          <div className="h-[280px] sm:h-[320px] w-full min-w-0">
            {stats?.monthlyData && stats.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [formatCurrency(val), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No revenue trend data yet
              </div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown (Donut Chart) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">Orders by Status</h2>
            <p className="text-xs text-slate-400">Current fulfillment distribution</p>
          </div>

          <div className="h-[280px] sm:h-[320px] w-full min-w-0">
            {stats?.statusData && stats.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No orders data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm w-full min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">Recent Orders</h2>
            <p className="text-xs text-slate-400">Latest transactions across the platform</p>
          </div>
          {setActivePage && (
            <button
              onClick={() => setActivePage("orders")}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 transition cursor-pointer"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Responsive Table Wrapper */}
        <div className="w-full overflow-x-auto rounded-xl border border-slate-800/60">
          <table className="w-full min-w-[700px] text-left text-xs sm:text-sm text-slate-300">
            <thead className="uppercase bg-slate-800/60 text-slate-400 border-b border-slate-800 text-[11px] sm:text-xs">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Order ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Customer</th>
                <th className="py-3 px-4 whitespace-nowrap">Items</th>
                <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 whitespace-nowrap">Payment</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-blue-400 whitespace-nowrap">
                      #{ord._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-white font-medium">
                        {ord.shippingAddress?.fullName || ord.user?.username || "Guest"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ord.shippingAddress?.phone || ord.user?.email || ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 text-white font-semibold whitespace-nowrap">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          ord.paymentStatus === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : ord.paymentStatus === "FAILED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {ord.paymentMethod === "COD" ? "COD" : ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                        {ord.orderStatus.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-500 text-sm">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;