import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { NavState } from "../App";
import type { Kwarran } from "../backend.d.ts";
import { useDeleteKwarran, useListKwarran } from "../hooks/useQueries";
import { createDefaultSectionC } from "../types/kwarran";
import type { KwarranFormData } from "../types/kwarran";
import {
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
    // plain text
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

export default function DaftarKwarranPage({ onNavigate }: Props) {
  const { data: kwarranList, isLoading } = useListKwarran();
  const deleteMutation = useDeleteKwarran();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!kwarranList) return [];
    const q = search.toLowerCase();
    return kwarranList.filter((k) => k.name.toLowerCase().includes(q));
  }, [kwarranList, search]);

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Kwarran "${name}" berhasil dihapus`);
    } catch {
      toast.error("Gagal menghapus kwarran");
    }
  };

  return (
    <div data-ocid="daftar.page">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Kwarran</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola data seluruh Kwartir Ranting
          </p>
        </div>
        <Button
          onClick={() => onNavigate({ page: "tambah" })}
          className="gap-2 text-sm"
          data-ocid="daftar.primary_button"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Kwarran
        </Button>
      </div>

      <Card className="border border-border shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">
              Semua Kwartir Ranting
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                data-ocid="daftar.search_input"
                placeholder="Cari nama kwarran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="daftar.loading_state">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" data-ocid="daftar.empty_state">
              <ListChecks className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                {search
                  ? "Tidak ada kwarran ditemukan"
                  : "Belum ada data kwarran"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {search
                  ? "Coba ubah kata pencarian Anda."
                  : "Mulai dengan menambahkan kwarran baru."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((k, index) => {
                const fd = kwarranToFormData(k);
                const total = computeTotalScore(fd);
                const status = getStatusLabel(total);
                return (
                  <div
                    key={k.id.toString()}
                    data-ocid={`daftar.item.${index + 1}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {k.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {k.secretariatAddress || "Alamat belum diisi"}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Total Skor
                        </p>
                        <p className="font-bold text-sm">{total}</p>
                      </div>
                      <Progress value={total} className="w-20 h-1.5" />
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(status)}`}
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onNavigate({ page: "edit", editId: k.id })
                        }
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        data-ocid={`daftar.edit_button.${index + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            data-ocid={`daftar.delete_button.${index + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="daftar.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Kwarran?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Anda akan menghapus <strong>{k.name}</strong>.
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="daftar.cancel_button">
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              data-ocid="daftar.confirm_button"
                              onClick={() => handleDelete(k.id, k.name)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Ya, Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
