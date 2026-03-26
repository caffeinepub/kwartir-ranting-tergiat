import type { Kwarran } from "../backend.d.ts";
import { createDefaultSectionC } from "../types/kwarran";
import type { KwarranFormData } from "../types/kwarran";

export function kwarranToFormData(k: Kwarran): KwarranFormData {
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
