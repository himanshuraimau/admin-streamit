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
import { Eye, Trash2, Loader2 } from "lucide-react";
import { useContentReports } from "@/hooks/use-data";

export default function ContentReportsPage() {
    const { data: reports, isLoading } = useContentReports();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Content Reports</h2>
                <p className="text-muted-foreground">
                    Moderation queue for reported content.
                </p>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports?.map((report: any) => (
                            <TableRow key={report.id}>
                                <TableCell>
                                    <Badge variant="outline">{report.type}</Badge>
                                </TableCell>
                                <TableCell>{report.reason}</TableCell>
                                <TableCell>{report.reporter}</TableCell>
                                <TableCell>
                                    <Badge variant={report.status === 'PENDING' ? 'destructive' : 'secondary'}>
                                        {report.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{report.createdAt}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
