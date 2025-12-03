import { useState, useEffect } from "react";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, UserPlus, Shield, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Admin {
    id: string;
    name: string;
    email: string;
    lastLoginAt: string | null;
    createdAt: string;
}

export default function SettingsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchAdmins = async () => {
        try {
            const response = await authService.getAdmins();
            if (response.success) {
                setAdmins(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError("");
        setSuccess("");

        try {
            const response = await authService.createAdmin(newAdmin);
            if (response.success) {
                setSuccess("Admin created successfully");
                setNewAdmin({ name: "", email: "", password: "" });
                fetchAdmins();
            } else {
                setError(response.error || "Failed to create admin");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "An unexpected error occurred");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
        if (!confirm(`Are you sure you want to delete admin "${adminEmail}"? This action cannot be undone.`)) {
            return;
        }

        setDeleting(adminId);
        setError("");
        setSuccess("");

        try {
            const response = await authService.deleteAdmin(adminId);
            if (response.success) {
                setSuccess("Admin deleted successfully");
                fetchAdmins();
            } else {
                setError(response.error || "Failed to delete admin");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "An unexpected error occurred");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage system settings and administrators.</p>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Admin Accounts
                        </CardTitle>
                        <CardDescription>
                            List of all administrators with access to this panel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {admins.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell className="font-medium">{admin.name}</TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell>
                                                {admin.lastLoginAt
                                                    ? format(new Date(admin.lastLoginAt), "MMM d, yyyy HH:mm")
                                                    : "Never"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                                                    disabled={deleting === admin.id || admins.length <= 1}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    {deleting === admin.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {admins.length <= 1 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: Cannot delete the last admin account
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add New Admin
                        </CardTitle>
                        <CardDescription>
                            Create a new administrator account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Admin
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
