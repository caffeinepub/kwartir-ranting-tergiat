import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Info,
  PlusCircle,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import type { NavState } from "../App";
import type { Kwarran } from "../backend.d.ts";
import {
  useIsAdmin,
  useListKwarran,
  useListMyKwarran,
} from "../hooks/useQueries";
import { createDefaultSectionC } from "../types/kwarran";
import type { KwarranFormData } from "../types/kwarran";
import {
  computeScoreA,
  computeScoreB,
  computeScoreC,
  computeTotalScore,
  getStatusColor,
  getStatusLabel,
} from "../utils/scoring";

function kwarranToFormData(k: Kwarran): KwarranFormData {
  let sectionC = createDefaultSectionC();
  let catatanSk = k.skDocument;
  try {
    const parsed = JSON.parse(k.skDocument);
    if (parsed?.sectionC) {
      sectionC = parsed.sectionC;
      catatanSk = parsed.catatanSk || "";
    }
  } catch {
    // skDocument is plain text
  }
  return {
    id: k.id,
    name: k.name,
    hasSecretariat: k.hasSecretariat,
    secretariatStatus: k.secretariatStatus,
    secretariatAddress: k.secretariatAddress,
    email: k.email,
    facebook: k.facebook,
    instagram: k.instagram,
    hasCampground: k.hasCampground,
    campgroundStatus: k.campgroundStatus,
    serviceTermStart: k.serviceTermStart,
    serviceTermEnd: k.serviceTermEnd,
    catatanSk,
    youngMembersCount: Number(k.youngMembersCount),
    adultMembersCount: Number(k.adultMembersCount),
    maleGugusdepanCount: Number(k.maleGugusdepanCount),
    femaleGugusdepanCount: Number(k.femaleGugusdepanCount),
    satgasPramukaPeduliCount: Number(k.satgasPramukaPeduliCount),
    secretariatStaffCount: Number(k.secretariatStaffCount),
    activeSatuanKaryaCount: Number(k.activeSatuanKaryaCount),
    satuanKaryaNames: k.satuanKaryaNames,
    sectionC,
  };
}

interface Props {
  onNavigate: (state: NavState) => void;
}

export default function DashboardPage({ onNavigate }: Props) {
  const { data: isAdmin } = useIsAdmin();
  const { data: allKwarran, isLoading: loadingAll } = useListKwarran();
  const { data: myKwarran, isLoading: loadingMy } = useListMyKwarran();

  const kwarranList = isAdmin ? allKwarran : myKwarran;
  const isLoading = isAdmin ? loadingAll : loadingMy;

  const scoredList = useMemo(() => {
    if (!kwarranList) return [];
    return kwarranList
      .map((k) => {
        const fd = kwarranToFormData(k);
        const scoreA = computeScoreA(fd);
        const scoreB = computeScoreB(fd);
        const scoreC = computeScoreC(fd);
        const total = computeTotalScore(fd);
        const status = getStatusLabel(total);
        return { k, fd, scoreA, scoreB, scoreC, total, status };
      })
      .sort((a, b) => b.total - a.total);
  }, [kwarranList]);

  const totalKwarran = scoredList.length;
  const rataRata =
    totalKwarran > 0
      ? Math.round(
          (scoredList.reduce((s, x) => s + x.total, 0) / totalKwarran) * 10,
        ) / 10
      : 0;
  const terbaik = scoredList[0]?.k.name || "-";
  const lengkap = scoredList.filter((x) => x.total >= 80).length;

  return (
    <div data-ocid="dashboard.page">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard Penilaian
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kwartir Ranting Tergiat &mdash; Rekapitulasi Penilaian
          </p>
          {isAdmin === false && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-1.5 inline-flex">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Menampilkan data milik Anda. Admin dapat melihat semua data.
            </div>
          )}
        </div>
        <Button
          onClick={() => onNavigate({ page: "tambah" })}
          className="gap-2 text-sm"
          data-ocid="dashboard.primary_button"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Kwarran
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-border shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Kwarran
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton
                className="h-8 w-16"
                data-ocid="dashboard.loading_state"
              />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                {totalKwarran}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rata-rata Skor
              </span>
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-warning" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{rataRata}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kwarran Terbaik
              </span>
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-success" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p
                className="text-lg font-bold text-foreground truncate"
                title={terbaik}
              >
                {terbaik}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kwarran Tergiat
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{lengkap}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="border border-border shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {isAdmin ? "Papan Pemeringkatan Kwarran" : "Data Kwarran Anda"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="p-6 space-y-3"
              data-ocid="leaderboard.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : scoredList.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="leaderboard.empty_state"
            >
              <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                Belum ada data kwarran
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Tambahkan kwarran untuk melihat pemeringkatan.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => onNavigate({ page: "tambah" })}
                data-ocid="leaderboard.secondary_button"
              >
                Tambah Kwarran Pertama
              </Button>
            </div>
          ) : (
            <Table data-ocid="leaderboard.table">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6 w-10">#</TableHead>
                  <TableHead>Nama Kwarran</TableHead>
                  <TableHead className="text-right">Skor A</TableHead>
                  <TableHead className="text-right">Skor B</TableHead>
                  <TableHead className="text-right">Skor C</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoredList.map((item, index) => (
                  <TableRow
                    key={item.k.id.toString()}
                    data-ocid={`leaderboard.item.${index + 1}`}
                    className="cursor-pointer hover:bg-accent/30"
                    onClick={() =>
                      onNavigate({ page: "edit", editId: item.k.id })
                    }
                  >
                    <TableCell className="pl-6 font-bold text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {item.k.name}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.scoreA.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.scoreB.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.scoreC.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={item.total} className="w-20 h-1.5" />
                        <span className="font-bold text-sm w-10 text-right">
                          {item.total}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
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
