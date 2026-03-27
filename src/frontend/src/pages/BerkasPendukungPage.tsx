import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useListKwarran } from "../hooks/useQueries";
import {
  C1_ACTIVITIES,
  C2_ACTIVITIES,
  C3_ACTIVITIES,
  C4_ACTIVITIES,
  C5_ACTIVITIES,
  C6_ACTIVITIES,
  createDefaultSectionC,
} from "../types/kwarran";

const SECTION_LABELS: Record<string, string> = {
  c1: "C1. Kegiatan Siaga",
  c2: "C2. Kegiatan Penggalang",
  c3: "C3. Kegiatan Penegak/Pandega",
  c4: "C4. Kegiatan Dewasa",
  c5: "C5. Kegiatan Pusdiklat",
  c6: "C6. Kegiatan DKR",
};

const SECTION_ACTIVITIES: Record<string, string[]> = {
  c1: C1_ACTIVITIES,
  c2: C2_ACTIVITIES,
  c3: C3_ACTIVITIES,
  c4: C4_ACTIVITIES,
  c5: C5_ACTIVITIES,
  c6: C6_ACTIVITIES,
};

type FileEntry = {
  kwarranName: string;
  kwarranId: bigint;
  section: string;
  activityName: string;
  keterangan: string;
  fileUrl: string;
};

export default function BerkasPendukungPage() {
  const { data: kwarranList, isLoading } = useListKwarran();
  const [search, setSearch] = useState("");

  const fileEntries = useMemo<FileEntry[]>(() => {
    if (!kwarranList) return [];
    const result: FileEntry[] = [];

    for (const k of kwarranList) {
      let sectionC = createDefaultSectionC();
      try {
        const parsed = JSON.parse(k.skDocument);
        if (parsed?.sectionC) sectionC = parsed.sectionC;
      } catch {
        // plain text skDocument
      }

      const sections = ["c1", "c2", "c3", "c4", "c5", "c6"] as const;
      for (const sec of sections) {
        const activities = sectionC[sec] ?? [];
        const actLabels = SECTION_ACTIVITIES[sec] ?? [];
        activities.forEach((act, i) => {
          if (act.fileUrl) {
            result.push({
              kwarranName: k.name,
              kwarranId: k.id,
              section: SECTION_LABELS[sec],
              activityName: actLabels[i] ?? `Kegiatan ${i + 1}`,
              keterangan: act.keterangan || "-",
              fileUrl: act.fileUrl,
            });
          }
        });
      }
    }
    return result;
  }, [kwarranList]);

  const filtered = useMemo(() => {
    if (!search) return fileEntries;
    const q = search.toLowerCase();
    return fileEntries.filter(
      (e) =>
        e.kwarranName.toLowerCase().includes(q) ||
        e.activityName.toLowerCase().includes(q) ||
        e.section.toLowerCase().includes(q),
    );
  }, [fileEntries, search]);

  function getFilename(url: string) {
    try {
      const parts = url.split("/");
      return decodeURIComponent(parts[parts.length - 1] || "berkas");
    } catch {
      return "berkas";
    }
  }

  return (
    <div data-ocid="berkas.page">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Berkas Pendukung
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Semua berkas pendukung yang diunggah oleh pengguna
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-border shadow-card rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Berkas</p>
            <p className="text-2xl font-bold">
              {isLoading ? "-" : fileEntries.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-card rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Kwarran</p>
            <p className="text-2xl font-bold">
              {isLoading ? "-" : (kwarranList?.length ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-card rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Kwarran Berkas Aktif
            </p>
            <p className="text-2xl font-bold">
              {isLoading
                ? "-"
                : new Set(fileEntries.map((e) => e.kwarranId.toString())).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">
              Daftar Berkas
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari kwarran atau kegiatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
                data-ocid="berkas.search_input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="berkas.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" data-ocid="berkas.empty_state">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                {search
                  ? "Tidak ada berkas ditemukan"
                  : "Belum ada berkas diunggah"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {search
                  ? "Coba ubah kata pencarian."
                  : "Berkas pendukung akan muncul di sini setelah pengguna mengunggah."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="berkas.table">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-6 w-8">#</TableHead>
                    <TableHead>Nama Kwarran</TableHead>
                    <TableHead>Kelompok Kegiatan</TableHead>
                    <TableHead>Nama Kegiatan</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry, index) => (
                    <TableRow
                      key={`${entry.kwarranId}-${index}`}
                      data-ocid={`berkas.item.${index + 1}`}
                    >
                      <TableCell className="pl-6 text-muted-foreground text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm">
                          {entry.kwarranName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.section}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-48">
                        <span
                          title={entry.activityName}
                          className="line-clamp-2"
                        >
                          {entry.activityName}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-40">
                        <span title={entry.keterangan} className="line-clamp-1">
                          {entry.keterangan}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          asChild
                          data-ocid={`berkas.download_button.${index + 1}`}
                        >
                          <a
                            href={entry.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={getFilename(entry.fileUrl)}
                          >
                            <Download className="w-3 h-3" />
                            Unduh
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
