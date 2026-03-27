import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Paperclip,
  Save,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { NavState } from "../App";
import type { Kwarran } from "../backend.d.ts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateKwarran,
  useGetKwarran,
  useIsAdmin,
  useUpdateKwarran,
} from "../hooks/useQueries";
import { useUploadFile } from "../hooks/useUploadFile";
import {
  type ActivityData,
  C1_ACTIVITIES,
  C2_ACTIVITIES,
  C3_ACTIVITIES,
  C4_ACTIVITIES,
  C5_ACTIVITIES,
  C6_ACTIVITIES,
  type KwarranFormData,
  createDefaultFormData,
  createDefaultSectionC,
} from "../types/kwarran";
import { computeScoreA, computeScoreB, computeScoreC } from "../utils/scoring";

interface Props {
  editId?: bigint;
  onNavigate: (state: NavState) => void;
}

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

function formDataToKwarran(fd: KwarranFormData): Kwarran {
  const skDocument = JSON.stringify({
    catatanSk: fd.catatanSk,
    sectionC: fd.sectionC,
  });
  return {
    id: fd.id ?? BigInt(0),
    name: fd.name,
    hasSecretariat: fd.hasSecretariat,
    secretariatStatus: fd.secretariatStatus,
    secretariatAddress: fd.secretariatAddress,
    email: fd.email,
    facebook: fd.facebook,
    instagram: fd.instagram,
    hasCampground: fd.hasCampground,
    campgroundStatus: fd.campgroundStatus,
    serviceTermStart: fd.serviceTermStart,
    serviceTermEnd: fd.serviceTermEnd,
    skDocument,
    youngMembersCount: BigInt(fd.youngMembersCount),
    adultMembersCount: BigInt(fd.adultMembersCount),
    maleGugusdepanCount: BigInt(fd.maleGugusdepanCount),
    femaleGugusdepanCount: BigInt(fd.femaleGugusdepanCount),
    satgasPramukaPeduliCount: BigInt(fd.satgasPramukaPeduliCount),
    secretariatStaffCount: BigInt(fd.secretariatStaffCount),
    activeSatuanKaryaCount: BigInt(fd.activeSatuanKaryaCount),
    satuanKaryaNames: fd.satuanKaryaNames,
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
    owner: {} as Kwarran["owner"], // will be overridden with valid Principal before sending
  };
}

interface ActivityRowProps {
  label: string;
  value: ActivityData;
  ocidPrefix: string;
  onChange: (val: ActivityData) => void;
}

function ActivityRow({ label, value, ocidPrefix, onChange }: ActivityRowProps) {
  const uploadFile = useUploadFile();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const url = await uploadFile(bytes);
      onChange({ ...value, fileUrl: url });
      toast.success("Berkas berhasil diunggah (+0.5 poin)");
    } catch {
      toast.error("Gagal mengunggah berkas");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-border last:border-0">
      <div className="col-span-5">
        <p className="text-sm text-foreground">{label}</p>
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min={0}
          max={20}
          value={value.frekuensi}
          onChange={(e) =>
            onChange({
              ...value,
              frekuensi: Number.parseInt(e.target.value) || 0,
            })
          }
          className="h-8 text-sm text-center"
          data-ocid={`${ocidPrefix}.input`}
        />
      </div>
      <div className="col-span-3">
        <Input
          placeholder="Keterangan..."
          value={value.keterangan}
          onChange={(e) => onChange({ ...value, keterangan: e.target.value })}
          className="h-8 text-sm"
          data-ocid={`${ocidPrefix}.input`}
        />
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          data-ocid={`${ocidPrefix}.upload_button`}
        />
        {isUploading ? (
          <Loader2
            className="w-4 h-4 animate-spin text-muted-foreground"
            data-ocid={`${ocidPrefix}.loading_state`}
          />
        ) : value.fileUrl ? (
          <a
            href={value.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-success font-medium hover:underline"
            title="Lihat berkas"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+0.5</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Unggah berkas pendukung (+0.5 poin)"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface SectionCGroupProps {
  title: string;
  activities: string[];
  data: ActivityData[];
  prefix: string;
  onChange: (data: ActivityData[]) => void;
}

function SectionCGroup({
  title,
  activities,
  data,
  prefix,
  onChange,
}: SectionCGroupProps) {
  const updateActivity = (index: number, val: ActivityData) => {
    const updated = [...data];
    updated[index] = val;
    onChange(updated);
  };

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
        {title}
      </h4>
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-5">
          <span className="text-xs font-medium text-muted-foreground">
            Nama Kegiatan
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-medium text-muted-foreground">
            Frekuensi
          </span>
        </div>
        <div className="col-span-3">
          <span className="text-xs font-medium text-muted-foreground">
            Keterangan
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-medium text-muted-foreground">
            Berkas
          </span>
        </div>
      </div>
      {activities.map((act, i) => (
        <ActivityRow
          key={act}
          label={act}
          value={data[i] ?? { frekuensi: 0, keterangan: "" }}
          ocidPrefix={`${prefix}.${i + 1}`}
          onChange={(val) => updateActivity(i, val)}
        />
      ))}
    </div>
  );
}

export default function KwarranFormPage({ editId, onNavigate }: Props) {
  const isEdit = editId !== undefined;
  const { data: existingData, isLoading: isLoadingExisting } = useGetKwarran(
    isEdit ? editId : null,
  );
  const { data: isAdmin } = useIsAdmin();
  const { identity } = useInternetIdentity();

  const createMutation = useCreateKwarran();
  const updateMutation = useUpdateKwarran();

  const [form, setForm] = useState<KwarranFormData>(createDefaultFormData());
  const [activeTab, setActiveTab] = useState("a");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit && existingData) {
      setForm(kwarranToFormData(existingData));
    }
  }, [isEdit, existingData]);

  // Ownership check: non-admin users can only edit their own records
  useEffect(() => {
    if (isEdit && existingData && isAdmin === false && identity) {
      const callerPrincipal = identity.getPrincipal().toString();
      const ownerPrincipal = existingData.owner?.toString();
      if (ownerPrincipal && callerPrincipal !== ownerPrincipal) {
        toast.error("Anda tidak memiliki izin untuk mengedit data ini");
        onNavigate({ page: "daftar" });
      }
    }
  }, [isEdit, existingData, isAdmin, identity, onNavigate]);

  const set = (key: keyof KwarranFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const scoreA = computeScoreA(form);
  const scoreB = computeScoreB(form);
  const scoreC = computeScoreC(form);
  const total = Math.round((scoreA + scoreB + scoreC) * 10) / 10;

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Nama Kwartir Ranting wajib diisi");
      setActiveTab("a");
      return;
    }
    if (!identity) {
      toast.error("Sesi login tidak ditemukan, silakan login ulang");
      return;
    }
    setIsSaving(true);
    try {
      const kwarranData = formDataToKwarran(form);
      if (isEdit && editId !== undefined) {
        // Use existing owner for update (backend preserves it anyway, but Candid needs a valid Principal)
        const kwarranWithOwner = {
          ...kwarranData,
          owner: existingData?.owner ?? identity.getPrincipal(),
        };
        await updateMutation.mutateAsync({
          id: editId,
          kwarran: kwarranWithOwner,
        });
        toast.success("Data kwarran berhasil diperbarui");
      } else {
        // Pass caller's principal so Candid can encode the request
        const kwarranWithOwner = {
          ...kwarranData,
          owner: identity.getPrincipal(),
        };
        await createMutation.mutateAsync(kwarranWithOwner);
        toast.success("Kwarran baru berhasil ditambahkan");
      }
      onNavigate({ page: "daftar" });
    } catch {
      toast.error("Gagal menyimpan data kwarran");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoadingExisting) {
    return (
      <div data-ocid="form.loading_state" className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div data-ocid="form.page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate({ page: "daftar" })}
          className="h-8 w-8 p-0 text-muted-foreground"
          data-ocid="form.secondary_button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit Kwarran" : "Tambah Kwarran"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEdit
              ? `Memperbarui data: ${form.name}`
              : "Isi data kwartir ranting baru"}
          </p>
        </div>
        {/* Score summary */}
        <div className="hidden md:flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Skor A</p>
            <p className="font-bold text-sm">
              {scoreA.toFixed(1)}
              <span className="text-xs text-muted-foreground">/20</span>
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Skor B</p>
            <p className="font-bold text-sm">
              {scoreB.toFixed(1)}
              <span className="text-xs text-muted-foreground">/20</span>
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Skor C</p>
            <p className="font-bold text-sm">
              {scoreC.toFixed(1)}
              <span className="text-xs text-muted-foreground">/60</span>
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-bold text-primary">
              {total}
              <span className="text-xs text-muted-foreground">/100</span>
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="gap-2"
          data-ocid="form.submit_button"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan
            </>
          )}
        </Button>
      </div>

      {/* Tabs form */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 h-auto p-1 bg-card border border-border rounded-xl w-full justify-start gap-1">
          <TabsTrigger
            value="a"
            data-ocid="form.tab_a.tab"
            className="flex-1 md:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <span className="hidden md:inline">A. Profil Kwartir Ranting</span>
            <span className="md:hidden">Tab A</span>
            <span className="ml-2 text-xs opacity-70">
              {scoreA.toFixed(0)}/20
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="b"
            data-ocid="form.tab_b.tab"
            className="flex-1 md:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <span className="hidden md:inline">B. Data Potensi</span>
            <span className="md:hidden">Tab B</span>
            <span className="ml-2 text-xs opacity-70">
              {scoreB.toFixed(0)}/20
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="c"
            data-ocid="form.tab_c.tab"
            className="flex-1 md:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <span className="hidden md:inline">C. Realisasi Program</span>
            <span className="md:hidden">Tab C</span>
            <span className="ml-2 text-xs opacity-70">
              {scoreC.toFixed(0)}/60
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ─────────────── TAB A ─────────────── */}
        <TabsContent value="a">
          <Card className="border border-border shadow-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                A. Profil Kwartir Ranting
              </CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Progress value={(scoreA / 20) * 100} className="flex-1 h-2" />
                <span className="text-sm font-medium shrink-0">
                  {scoreA.toFixed(1)} / 20
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Nama */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama Kwartir Ranting{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  data-ocid="form.name.input"
                  placeholder="Contoh: Kwartir Ranting Kecamatan Sukamaju"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Sekretariat */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <Label className="text-sm font-medium">
                      Memiliki Sekretariat
                    </Label>
                    <Switch
                      checked={form.hasSecretariat}
                      onCheckedChange={(v) => set("hasSecretariat", v)}
                      data-ocid="form.has_secretariat.switch"
                    />
                  </div>
                  {form.hasSecretariat && (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Status Sekretariat
                      </Label>
                      <Select
                        value={form.secretariatStatus}
                        onValueChange={(v) => set("secretariatStatus", v)}
                      >
                        <SelectTrigger data-ocid="form.secretariat_status.select">
                          <SelectValue placeholder="Pilih status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Milik Sendiri">
                            Milik Sendiri
                          </SelectItem>
                          <SelectItem value="Hak Guna Pakai">
                            Hak Guna Pakai
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Bumi Perkemahan */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <Label className="text-sm font-medium">
                      Memiliki Bumi Perkemahan
                    </Label>
                    <Switch
                      checked={form.hasCampground}
                      onCheckedChange={(v) => set("hasCampground", v)}
                      data-ocid="form.has_campground.switch"
                    />
                  </div>
                  {form.hasCampground && (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Status Bumi Perkemahan
                      </Label>
                      <Select
                        value={form.campgroundStatus}
                        onValueChange={(v) => set("campgroundStatus", v)}
                      >
                        <SelectTrigger data-ocid="form.campground_status.select">
                          <SelectValue placeholder="Pilih status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Milik Sendiri">
                            Milik Sendiri
                          </SelectItem>
                          <SelectItem value="Hak Guna Pakai">
                            Hak Guna Pakai
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Alamat Sekretariat
                </Label>
                <Textarea
                  data-ocid="form.address.textarea"
                  placeholder="Alamat lengkap sekretariat..."
                  value={form.secretariatAddress}
                  onChange={(e) => set("secretariatAddress", e.target.value)}
                  rows={2}
                />
              </div>

              {/* Kontak */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    data-ocid="form.email.input"
                    type="email"
                    placeholder="kwarran@email.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Facebook</Label>
                  <Input
                    data-ocid="form.facebook.input"
                    placeholder="@nama.facebook"
                    value={form.facebook}
                    onChange={(e) => set("facebook", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Instagram</Label>
                  <Input
                    data-ocid="form.instagram.input"
                    placeholder="@instagram"
                    value={form.instagram}
                    onChange={(e) => set("instagram", e.target.value)}
                  />
                </div>
              </div>

              {/* Masa Bakti */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Periode Masa Bakti (Awal)
                  </Label>
                  <Input
                    data-ocid="form.service_term_start.input"
                    placeholder="Contoh: Januari 2022"
                    value={form.serviceTermStart}
                    onChange={(e) => set("serviceTermStart", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Periode Masa Bakti (Akhir)
                  </Label>
                  <Input
                    data-ocid="form.service_term_end.input"
                    placeholder="Contoh: Desember 2026"
                    value={form.serviceTermEnd}
                    onChange={(e) => set("serviceTermEnd", e.target.value)}
                  />
                </div>
              </div>

              {/* Catatan SK */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Catatan SK / Dokumen
                </Label>
                <Textarea
                  data-ocid="form.catatan_sk.textarea"
                  placeholder="Nomor SK, tanggal, catatan dokumen pendukung..."
                  value={form.catatanSk}
                  onChange={(e) => set("catatanSk", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────── TAB B ─────────────── */}
        <TabsContent value="b">
          <Card className="border border-border shadow-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                B. Data Potensi
              </CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Progress value={(scoreB / 20) * 100} className="flex-1 h-2" />
                <span className="text-sm font-medium shrink-0">
                  {scoreB.toFixed(1)} / 20
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Jumlah Anggota Muda
                  </Label>
                  <Input
                    data-ocid="form.young_members.input"
                    type="number"
                    min={0}
                    value={form.youngMembersCount}
                    onChange={(e) =>
                      set(
                        "youngMembersCount",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Jumlah Anggota Dewasa
                  </Label>
                  <Input
                    data-ocid="form.adult_members.input"
                    type="number"
                    min={0}
                    value={form.adultMembersCount}
                    onChange={(e) =>
                      set(
                        "adultMembersCount",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Jumlah Gugusdepan Putera
                  </Label>
                  <Input
                    data-ocid="form.male_gudep.input"
                    type="number"
                    min={0}
                    value={form.maleGugusdepanCount}
                    onChange={(e) =>
                      set(
                        "maleGugusdepanCount",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Jumlah Gugusdepan Puteri
                  </Label>
                  <Input
                    data-ocid="form.female_gudep.input"
                    type="number"
                    min={0}
                    value={form.femaleGugusdepanCount}
                    onChange={(e) =>
                      set(
                        "femaleGugusdepanCount",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Jumlah Anggota Satgas Pramuka Peduli
                  </Label>
                  <Input
                    data-ocid="form.satgas.input"
                    type="number"
                    min={0}
                    value={form.satgasPramukaPeduliCount}
                    onChange={(e) =>
                      set(
                        "satgasPramukaPeduliCount",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Jumlah Karyawan Sekretariat
                  </Label>
                  <Input
                    data-ocid="form.staff.input"
                    type="number"
                    min={0}
                    value={form.secretariatStaffCount}
                    onChange={(e) =>
                      set(
                        "secretariatStaffCount",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Jumlah Satuan Karya Aktif
                  </Label>
                  <Input
                    data-ocid="form.saka_count.input"
                    type="number"
                    min={0}
                    value={form.activeSatuanKaryaCount}
                    onChange={(e) =>
                      set(
                        "activeSatuanKaryaCount",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Nama Satuan Karya yang Aktif
                  </Label>
                  <Input
                    data-ocid="form.saka_names.input"
                    placeholder="Pramuka Bahari, Bhayangkara, dll..."
                    value={form.satuanKaryaNames}
                    onChange={(e) => set("satuanKaryaNames", e.target.value)}
                  />
                </div>
              </div>

              {/* Completeness summary */}
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Kelengkapan Data Potensi
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Anggota Muda",
                      filled: form.youngMembersCount > 0,
                    },
                    {
                      label: "Anggota Dewasa",
                      filled: form.adultMembersCount > 0,
                    },
                    {
                      label: "Gudep Putera",
                      filled: form.maleGugusdepanCount > 0,
                    },
                    {
                      label: "Gudep Puteri",
                      filled: form.femaleGugusdepanCount > 0,
                    },
                    {
                      label: "Satgas Peduli",
                      filled: form.satgasPramukaPeduliCount > 0,
                    },
                    {
                      label: "Karyawan",
                      filled: form.secretariatStaffCount > 0,
                    },
                    {
                      label: "Satuan Karya",
                      filled: form.activeSatuanKaryaCount > 0,
                    },
                    { label: "Nama Saka", filled: !!form.satuanKaryaNames },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                        item.filled
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.filled ? "bg-success" : "bg-muted-foreground/40"
                        }`}
                      />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────── TAB C ─────────────── */}
        <TabsContent value="c">
          <Card className="border border-border shadow-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                C. Realisasi Program Kegiatan (5 Tahun)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Isi frekuensi kegiatan selama 5 tahun dan keterangan bukti fisik
                (proposal, surat edaran, foto kegiatan)
              </p>
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 mt-2">
                <span className="shrink-0">💡</span>
                <span>
                  Lampirkan berkas pendukung (foto/dokumen) untuk mendapat{" "}
                  <strong>+0.5 poin</strong> per kegiatan. Total bonus maks
                  hingga skor C mencapai 60.
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Progress value={(scoreC / 60) * 100} className="flex-1 h-2" />
                <span className="text-sm font-medium shrink-0">
                  {scoreC.toFixed(1)} / 60
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <SectionCGroup
                title="C1. Kegiatan Anggota Muda Siaga"
                activities={C1_ACTIVITIES}
                data={form.sectionC.c1}
                prefix="form.c1"
                onChange={(c1) => set("sectionC", { ...form.sectionC, c1 })}
              />
              <SectionCGroup
                title="C2. Kegiatan Anggota Muda Penggalang"
                activities={C2_ACTIVITIES}
                data={form.sectionC.c2}
                prefix="form.c2"
                onChange={(c2) => set("sectionC", { ...form.sectionC, c2 })}
              />
              <SectionCGroup
                title="C3. Kegiatan Anggota Muda Penegak/Pandega"
                activities={C3_ACTIVITIES}
                data={form.sectionC.c3}
                prefix="form.c3"
                onChange={(c3) => set("sectionC", { ...form.sectionC, c3 })}
              />
              <SectionCGroup
                title="C4. Kegiatan Anggota Dewasa"
                activities={C4_ACTIVITIES}
                data={form.sectionC.c4}
                prefix="form.c4"
                onChange={(c4) => set("sectionC", { ...form.sectionC, c4 })}
              />
              <SectionCGroup
                title="C5. Kegiatan Pusdiklat"
                activities={C5_ACTIVITIES}
                data={form.sectionC.c5}
                prefix="form.c5"
                onChange={(c5) => set("sectionC", { ...form.sectionC, c5 })}
              />
              <SectionCGroup
                title="C6. Kegiatan Dewan Kerja Ranting"
                activities={C6_ACTIVITIES}
                data={form.sectionC.c6}
                prefix="form.c6"
                onChange={(c6) => set("sectionC", { ...form.sectionC, c6 })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom save bar */}
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          size="lg"
          className="gap-2 min-w-36"
          data-ocid="form.save_button"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
