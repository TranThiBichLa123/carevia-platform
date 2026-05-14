"use client";

import { History, RefreshCcw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  backofficeApi,
  type AuditLogEntry,
} from "@/lib/backofficeApi";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";

type ActionFilter = "ALL" | "INSERT" | "UPDATE" | "DELETE" | "RESTORE";

const ACTION_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  INSERT: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  RESTORE: "outline",
};

export default function AdminAuditLogsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [tableName, setTableName] = useState("");

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backofficeApi.getAuditLogs({
        search: search.trim() || undefined,
        action: actionFilter === "ALL" ? undefined : actionFilter,
        tableName: tableName.trim() || undefined,
        page: 0,
        size: 100,
      });
      setLogs(response.items || []);
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải lịch sử thao tác."));
    } finally {
      setLoading(false);
    }
  }, [actionFilter, search, tableName]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadLogs();
  }, [isAuthenticated, loadLogs]);

  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản admin để xem audit logs.</div>;
  }

  if (authUser?.role !== "ADMIN") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang này.</div>;
  }

  const uniqueTables = Array.from(new Set(logs.map((log) => log.tableName))).sort();

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử thao tác</h1>
        <p className="text-sm text-muted-foreground">Theo dõi tài khoản nào đã thay đổi dữ liệu, trên bảng nào, tại thời điểm nào và payload thao tác tương ứng.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Tổng log trong bộ lọc</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><History className="size-6 text-sky-500" />{logs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Người thao tác khác nhau</CardDescription>
            <CardTitle className="text-3xl">{new Set(logs.map((log) => log.username).filter(Boolean)).size}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Bảng dữ liệu khác nhau</CardDescription>
            <CardTitle className="text-3xl">{uniqueTables.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Bộ lọc</CardTitle>
              <CardDescription>Lọc nhanh theo hành động, bảng dữ liệu hoặc từ khóa trong payload.</CardDescription>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo user, email, record id hoặc payload" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400" />
              </div>
              <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as ActionFilter)}>
                <SelectTrigger className="w-full bg-white lg:w-40"><SelectValue placeholder="Hành động" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả action</SelectItem>
                  <SelectItem value="INSERT">INSERT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="RESTORE">RESTORE</SelectItem>
                </SelectContent>
              </Select>
              <input value={tableName} onChange={(event) => setTableName(event.target.value)} placeholder="Tên bảng, ví dụ accounts" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 lg:w-52" />
              <Button variant="outline" onClick={() => void loadLogs()} disabled={loading}><RefreshCcw className="mr-2 size-4" />Làm mới</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Đang tải audit logs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người thao tác</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Bảng / Record</TableHead>
                  <TableHead>Payload</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="align-top">
                      <div className="font-medium">{log.username || "System"}</div>
                      <div className="text-xs text-muted-foreground">{log.email || "Không có email"}</div>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant={ACTION_BADGE_VARIANT[log.action] || "outline"}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="font-medium">{log.tableName}</div>
                      <div className="text-xs text-muted-foreground">record #{log.recordId}</div>
                    </TableCell>
                    <TableCell className="max-w-xl align-top">
                      <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{log.changedData || "Không có payload"}</pre>
                    </TableCell>
                    <TableCell className="align-top text-sm text-slate-500">{log.ipAddress || "N/A"}</TableCell>
                    <TableCell className="align-top text-sm text-slate-500">{formatDateTime(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}