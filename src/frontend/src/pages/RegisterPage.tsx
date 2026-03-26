import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { NavState } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useIsCallerApproved,
  useRequestApproval,
} from "../hooks/usePublicQueries";

interface Props {
  onNavigate: (state: NavState) => void;
}

export default function RegisterPage({ onNavigate }: Props) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: isApproved, isLoading: checkingApproval } =
    useIsCallerApproved();
  const requestApproval = useRequestApproval();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 12)}...${principal.slice(-8)}`
    : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama lengkap harus diisi.");
      return;
    }
    try {
      await requestApproval.mutateAsync({ name: name.trim() });
      setSubmitted(true);
      toast.success("Permohonan pendaftaran berhasil dikirim!");
    } catch {
      toast.error("Gagal mengirim permohonan. Silakan coba lagi.");
    }
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="register.page"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate({ page: "landing" })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="register.close_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex items-center gap-2 flex-1">
            <img
              src="/assets/tergiat-019d28b4-1904-700e-be4b-70725b6daedf.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-sm text-foreground hidden sm:block">
              Kwartir Ranting Tergiat
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Submitted / Already approved */}
          {(submitted || isApproved) && !checkingApproval ? (
            <Card
              className="border border-border shadow-card rounded-xl"
              data-ocid="register.success_state"
            >
              <CardContent className="p-8 text-center">
                {isApproved ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Akun Disetujui!
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Akun Anda telah disetujui oleh admin. Silakan masuk
                      menggunakan tombol di bawah.
                    </p>
                    <Button
                      onClick={() => onNavigate({ page: "login" })}
                      className="w-full"
                      data-ocid="register.primary_button"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Masuk Sekarang
                    </Button>
                  </>
                ) : (
                  <>
                    <Clock className="w-16 h-16 text-warning mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Permohonan Terkirim
                    </h2>
                    <p className="text-muted-foreground text-sm mb-2">
                      Permohonan pendaftaran Anda telah dikirim dan sedang
                      menunggu persetujuan admin.
                    </p>
                    <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground break-all">
                      <span className="font-semibold block mb-1">
                        Principal ID:
                      </span>
                      {principal}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm text-warning bg-warning/10 px-3 py-1.5 rounded-full">
                      <Clock className="w-4 h-4" />
                      Menunggu Persetujuan Admin
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border shadow-card rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <img
                    src="/assets/tergiat-019d28b4-1904-700e-be4b-70725b6daedf.png"
                    alt="Logo"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <CardTitle className="text-center text-2xl font-bold">
                  Daftar Akun Baru
                </CardTitle>
                <CardDescription className="text-center">
                  Daftarkan akun Anda untuk mengakses sistem penilaian.
                  Pendaftaran perlu disetujui oleh admin.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {!identity ? (
                  /* Step 1: Connect identity */
                  <div className="text-center py-4">
                    <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-6">
                      Hubungkan identitas Internet Identity Anda terlebih dahulu
                      untuk melanjutkan pendaftaran.
                    </p>
                    <Button
                      onClick={login}
                      disabled={isLoggingIn}
                      className="w-full gap-2"
                      data-ocid="register.primary_button"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      {isLoggingIn
                        ? "Menghubungkan..."
                        : "Hubungkan Internet Identity"}
                    </Button>
                  </div>
                ) : (
                  /* Step 2: Fill form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-success/10 rounded-lg flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="break-all">
                        Terhubung: {shortPrincipal}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nama Lengkap</Label>
                      <Input
                        id="reg-name"
                        placeholder="Masukkan nama lengkap Anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        data-ocid="register.input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Principal ID</Label>
                      <div className="p-2.5 bg-muted rounded-md text-xs text-muted-foreground break-all font-mono">
                        {principal}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={requestApproval.isPending}
                      data-ocid="register.submit_button"
                    >
                      {requestApproval.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {requestApproval.isPending
                        ? "Mengirim..."
                        : "Kirim Permohonan"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()}{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
