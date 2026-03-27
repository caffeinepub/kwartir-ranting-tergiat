import type { KwarranFormData } from "../types/kwarran";

export function computeScoreA(data: KwarranFormData): number {
  let score = 0;
  if (data.hasSecretariat) score += 3;
  if (data.secretariatStatus) score += 2;
  if (data.secretariatAddress) score += 2;
  if (data.email) score += 1;
  if (data.facebook) score += 1;
  if (data.instagram) score += 1;
  if (data.hasCampground) score += 3;
  if (data.campgroundStatus) score += 2;
  if (data.serviceTermStart) score += 1.5;
  if (data.serviceTermEnd) score += 1.5;
  if (data.catatanSk) score += 2;
  return Math.min(Math.round(score * 10) / 10, 20);
}

export function computeScoreB(data: KwarranFormData): number {
  let score = 0;
  if (data.youngMembersCount > 0) score += 3;
  if (data.adultMembersCount > 0) score += 3;
  if (data.maleGugusdepanCount > 0) score += 2;
  if (data.femaleGugusdepanCount > 0) score += 2;
  if (data.satgasPramukaPeduliCount > 0) score += 3;
  if (data.secretariatStaffCount > 0) score += 3;
  if (data.activeSatuanKaryaCount > 0) score += 2;
  if (data.satuanKaryaNames) score += 2;
  return Math.min(Math.round(score * 10) / 10, 20);
}

export function computeScoreC(data: KwarranFormData): number {
  const allActivities = [
    ...data.sectionC.c1,
    ...data.sectionC.c2,
    ...data.sectionC.c3,
    ...data.sectionC.c4,
    ...data.sectionC.c5,
    ...data.sectionC.c6,
  ];
  const total = allActivities.length; // 38
  const maxScore = 60;
  const maxPerItem = maxScore / total;

  let score = 0;
  let fileBonus = 0;
  for (const act of allActivities) {
    const frek = Math.min(act.frekuensi, 5);
    if (frek > 0) {
      score += (frek / 5) * maxPerItem;
    }
    if (act.fileUrl) {
      fileBonus += 0.5;
    }
  }
  return Math.min(Math.round((score + fileBonus) * 10) / 10, 60);
}

export function computeTotalScore(data: KwarranFormData): number {
  return (
    Math.round(
      (computeScoreA(data) + computeScoreB(data) + computeScoreC(data)) * 10,
    ) / 10
  );
}

export function getStatusLabel(
  score: number,
): "Tergiat" | "Aktif" | "Perlu Perhatian" {
  if (score >= 80) return "Tergiat";
  if (score >= 60) return "Aktif";
  return "Perlu Perhatian";
}

export function getStatusColor(status: string): string {
  if (status === "Tergiat")
    return "bg-success/10 text-success border-success/30";
  if (status === "Aktif") return "bg-warning/10 text-warning border-warning/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}
