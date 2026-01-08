import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import adminApi from "@/lib/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  });

  const { data: overviewData } = useQuery({
    queryKey: ["platform-overview"],
    queryFn: () => adminApi.getPlatformOverview(),
  });

  const { data: revenueData } = useQuery({
    queryKey: ["revenue-analytics", dateRange],
    queryFn: () =>
      adminApi.getRevenueAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: userData } = useQuery({
    queryKey: ["user-analytics", dateRange],
    queryFn: () =>
      adminApi.getUserAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: contentData } = useQuery({
    queryKey: ["content-analytics", dateRange],
    queryFn: () =>
      adminApi.getContentAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: giftData } = useQuery({
    queryKey: ["gift-analytics", dateRange],
    queryFn: () =>
      adminApi.getGiftAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const overview = overviewData?.data;
  const revenue = revenueData?.data;
  const users = userData?.data;
  const content = contentData?.data;
  const gifts = giftData?.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Platform Overview */}
      {overview && (
        <div>
          <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{overview.totalUsers}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Active Creators</p>
              <p className="text-2xl font-bold text-blue-600">{overview.activeCreators}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold">{overview.totalPosts}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${overview.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Analytics */}
      {revenue && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Revenue Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold">${revenue.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-xl font-bold">{revenue.totalPayments}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-xl font-bold">${revenue.averageTransaction.toFixed(2)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* User Analytics */}
      {users && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">User Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-bold">{users.totalUsers}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">New Users</p>
              <p className="text-xl font-bold text-green-600">{users.newUsers}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-xl font-bold text-blue-600">{users.activeUsers}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Daily New Users</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={users.dailySignups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Users by Role</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={users.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {users.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Content Analytics */}
      {content && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Content Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-xl font-bold">{content.totalPosts}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Comments</p>
              <p className="text-xl font-bold">{content.totalComments}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Streams</p>
              <p className="text-xl font-bold">{content.totalStreams}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Live Streams</p>
              <p className="text-xl font-bold text-red-600">{content.liveStreams}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Daily Posts</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={content.dailyPosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Posts by Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={content.postsByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {content.postsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Gift Analytics */}
      {gifts && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Gift Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Gifts Sent</p>
              <p className="text-xl font-bold">{gifts.totalGiftsSent}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Gift Revenue</p>
              <p className="text-xl font-bold text-green-600">
                ${gifts.totalGiftRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Unique Senders</p>
              <p className="text-xl font-bold text-blue-600">{gifts.uniqueSenders}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Top Gifts</h3>
            <div className="space-y-2">
              {gifts.topGifts.map((gift) => (
                <div
                  key={gift.giftId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{gift.giftName}</p>
                    <p className="text-sm text-gray-600">Sent {gift.count} times</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ${gift.totalRevenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
