import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { NavState } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  onNavigate?: (state: NavState) => void;
}

export default function LoginPage({ onNavigate }: Props) {
  const { login, isLoggingIn, identity } = useInternetIdentity();

  // If identity is now available, navigate to dashboard
  if (identity && onNavigate) {
    onNavigate({ page: "dashboard" });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <img
          src="/assets/uploads/tergiat-019d28b4-1904-700e-be4b-70725b6daedf-1.png"
          alt="Logo Kwarran Tergiat"
          className="w-24 h-24 object-contain mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold text-foreground mb-1">Masuk Admin</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Sistem Penilaian Kwartir Ranting Tergiat &mdash; Kwarcab Subang 2026
        </p>
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="login.primary_button"
        >
          {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoggingIn ? "Menghubungkan..." : "Masuk dengan Internet Identity"}
        </Button>
        {onNavigate && (
          <button
            type="button"
            className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
            onClick={() => onNavigate({ page: "landing" })}
          >
            Kembali ke Halaman Utama
          </button>
        )}
        <p className="mt-8 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
