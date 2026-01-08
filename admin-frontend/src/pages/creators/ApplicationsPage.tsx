import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";
import type { CreatorApplication } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function CreatorApplicationsPage() {
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");

  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = filter === "ALL" ? {} : { status: filter };
      const response = await adminApi.getCreatorApplications(params);
      setApplications(response.data.data);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveCreatorApplication(id, { note: "Approved by admin" });
      alert("Application approved successfully");
      loadApplications();
    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("Failed to approve application");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    try {
      await adminApi.rejectCreatorApplication(id, { reason });
      alert("Application rejected successfully");
      loadApplications();
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Failed to reject application");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Applications</h1>
          <p className="text-gray-600">Review and manage creator applications</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              filter === status
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Applied
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {app.user.name?.charAt(0) || "U"}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{app.user.name}</div>
                        <div className="text-sm text-gray-500">{app.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        app.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : app.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(app.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {app.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
