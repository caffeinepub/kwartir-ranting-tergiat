import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ChevronLeft, ChevronRight, Star, Trophy, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NavState } from "../App";
import { usePublicListKwarran } from "../hooks/usePublicQueries";
import { kwarranToFormData } from "../utils/kwarranHelpers";
import {
  computeScoreA,
  computeScoreB,
  computeScoreC,
  computeTotalScore,
  getStatusColor,
  getStatusLabel,
} from "../utils/scoring";

const BANNERS = [
  "/assets/generated/banner-1.dim_1200x400.jpg",
  "/assets/generated/banner-2.dim_1200x400.jpg",
  "/assets/generated/banner-3.dim_1200x400.jpg",
];

function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % BANNERS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  }, [next]);

  return (
    <div
      className="relative w-full overflow-hidden bg-muted"
      style={{ height: "clamp(180px, 35vw, 420px)" }}
      data-ocid="banner.panel"
    >
      {BANNERS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Banner ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />

      {/* Prev/Next */}
      <button
        type="button"
        aria-label="Sebelumnya"
        data-ocid="banner.pagination_prev"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
        onClick={() => {
          prev();
          resetTimer();
        }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Berikutnya"
        data-ocid="banner.pagination_next"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
        onClick={() => {
          next();
          resetTimer();
        }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {BANNERS.map((bannerSrc, i) => (
          <button
            type="button"
            key={bannerSrc}
            aria-label={`Banner ${i + 1}`}
            onClick={() => {
              setCurrent(i);
              resetTimer();
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

interface Props {
  onNavigate: (state: NavState) => void;
}

export default function LandingPage({ onNavigate }: Props) {
  const { data: kwarranList, isLoading } = usePublicListKwarran();

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
        return { k, scoreA, scoreB, scoreC, total, status };
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

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="landing.page"
    >
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <img
              src="/assets/tergiat-019d28b4-1904-700e-be4b-70725b6daedf.png"
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-sm text-foreground hidden sm:block">
              Kwartir Ranting Tergiat
            </span>
            <span className="font-bold text-sm text-foreground sm:hidden">
              Kwarran Tergiat
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate({ page: "register" })}
              data-ocid="landing.register_button"
            >
              Daftar Akun
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigate({ page: "login" })}
              data-ocid="landing.primary_button"
            >
              Masuk Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Banner Slider */}
      <BannerSlider />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border border-border shadow-card rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Kwarran Terdaftar
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton
                  className="h-8 w-16"
                  data-ocid="landing.loading_state"
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
                  Rata-rata Nilai
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
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Peringkat Penilaian Kwartir Ranting
          </h2>
          <Card className="border border-border shadow-card rounded-xl overflow-hidden">
            {isLoading ? (
              <div
                className="p-6 space-y-3"
                data-ocid="landing.leaderboard.loading_state"
              >
                {[1, 2, 3, 4, 5].map((_i) => (
                  <Skeleton key={_i} className="h-12 w-full" />
                ))}
              </div>
            ) : scoredList.length === 0 ? (
              <div
                className="p-12 text-center"
                data-ocid="landing.leaderboard.empty_state"
              >
                <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold text-foreground">
                  Belum ada data penilaian
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Data penilaian akan tampil di sini setelah admin menginput
                  data kwarran.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="landing.leaderboard.table">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="pl-4 w-12">No.</TableHead>
                      <TableHead>Nama Kwartir Ranting</TableHead>
                      <TableHead className="text-right hidden md:table-cell">
                        Nilai A (Profil)
                      </TableHead>
                      <TableHead className="text-right hidden md:table-cell">
                        Nilai B (Potensi)
                      </TableHead>
                      <TableHead className="text-right hidden md:table-cell">
                        Nilai C (Program)
                      </TableHead>
                      <TableHead className="text-right">Total Nilai</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scoredList.map((item, index) => (
                      <TableRow
                        key={item.k.id.toString()}
                        data-ocid={`landing.leaderboard.item.${index + 1}`}
                      >
                        <TableCell className="pl-4">
                          {index === 0 ? (
                            <span className="text-warning font-bold text-lg">
                              🥇
                            </span>
                          ) : index === 1 ? (
                            <span className="text-muted-foreground font-bold text-lg">
                              🥈
                            </span>
                          ) : index === 2 ? (
                            <span className="font-bold text-lg">🥉</span>
                          ) : (
                            <span className="font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {item.k.name}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-sm">
                          {item.scoreA.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-sm">
                          {item.scoreB.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-sm">
                          {item.scoreC.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress
                              value={item.total}
                              className="w-16 h-1.5 hidden sm:block"
                            />
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
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Kwartir Ranting Tergiat &mdash;
        Kwarcab Subang. Dibangun dengan ❤️ menggunakan{" "}
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
