import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Users, UserCheck, Radio, DollarSign, AlertTriangle, UserX } from "lucide-react";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminApi.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center">Failed to load dashboard</div>;
  }

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Total Creators",
      value: stats.totalCreators.toLocaleString(),
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      name: "Active Streams",
      value: stats.activeStreams.toLocaleString(),
      icon: Radio,
      color: "bg-purple-500",
    },
    {
      name: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      name: "Pending Applications",
      value: stats.pendingApplications.toLocaleString(),
      icon: AlertTriangle,
      color: "bg-yellow-500",
    },
    {
      name: "Suspended Users",
      value: stats.suspendedUsers.toLocaleString(),
      icon: UserX,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to the StreamIt Admin Panel</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-full ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-gray-500">
        Last updated: {new Date(stats.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
