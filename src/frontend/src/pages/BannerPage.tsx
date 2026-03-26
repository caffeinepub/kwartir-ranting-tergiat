import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useListBannerImages } from "../hooks/usePublicQueries";
import { useAddBannerImage, useRemoveBannerImage } from "../hooks/useQueries";
import { useUploadFile } from "../hooks/useUploadFile";

export default function BannerPage() {
  const { data: banners, isLoading } = useListBannerImages();
  const addBanner = useAddBannerImage();
  const removeBanner = useRemoveBannerImage();
  const uploadFile = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const url = await uploadFile(bytes, (pct) => setUploadProgress(pct));
      await addBanner.mutateAsync(url);
      toast.success("Gambar banner berhasil diunggah!");
    } catch {
      toast.error("Gagal mengunggah gambar. Silakan coba lagi.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(url: string) {
    setDeletingUrl(url);
    try {
      await removeBanner.mutateAsync(url);
      toast.success("Gambar banner berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus gambar.");
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div data-ocid="banner.page">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Banner</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Unggah foto kegiatan Pramuka untuk ditampilkan di slider banner
            halaman utama.
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Image className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border border-border shadow-card rounded-xl mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Unggah Gambar Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            data-ocid="banner.upload_button"
          />
          <button
            type="button"
            disabled={uploading}
            className="w-full border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors disabled:cursor-not-allowed"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="banner.dropzone"
          >
            {uploading ? (
              <div
                className="flex flex-col items-center gap-3"
                data-ocid="banner.loading_state"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  Mengunggah... {uploadProgress}%
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Klik untuk unggah gambar
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Format: JPG, PNG, WEBP. Ukuran maks: 10 MB
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm border border-border rounded-md px-3 py-1.5 bg-background hover:bg-accent transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Pilih Gambar
                </span>
              </div>
            )}
          </button>
        </CardContent>
      </Card>

      {/* Banner Grid */}
      <Card className="border border-border shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Image className="w-4 h-4" />
            Gambar Banner ({banners?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              data-ocid="banner.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full aspect-video rounded-lg" />
              ))}
            </div>
          ) : !banners || banners.length === 0 ? (
            <div className="py-12 text-center" data-ocid="banner.empty_state">
              <Image className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                Belum ada gambar banner
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Unggah foto kegiatan Pramuka untuk slider banner.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {banners.map((url, index) => (
                <div
                  key={url}
                  className="relative group rounded-lg overflow-hidden border border-border"
                  data-ocid={`banner.item.${index + 1}`}
                >
                  <img
                    src={url}
                    alt={`Banner ${index + 1}`}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 gap-1.5 text-xs"
                      disabled={deletingUrl === url}
                      onClick={() => handleDelete(url)}
                      data-ocid={`banner.delete_button.${index + 1}`}
                    >
                      {deletingUrl === url ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Hapus
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                    <p className="text-white text-xs truncate">
                      Banner {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
