import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";

interface Application {
    id: string;
    user: {
        name: string;
        email: string;
        image?: string;
    };
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    category: string;
}

interface ApplicationsTableProps {
    applications: Application[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Creator</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map((app) => (
                        <TableRow key={app.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                        {app.user.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{app.user.name}</span>
                                        <span className="text-xs text-muted-foreground">{app.user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{app.category}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        app.status === 'APPROVED' ? 'success' :
                                            app.status === 'REJECTED' ? 'destructive' :
                                                'warning'
                                    }
                                >
                                    {app.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{app.submittedAt}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" title="View Details">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600 hover:bg-green-500/10" title="Approve">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Reject">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
