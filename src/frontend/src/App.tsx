import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import ApprovalPage from "./pages/ApprovalPage";
import BannerPage from "./pages/BannerPage";
import BerkasPendukungPage from "./pages/BerkasPendukungPage";
import DaftarKwarranPage from "./pages/DaftarKwarranPage";
import DashboardPage from "./pages/DashboardPage";
import KwarranFormPage from "./pages/KwarranFormPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export type PageName =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "daftar"
  | "tambah"
  | "edit"
  | "approval"
  | "banner"
  | "berkas";

export interface NavState {
  page: PageName;
  editId?: bigint;
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [nav, setNav] = useState<NavState>({ page: "landing" });

  const navigate = (state: NavState) => setNav(state);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Public pages — accessible without identity
  if (nav.page === "landing") {
    return (
      <>
        <LandingPage onNavigate={navigate} />
        <Toaster />
      </>
    );
  }

  if (nav.page === "register") {
    return (
      <>
        <RegisterPage onNavigate={navigate} />
        <Toaster />
      </>
    );
  }

  // Login page
  if (nav.page === "login" || !identity) {
    return (
      <>
        <LoginPage onNavigate={navigate} />
        <Toaster />
      </>
    );
  }

  // Authenticated pages
  return (
    <>
      <Layout nav={nav} onNavigate={navigate}>
        {nav.page === "dashboard" && <DashboardPage onNavigate={navigate} />}
        {nav.page === "daftar" && <DaftarKwarranPage onNavigate={navigate} />}
        {(nav.page === "tambah" || nav.page === "edit") && (
          <KwarranFormPage editId={nav.editId} onNavigate={navigate} />
        )}
        {nav.page === "approval" && <ApprovalPage />}
        {nav.page === "banner" && <BannerPage />}
        {nav.page === "berkas" && <BerkasPendukungPage />}
      </Layout>
      <Toaster />
    </>
  );
}
