import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Loader2, UserCheck, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ApprovalStatus } from "../backend";
import type { UserApprovalInfo } from "../backend.d.ts";
import { useListApprovals, useSetApproval } from "../hooks/usePublicQueries";

function statusBadge(status: string) {
  if (status === ApprovalStatus.approved)
    return (
      <Badge
        variant="outline"
        className="text-xs bg-success/10 text-success border-success/30"
      >
        Disetujui
      </Badge>
    );
  if (status === ApprovalStatus.rejected)
    return (
      <Badge
        variant="outline"
        className="text-xs bg-destructive/10 text-destructive border-destructive/30"
      >
        Ditolak
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-xs bg-warning/10 text-warning border-warning/30"
    >
      Menunggu
    </Badge>
  );
}

export default function ApprovalPage() {
  const { data: approvals, isLoading } = useListApprovals();
  const setApproval = useSetApproval();

  async function handleApprove(principal: UserApprovalInfo["principal"]) {
    try {
      await setApproval.mutateAsync({
        principal,
        status: ApprovalStatus.approved,
      });
      toast.success("Akun berhasil disetujui.");
    } catch {
      toast.error("Gagal menyetujui akun.");
    }
  }

  async function handleReject(principal: UserApprovalInfo["principal"]) {
    try {
      await setApproval.mutateAsync({
        principal,
        status: ApprovalStatus.rejected,
      });
      toast.success("Akun ditolak.");
    } catch {
      toast.error("Gagal menolak akun.");
    }
  }

  return (
    <div data-ocid="approval.page">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Kelola Permohonan Akun
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Setujui atau tolak permohonan pendaftaran akun pengguna baru.
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-primary" />
        </div>
      </div>

      <Card className="border border-border shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Daftar Permohonan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="approval.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !approvals || approvals.length === 0 ? (
            <div className="p-12 text-center" data-ocid="approval.empty_state">
              <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                Belum ada permohonan
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Permohonan pendaftaran akun akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="approval.table">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-6">#</TableHead>
                    <TableHead>Principal ID</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((item, index) => {
                    const principalStr = item.principal.toString();
                    const shortP = `${principalStr.slice(0, 12)}...${principalStr.slice(-8)}`;
                    const isPending = item.status === ApprovalStatus.pending;
                    return (
                      <TableRow
                        key={principalStr}
                        data-ocid={`approval.item.${index + 1}`}
                      >
                        <TableCell className="pl-6 text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <span
                            className="font-mono text-xs"
                            title={principalStr}
                          >
                            {shortP}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {statusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 text-success border-success/30 hover:bg-success/10"
                              disabled={!isPending || setApproval.isPending}
                              onClick={() => handleApprove(item.principal)}
                              data-ocid={`approval.confirm_button.${index + 1}`}
                            >
                              {setApproval.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                              disabled={!isPending || setApproval.isPending}
                              onClick={() => handleReject(item.principal)}
                              data-ocid={`approval.delete_button.${index + 1}`}
                            >
                              <XCircle className="w-3 h-3" />
                              Tolak
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
