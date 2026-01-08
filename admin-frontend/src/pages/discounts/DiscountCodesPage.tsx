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
  DiscountCode,
  DiscountType,
  CreateDiscountCodeInput,
  UpdateDiscountCodeInput,
} from "@/types";

const columnHelper = createColumnHelper<DiscountCode>();

export default function DiscountCodesPage() {
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState<{
    discount?: DiscountCode;
    code: string;
    type: DiscountType;
    value: number;
    maxUses: number | null;
    expiresAt: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: discountsData } = useQuery({
    queryKey: ["discounts", { page }],
    queryFn: () => adminApi.getDiscountCodes({ page, limit: 20 }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["discount-stats"],
    queryFn: () => adminApi.getDiscountStats(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDiscountCodeInput) => adminApi.createDiscountCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-stats"] });
      setEditModal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountCodeInput }) =>
      adminApi.updateDiscountCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-stats"] });
      setEditModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteDiscountCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-stats"] });
    },
  });

  const columns = [
    columnHelper.accessor("code", {
      header: "Code",
      cell: (info) => <span className="font-mono font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("value", {
      header: "Value",
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="font-semibold">
            {row.type === "PERCENTAGE" ? `${info.getValue()}%` : `$${info.getValue()}`}
          </span>
        );
      },
    }),
    columnHelper.accessor("usedCount", {
      header: "Used",
      cell: (info) => {
        const row = info.row.original;
        return (
          <span>
            {info.getValue()} {row.maxUses ? `/ ${row.maxUses}` : ""}
          </span>
        );
      },
    }),
    columnHelper.accessor("expiresAt", {
      header: "Expires",
      cell: (info) => {
        const expiresAt = info.getValue();
        if (!expiresAt) return <span className="text-gray-400">Never</span>;
        const date = new Date(expiresAt);
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? "text-red-600" : ""}>
            {date.toLocaleDateString()}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const discount = info.row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={() =>
                setEditModal({
                  discount,
                  code: discount.code,
                  type: discount.type,
                  value: discount.value,
                  maxUses: discount.maxUses,
                  expiresAt: discount.expiresAt
                    ? new Date(discount.expiresAt).toISOString().split("T")[0]
                    : "",
                })
              }
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete discount code "${discount.code}"?`)) {
                  deleteMutation.mutate(discount.id);
                }
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: discountsData?.data.discounts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const stats = statsData?.data;

  const handleSubmit = () => {
    if (!editModal) return;

    const data: CreateDiscountCodeInput = {
      code: editModal.code,
      type: editModal.type,
      value: editModal.value,
      maxUses: editModal.maxUses,
      expiresAt: editModal.expiresAt ? new Date(editModal.expiresAt).toISOString() : null,
    };

    if (editModal.discount) {
      updateMutation.mutate({ id: editModal.discount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discount Codes</h1>
        <button
          onClick={() =>
            setEditModal({
              code: "",
              type: "PERCENTAGE",
              value: 0,
              maxUses: null,
              expiresAt: "",
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Create Discount Code
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Codes</p>
            <p className="text-2xl font-bold">{stats.totalCodes}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active Codes</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeCodes}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Uses</p>
            <p className="text-2xl font-bold">{stats.totalUses}</p>
          </div>
        </div>
      )}

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
        {discountsData?.data && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing page {discountsData.data.pagination.page} of{" "}
              {discountsData.data.pagination.totalPages}
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
                disabled={page >= discountsData.data.pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editModal.discount ? "Edit Discount Code" : "Create Discount Code"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code</label>
                <input
                  type="text"
                  value={editModal.code}
                  onChange={(e) =>
                    setEditModal((prev) =>
                      prev ? { ...prev, code: e.target.value.toUpperCase() } : null
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  placeholder="SAVE20"
                  disabled={!!editModal.discount}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={editModal.type}
                  onChange={(e) =>
                    setEditModal((prev) =>
                      prev ? { ...prev, type: e.target.value as DiscountType } : null
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Value {editModal.type === "PERCENTAGE" ? "(%)" : "($)"}
                </label>
                <input
                  type="number"
                  value={editModal.value}
                  onChange={(e) =>
                    setEditModal((prev) =>
                      prev ? { ...prev, value: parseFloat(e.target.value) || 0 } : null
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  step={editModal.type === "PERCENTAGE" ? "1" : "0.01"}
                  min="0"
                  max={editModal.type === "PERCENTAGE" ? "100" : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Uses (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={editModal.maxUses ?? ""}
                  onChange={(e) =>
                    setEditModal((prev) =>
                      prev
                        ? { ...prev, maxUses: e.target.value ? parseInt(e.target.value) : null }
                        : null
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expires At (leave empty for no expiration)
                </label>
                <input
                  type="date"
                  value={editModal.expiresAt}
                  onChange={(e) =>
                    setEditModal((prev) => (prev ? { ...prev, expiresAt: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !editModal.code.trim() ||
                  editModal.value <= 0 ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editModal.discount
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
