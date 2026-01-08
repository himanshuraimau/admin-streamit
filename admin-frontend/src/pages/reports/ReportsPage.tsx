import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import adminApi from "@/lib/api";
import type {
  Report,
  ReportStatus,
  ReportReason,
  ResolveReportInput,
  DismissReportInput,
} from "@/types";

const columnHelper = createColumnHelper<Report>();

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReportStatus | "">("");
  const [reason, setReason] = useState<ReportReason | "">("");
  const [actionModal, setActionModal] = useState<{
    type: "resolve" | "dismiss";
    report: Report;
    note: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: reportsData } = useQuery({
    queryKey: ["reports", { page, status, reason }],
    queryFn: () =>
      adminApi.getReports({
        page,
        limit: 20,
        status: status || undefined,
        reason: reason || undefined,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["report-stats"],
    queryFn: () => adminApi.getReportStats(),
  });

  const reviewMutation = useMutation({
    mutationFn: (id: string) => adminApi.reviewReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveReportInput }) =>
      adminApi.resolveReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
      setActionModal(null);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DismissReportInput }) =>
      adminApi.dismissReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
      setActionModal(null);
    },
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
    }),
    columnHelper.accessor((row) => row.reporter.name, {
      id: "reporter",
      header: "Reporter",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.reported.name, {
      id: "reported",
      header: "Reported User",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor("reason", {
      header: "Reason",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colors = {
          PENDING: "bg-yellow-100 text-yellow-800",
          UNDER_REVIEW: "bg-blue-100 text-blue-800",
          RESOLVED: "bg-green-100 text-green-800",
          DISMISSED: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
            {status.replace("_", " ")}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Reported",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const report = info.row.original;
        return (
          <div className="flex gap-2">
            {report.status === "PENDING" && (
              <button
                onClick={() => reviewMutation.mutate(report.id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                disabled={reviewMutation.isPending}
              >
                Review
              </button>
            )}
            {(report.status === "PENDING" || report.status === "UNDER_REVIEW") && (
              <>
                <button
                  onClick={() =>
                    setActionModal({
                      type: "resolve",
                      report,
                      note: "",
                    })
                  }
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Resolve
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      type: "dismiss",
                      report,
                      note: "",
                    })
                  }
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: reportsData?.data.reports || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const stats = statsData?.data;

  const handleAction = () => {
    if (!actionModal) return;

    const data = { note: actionModal.note };

    if (actionModal.type === "resolve") {
      resolveMutation.mutate({ id: actionModal.report.id, data });
    } else {
      dismissMutation.mutate({ id: actionModal.report.id, data });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports Management</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Reports</p>
            <p className="text-2xl font-bold">{stats.totalReports}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Under Review</p>
            <p className="text-2xl font-bold text-blue-600">{stats.underReviewReports}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolvedReports}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReportStatus | "")}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as ReportReason | "")}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Reasons</option>
          <option value="SPAM">Spam</option>
          <option value="HARASSMENT">Harassment</option>
          <option value="HATE_SPEECH">Hate Speech</option>
          <option value="NUDITY">Nudity</option>
          <option value="VIOLENCE">Violence</option>
          <option value="FALSE_INFORMATION">False Information</option>
          <option value="OTHER">Other</option>
        </select>
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
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {reportsData?.data && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing page {reportsData.data.pagination.page} of{" "}
              {reportsData.data.pagination.totalPages}
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
                disabled={page >= reportsData.data.pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {actionModal.type === "resolve" ? "Resolve Report" : "Dismiss Report"}
            </h2>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>Reporter:</strong> {actionModal.report.reporter.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Reported:</strong> {actionModal.report.reported.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Reason:</strong> {actionModal.report.reason}
              </p>
              <p className="text-sm text-gray-600 mt-2">{actionModal.report.description}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Admin Note</label>
              <textarea
                value={actionModal.note}
                onChange={(e) =>
                  setActionModal((prev) => (prev ? { ...prev, note: e.target.value } : null))
                }
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Enter resolution/dismissal note..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={
                  !actionModal.note.trim() ||
                  resolveMutation.isPending ||
                  dismissMutation.isPending
                }
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  actionModal.type === "resolve" ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                {resolveMutation.isPending || dismissMutation.isPending
                  ? "Processing..."
                  : actionModal.type === "resolve"
                  ? "Resolve"
                  : "Dismiss"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
