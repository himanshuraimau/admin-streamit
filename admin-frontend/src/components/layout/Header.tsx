import { Bell, LogOut } from "lucide-react";

export function Header() {
  const handleLogout = () => {
    // TODO: Implement logout with Better Auth
    window.location.href = "/login";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="rounded-md p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
