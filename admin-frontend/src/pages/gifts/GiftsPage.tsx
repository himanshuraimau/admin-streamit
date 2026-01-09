import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { adminApi } from "@/lib/api";
import type { Gift, GiftTransaction, CreateGiftInput, UpdateGiftInput } from "@/types";

const giftColumnHelper = createColumnHelper<Gift>();
const transactionColumnHelper = createColumnHelper<GiftTransaction>();

export default function GiftsPage() {
  const [activeTab, setActiveTab] = useState<"gifts" | "transactions">("gifts");
  const [page] = useState(1);
  const [editModal, setEditModal] = useState<{
    gift?: Gift;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: giftsData } = useQuery({
    queryKey: ["gifts", { page }],
    queryFn: () => adminApi.getGifts({ page, limit: 20 }),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ["gift-transactions", { page }],
    queryFn: () => adminApi.getGiftTransactions({ page, limit: 20 }),
    enabled: activeTab === "transactions",
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateGiftInput) => adminApi.createGift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifts"] });
      setEditModal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGiftInput }) =>
      adminApi.updateGift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifts"] });
      setEditModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteGift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifts"] });
    },
  });

  const giftColumns = [
    giftColumnHelper.accessor("imageUrl", {
      header: "Image",
      cell: (info) => (
        <img src={info.getValue()} alt="Gift" className="w-12 h-12 object-cover rounded" />
      ),
    }),
    giftColumnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    giftColumnHelper.accessor("coinPrice", {
      header: "Price",
      cell: (info) => <span className="font-semibold">${info.getValue().toFixed(2)}</span>,
    }),
    giftColumnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    giftColumnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const gift = info.row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={() =>
                setEditModal({
                  gift,
                  name: gift.name,
                  price: gift?.coinPrice,
                  imageUrl: gift.imageUrl,
                  description: gift.createdAt,
                })
              }
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete gift "${gift.name}"?`)) {
                  deleteMutation.mutate(gift.id);
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

  const transactionColumns = [
    transactionColumnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
    }),
    transactionColumnHelper.accessor((row) => row.gift?.name ?? "N/A", {
      id: "gift",
      header: "Gift",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    transactionColumnHelper.accessor((row) => row.sender?.name, {
      id: "sender",
      header: "Sender",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    transactionColumnHelper.accessor((row) => row.receiver?.name, {
      id: "receiver",
      header: "Receiver",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    transactionColumnHelper.accessor("coinAmount", {
      header: "Amount",
      cell: (info) => <span className="font-semibold">${info.getValue().toFixed(2)}</span>,
    }),
    transactionColumnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
  ];

  const giftsTable = useReactTable({
    data: giftsData?.data.data || [],
    columns: giftColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const transactionsTable = useReactTable({
    data: transactionsData?.data.data || [],
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSubmit = () => {
    if (!editModal) return;

    const data = {
      name: editModal.name,
      coinPrice: editModal.price,
      imageUrl: editModal.imageUrl,
      description: editModal.description,
    };

    if (editModal.gift) {
      updateMutation.mutate({ id: editModal.gift.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Virtual Gifts</h1>
        <button
          onClick={() =>
            setEditModal({ name: "", price: 0, imageUrl: "", description: "" })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Create Gift
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("gifts")}
              className={`px-6 py-3 font-medium ${activeTab === "gifts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
                }`}
            >
              Gifts
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-6 py-3 font-medium ${activeTab === "transactions"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
                }`}
            >
              Transactions
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "gifts" ? (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  {giftsTable.getHeaderGroups().map((headerGroup) => (
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
                  {giftsTable.getRowModel().rows.map((row) => (
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
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  {transactionsTable.getHeaderGroups().map((headerGroup) => (
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
                  {transactionsTable.getRowModel().rows.map((row) => (
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
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editModal.gift ? "Edit Gift" : "Create Gift"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) =>
                    setEditModal((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  value={editModal.price}
                  onChange={(e) =>
                    setEditModal((prev) =>
                      prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="text"
                  value={editModal.imageUrl}
                  onChange={(e) =>
                    setEditModal((prev) => (prev ? { ...prev, imageUrl: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editModal.description}
                  onChange={(e) =>
                    setEditModal((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
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
                  !editModal.name.trim() ||
                  !editModal.imageUrl.trim() ||
                  editModal.price <= 0 ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editModal.gift
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
