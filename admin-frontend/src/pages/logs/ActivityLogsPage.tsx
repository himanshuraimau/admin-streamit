import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { adminApi } from "@/lib/api";
import type { AdminActivityLog, AdminAction } from "@/types";

const columnHelper = createColumnHelper<AdminActivityLog>();

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<AdminAction | "">("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  });

  const { data: logsData } = useQuery({
    queryKey: ["admin-logs", { page, action, search, dateRange }],
    queryFn: () =>
      adminApi.getAdminLogs({
        page,
        limit: 20,
        action: action || undefined,
        search: search || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["activity-stats", dateRange],
    queryFn: () =>
      adminApi.getActivityStats({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
    }),
    columnHelper.accessor((row) => row.admin?.name || "Unknown", {
      id: "admin",
      header: "Admin",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => {
        const action = info.getValue();
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
            {action.replace(/_/g, " ")}
          </span>
        );
      },
    }),
    columnHelper.accessor("targetType", {
      header: "Target",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="text-sm">
            <div className="font-medium">{info.getValue()}</div>
            {row.targetId && (
              <div className="text-gray-500 font-mono text-xs">{row.targetId.slice(0, 8)}</div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("details", {
      header: "Details",
      cell: (info) => {
        const details = info.getValue();
        if (!details || Object.keys(details).length === 0) return <span className="text-gray-400">-</span>;
        return (
          <div className="text-xs text-gray-600 max-w-xs">
            <pre className="truncate">{JSON.stringify(details, null, 2).slice(0, 100)}</pre>
          </div>
        );
      },
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP",
      cell: (info) => <span className="font-mono text-xs">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Timestamp",
      cell: (info) => (
        <div className="text-sm">
          <div>{new Date(info.getValue()).toLocaleDateString()}</div>
          <div className="text-gray-500 text-xs">
            {new Date(info.getValue()).toLocaleTimeString()}
          </div>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: logsData?.data.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Activity Logs</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Activities</p>
            <p className="text-2xl font-bold">{stats.totalActivities}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active Admins</p>
            <p className="text-2xl font-bold text-blue-600">{stats.uniqueAdmins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Most Active</p>
            <p className="text-sm font-semibold truncate">
              {stats.mostActiveAdmin || "N/A"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Most Common Action</p>
            <p className="text-sm font-semibold">
              {stats.mostCommonAction?.replace(/_/g, " ") || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by admin email or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as AdminAction | "")}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Actions</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="USER_UNSUSPENDED">User Unsuspended</option>
            <option value="CREATOR_APPROVED">Creator Approved</option>
            <option value="CREATOR_REJECTED">Creator Rejected</option>
            <option value="POST_HIDDEN">Post Hidden</option>
            <option value="POST_UNHIDDEN">Post Unhidden</option>
            <option value="POST_DELETED">Post Deleted</option>
            <option value="COMMENT_DELETED">Comment Deleted</option>
            <option value="STREAM_ENDED">Stream Ended</option>
            <option value="PAYMENT_REFUNDED">Payment Refunded</option>
            <option value="GIFT_CREATED">Gift Created</option>
            <option value="GIFT_UPDATED">Gift Updated</option>
            <option value="GIFT_DELETED">Gift Deleted</option>
            <option value="DISCOUNT_CREATED">Discount Created</option>
            <option value="DISCOUNT_UPDATED">Discount Updated</option>
            <option value="DISCOUNT_DELETED">Discount Deleted</option>
            <option value="REPORT_REVIEWED">Report Reviewed</option>
            <option value="REPORT_RESOLVED">Report Resolved</option>
            <option value="REPORT_DISMISSED">Report Dismissed</option>
          </select>
        </div>
        <div className="flex gap-4">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {logsData?.data && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing page {logsData.data.pagination.page} of{" "}
              {logsData.data.pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= logsData.data.pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
