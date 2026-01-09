import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

import { AreaChartComponent } from "@/components/charts/AreaChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { BarChartComponent } from "@/components/charts/BarChartComponent";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  });

  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ["platform-overview"],
    queryFn: () => adminApi.getPlatformOverview(),
  });

  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ["revenue-analytics", dateRange],
    queryFn: () =>
      adminApi.getRevenueAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["user-analytics", dateRange],
    queryFn: () =>
      adminApi.getUserAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: contentData, isLoading: contentLoading, error: contentError } = useQuery({
    queryKey: ["content-analytics", dateRange],
    queryFn: () =>
      adminApi.getContentAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: giftData, isLoading: giftLoading, error: giftError } = useQuery({
    queryKey: ["gift-analytics", dateRange],
    queryFn: () =>
      adminApi.getGiftAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const overview = overviewData?.data?.data;
  const revenue = revenueData?.data?.data;
  const users = userData?.data?.data;
  const content = contentData?.data?.data;
  const gifts = giftData?.data?.data;

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
      {overviewLoading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-gray-400">Loading platform overview...</div>
        </div>
      ) : overviewError ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-red-400">Error loading platform overview</div>
        </div>
      ) : overview && (
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
                ${(overview.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Analytics */}
      {revenueLoading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-gray-400">Loading revenue analytics...</div>
        </div>
      ) : revenueError ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-red-400">Error loading revenue analytics</div>
        </div>
      ) : revenue && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Revenue Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold">${(revenue.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-xl font-bold">{revenue.totalPayments}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-xl font-bold">${(revenue.averageTransaction || 0).toFixed(2)}</p>
            </div>
          </div>
          {revenueLoading ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Loading revenue data...
            </div>
          ) : revenueError ? (
            <div className="h-[300px] flex items-center justify-center text-red-400">
              Error loading revenue data
            </div>
          ) : revenue?.dailyRevenue && revenue.dailyRevenue.length > 0 ? (
            <AreaChartComponent
              data={revenue.dailyRevenue}
              dataKey="revenue"
              xAxisKey="date"
              fill="#3b82f6"
              stroke="#2563eb"
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No revenue data available
            </div>
          )}
        </div>
      )}

      {/* User Analytics */}
      {userLoading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-gray-400">Loading user analytics...</div>
        </div>
      ) : userError ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-red-400">Error loading user analytics</div>
        </div>
      ) : users && (
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
              {userLoading ? (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              ) : userError ? (
                <div className="h-[250px] flex items-center justify-center text-red-400">
                  Error loading data
                </div>
              ) : users?.dailySignups && users.dailySignups.length > 0 ? (
                <BarChartComponent
                  data={users.dailySignups.map((item: any) => ({
                    date: item.date,
                    signups: item.signups || item.count || 0
                  }))}
                  bars={[{ dataKey: "signups", fill: "#3b82f6", name: "New Signups" }]}
                  xAxisKey="date"
                  height={250}
                />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Users by Role</h3>
              {userLoading ? (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              ) : userError ? (
                <div className="h-[250px] flex items-center justify-center text-red-400">
                  Error loading data
                </div>
              ) : users?.usersByRole && users.usersByRole.length > 0 ? (
                <PieChartComponent
                  data={users.usersByRole.map((item: any) => ({
                    name: item.role,
                    value: item.count
                  }))}
                  height={250}
                />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Analytics */}
      {contentLoading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-gray-400">Loading content analytics...</div>
        </div>
      ) : contentError ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-red-400">Error loading content analytics</div>
        </div>
      ) : content && (
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
              {contentLoading ? (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              ) : contentError ? (
                <div className="h-[250px] flex items-center justify-center text-red-400">
                  Error loading data
                </div>
              ) : content?.dailyPosts && content.dailyPosts.length > 0 ? (
                <BarChartComponent
                  data={content.dailyPosts.map((item: any) => ({
                    date: item.date,
                    posts: item.posts || item.count || 0
                  }))}
                  bars={[{ dataKey: "posts", fill: "#10b981", name: "Posts" }]}
                  xAxisKey="date"
                  height={250}
                />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Posts by Type</h3>
              {contentLoading ? (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              ) : contentError ? (
                <div className="h-[250px] flex items-center justify-center text-red-400">
                  Error loading data
                </div>
              ) : content?.postsByType && content.postsByType.length > 0 ? (
                <PieChartComponent
                  data={content.postsByType.map((item: any) => ({
                    name: item.type,
                    value: item.count
                  }))}
                  height={250}
                />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gift Analytics */}
      {giftLoading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-gray-400">Loading gift analytics...</div>
        </div>
      ) : giftError ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-red-400">Error loading gift analytics</div>
        </div>
      ) : gifts && (
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
                ${(gifts.totalGiftRevenue || 0).toFixed(2)}
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
              {gifts.topGifts.map((gift: { giftId: string; giftName: string; count: number; totalRevenue: number }) => (
                <div
                  key={gift.giftId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{gift.giftName}</p>
                    <p className="text-sm text-gray-600">Sent {gift.count} times</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ${(gift.totalRevenue || 0).toFixed(2)}
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
