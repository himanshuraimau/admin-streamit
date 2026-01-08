import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await adminApi.getUserById(id!);
      setUser(response.data.data);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      alert("Please provide a reason");
      return;
    }

    try {
      setIsSuspending(true);
      await adminApi.suspendUser(id!, {
        reason: suspendReason,
        duration: "PERMANENT",
      });
      alert("User suspended successfully");
      loadUser();
      setSuspendReason("");
    } catch (error) {
      console.error("Failed to suspend user:", error);
      alert("Failed to suspend user");
    } finally {
      setIsSuspending(false);
    }
  };

  const handleUnsuspend = async () => {
    try {
      await adminApi.unsuspendUser(id!, { note: "Unsuspended by admin" });
      alert("User unsuspended successfully");
      loadUser();
    } catch (error) {
      console.error("Failed to unsuspend user:", error);
      alert("Failed to unsuspend user");
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-2xl font-bold mb-4">User Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">@{user.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {user.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Joined</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDateTime(user.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Stats */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count?.posts || 0}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count?.followers || 0}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count?.following || 0}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count?.comments || 0}</div>
                <div className="text-sm text-gray-500">Comments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            
            {user.isSuspended ? (
              <div className="space-y-4">
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">Suspended</p>
                  <p className="mt-1 text-sm text-red-700">
                    {user.suspendedReason}
                  </p>
                  <p className="mt-2 text-xs text-red-600">
                    Suspended on {formatDateTime(user.suspendedAt)}
                  </p>
                </div>
                <button
                  onClick={handleUnsuspend}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Unsuspend User
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  placeholder="Reason for suspension..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  rows={4}
                />
                <button
                  onClick={handleSuspend}
                  disabled={isSuspending || !suspendReason.trim()}
                  className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isSuspending ? "Suspending..." : "Suspend User"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
