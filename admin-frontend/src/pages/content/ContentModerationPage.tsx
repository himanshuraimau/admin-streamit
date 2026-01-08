import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { adminApi } from "@/lib/api";
import type {
  Post,
  Comment,
  Stream,
  ToggleVisibilityInput,
  DeleteContentInput,
} from "@/types";

const postColumnHelper = createColumnHelper<Post>();
const commentColumnHelper = createColumnHelper<Comment>();
const streamColumnHelper = createColumnHelper<Stream>();

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "streams">("posts");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState<{
    type: "hide" | "delete" | "end";
    id: string;
    reason: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: postsData } = useQuery({
    queryKey: ["posts", { page, search }],
    queryFn: () =>
      adminApi.getPosts({
        page,
        limit: 20,
        search: search || undefined,
      }),
    enabled: activeTab === "posts",
  });

  const { data: commentsData } = useQuery({
    queryKey: ["comments", { page, search }],
    queryFn: () =>
      adminApi.getComments({
        page,
        limit: 20,
        search: search || undefined,
      }),
    enabled: activeTab === "comments",
  });

  const { data: streamsData } = useQuery({
    queryKey: ["streams", { page, search }],
    queryFn: () =>
      adminApi.getStreams({
        page,
        limit: 20,
        search: search || undefined,
      }),
    enabled: activeTab === "streams",
  });

  const togglePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleVisibilityInput }) =>
      adminApi.togglePostVisibility(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setActionModal(null);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeleteContentInput }) =>
      adminApi.deletePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setActionModal(null);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeleteContentInput }) =>
      adminApi.deleteComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setActionModal(null);
    },
  });

  const endStreamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeleteContentInput }) =>
      adminApi.endStream(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      setActionModal(null);
    },
  });

  const postColumns = [
    postColumnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
    }),
    postColumnHelper.accessor((row) => row.author?.name ?? "Unknown", {
      id: "author",
      header: "Author",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    postColumnHelper.accessor("type", {
      header: "Type",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    postColumnHelper.accessor("content", {
      header: "Content",
      cell: (info) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {info.getValue()}
        </span>
      ),
    }),
    postColumnHelper.accessor("isHidden", {
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            info.getValue()
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {info.getValue() ? "Hidden" : "Visible"}
        </span>
      ),
    }),
    postColumnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    postColumnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const post = info.row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={() =>
                setActionModal({
                  type: "hide",
                  id: post.id,
                  reason: "",
                })
              }
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              {post.isHidden ? "Unhide" : "Hide"}
            </button>
            <button
              onClick={() =>
                setActionModal({
                  type: "delete",
                  id: post.id,
                  reason: "",
                })
              }
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        );
      },
    }),
  ];

  const commentColumns = [
    commentColumnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
    }),
    commentColumnHelper.accessor((row) => row.author?.name ?? "Unknown", {
      id: "author",
      header: "Author",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    commentColumnHelper.accessor("content", {
      header: "Comment",
      cell: (info) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {info.getValue()}
        </span>
      ),
    }),
    commentColumnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    commentColumnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const comment = info.row.original;
        return (
          <button
            onClick={() =>
              setActionModal({
                type: "delete",
                id: comment.id,
                reason: "",
              })
            }
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        );
      },
    }),
  ];

  const streamColumns = [
    streamColumnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
    }),
    streamColumnHelper.accessor((row) => row.streamer?.name ?? "Unknown", {
      id: "streamer",
      header: "Streamer",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    streamColumnHelper.accessor("title", {
      header: "Title",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    streamColumnHelper.accessor("isLive", {
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            info.getValue()
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {info.getValue() ? "Live" : "Ended"}
        </span>
      ),
    }),
    streamColumnHelper.accessor("createdAt", {
      header: "Started",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    streamColumnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const stream = info.row.original;
        return stream.isLive ? (
          <button
            onClick={() =>
              setActionModal({
                type: "end",
                id: stream.id,
                reason: "",
              })
            }
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            End Stream
          </button>
        ) : null;
      },
    }),
  ];

  const postsTable = useReactTable({
    data: postsData?.data.posts || [],
    columns: postColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const commentsTable = useReactTable({
    data: commentsData?.data.comments || [],
    columns: commentColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const streamsTable = useReactTable({
    data: streamsData?.data.streams || [],
    columns: streamColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAction = () => {
    if (!actionModal) return;

    const data = { reason: actionModal.reason };

    if (actionModal.type === "hide") {
      togglePostMutation.mutate({ id: actionModal.id, data });
    } else if (actionModal.type === "delete") {
      if (activeTab === "posts") {
        deletePostMutation.mutate({ id: actionModal.id, data });
      } else if (activeTab === "comments") {
        deleteCommentMutation.mutate({ id: actionModal.id, data });
      }
    } else if (actionModal.type === "end") {
      endStreamMutation.mutate({ id: actionModal.id, data });
    }
  };

  const isPending =
    togglePostMutation.isPending ||
    deletePostMutation.isPending ||
    deleteCommentMutation.isPending ||
    endStreamMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Moderation</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab("posts");
                setPage(1);
              }}
              className={`px-6 py-3 font-medium ${
                activeTab === "posts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => {
                setActiveTab("comments");
                setPage(1);
              }}
              className={`px-6 py-3 font-medium ${
                activeTab === "comments"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => {
                setActiveTab("streams");
                setPage(1);
              }}
              className={`px-6 py-3 font-medium ${
                activeTab === "streams"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Streams
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b flex gap-4">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "posts" && (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  {postsTable.getHeaderGroups().map((headerGroup) => (
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
                  {postsTable.getRowModel().rows.map((row) => (
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
            </div>
          )}

          {activeTab === "comments" && (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  {commentsTable.getHeaderGroups().map((headerGroup) => (
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
                  {commentsTable.getRowModel().rows.map((row) => (
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
            </div>
          )}

          {activeTab === "streams" && (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  {streamsTable.getHeaderGroups().map((headerGroup) => (
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
                  {streamsTable.getRowModel().rows.map((row) => (
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
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {actionModal.type === "hide"
                ? "Toggle Visibility"
                : actionModal.type === "delete"
                ? "Delete Content"
                : "End Stream"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This action will be logged in the admin activity log.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                value={actionModal.reason}
                onChange={(e) =>
                  setActionModal((prev) => (prev ? { ...prev, reason: e.target.value } : null))
                }
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Enter reason for this action..."
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
                disabled={!actionModal.reason.trim() || isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {isPending ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
