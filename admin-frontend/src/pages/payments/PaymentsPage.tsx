import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { adminApi } from "@/lib/api";
import type { Payment, PurchaseStatus, RefundPaymentInput } from "@/types";

const columnHelper = createColumnHelper<Payment>();

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PurchaseStatus | "">("");
  const [search, setSearch] = useState("");
  const [refundModal, setRefundModal] = useState<{
    payment: Payment;
    reason: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: paymentsData } = useQuery({
    queryKey: ["payments", { page, status, search }],
    queryFn: () =>
      adminApi.getPayments({
        page,
        limit: 20,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["payment-stats"],
    queryFn: () => adminApi.getPaymentStats(),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundPaymentInput }) =>
      adminApi.refundPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      setRefundModal(null);
    },
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>
      ),
    }),
    columnHelper.accessor((row) => (row.buyer as { name: string }).name, {
      id: "buyer",
      header: "Buyer",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => (
        <span className="font-semibold">${(info.getValue() || 0).toFixed(2)}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colors = {
          COMPLETED: "bg-green-100 text-green-800",
          PENDING: "bg-yellow-100 text-yellow-800",
          FAILED: "bg-red-100 text-red-800",
          REFUNDED: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}
          >
            {status}
          </span>
        );
      },
    }),
    columnHelper.accessor("paymentMethod", {
      header: "Method",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const payment = info.row.original;
        return payment.status === "COMPLETED" ? (
          <button
            onClick={() => setRefundModal({ payment, reason: "" })}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Refund
          </button>
        ) : null;
      },
    }),
  ];

  const table = useReactTable({
    data: paymentsData?.data.payments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">
              ${(stats.totalRevenue || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold">{stats.totalPayments || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold">{stats.completedPayments || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Refunded</p>
            <p className="text-2xl font-bold text-red-600">
              ${(stats.totalRefunded || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <input
          type="text"
          placeholder="Search by buyer email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PurchaseStatus | "")}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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
        {paymentsData?.data && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing page {paymentsData.data.pagination.page} of{" "}
              {paymentsData.data.pagination.totalPages}
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
                disabled={page >= paymentsData.data.pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Refund Payment</h2>
            <p className="text-sm text-gray-600 mb-4">
              Refund ${(refundModal.payment.amount || 0).toFixed(2)} to{" "}
              {(refundModal.payment.buyer as { name: string }).name}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                value={refundModal.reason}
                onChange={(e) =>
                  setRefundModal((prev) =>
                    prev ? { ...prev, reason: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Enter reason for refund..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRefundModal(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  refundMutation.mutate({
                    id: refundModal.payment.id,
                    data: { reason: refundModal.reason },
                  })
                }
                disabled={
                  !refundModal.reason.trim() || refundMutation.isPending
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {refundMutation.isPending ? "Processing..." : "Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
