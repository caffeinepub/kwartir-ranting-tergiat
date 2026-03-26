export interface ActivityData {
  frekuensi: number;
  keterangan: string;
}

export interface SectionCData {
  c1: ActivityData[];
  c2: ActivityData[];
  c3: ActivityData[];
  c4: ActivityData[];
  c5: ActivityData[];
  c6: ActivityData[];
}

export interface SkDocumentData {
  catatanSk: string;
  sectionC: SectionCData;
}

export interface KwarranFormData {
  id?: bigint;
  name: string;
  hasSecretariat: boolean;
  secretariatStatus: string;
  secretariatAddress: string;
  email: string;
  facebook: string;
  instagram: string;
  hasCampground: boolean;
  campgroundStatus: string;
  serviceTermStart: string;
  serviceTermEnd: string;
  catatanSk: string;
  youngMembersCount: number;
  adultMembersCount: number;
  maleGugusdepanCount: number;
  femaleGugusdepanCount: number;
  satgasPramukaPeduliCount: number;
  secretariatStaffCount: number;
  activeSatuanKaryaCount: number;
  satuanKaryaNames: string;
  sectionC: SectionCData;
}

export const C1_ACTIVITIES = [
  "Pesta Siaga",
  "Bazar Siaga",
  "Rekruitmen Pramuka Siaga Garuda",
];

export const C2_ACTIVITIES = [
  "Jambore",
  "Dianpinru",
  "Lomba Tingkat II (LT II)",
  "Ikut serta Lomba Tingkat III (LT III)",
  "Rekruitmen Pramuka Penggalang Garuda",
];

export const C3_ACTIVITIES = [
  "Raimuna",
  "Dianpinsat",
  "Perkemahan Bakti Satuan Karya (mengirimkan utusan)",
  "Lomba Gladi Tangkas Medan (LGTM)",
  "Mengirimkan utusan LPK Dewan Kerja",
  "Mengirimkan utusan Kursus Pengelola Dewan Kerja (KPDK)",
  "Rekruitmen Pramuka Penegak Garuda",
  "Partisipasi Penanganan Bencana",
  "Partisipasi Karya Bakti Natal dan Tahun Baru",
  "Partisipasi Karya Bakti Lebaran",
];

export const C4_ACTIVITIES = [
  "Karang Pamitran (Menyelenggarakan/mengirimkan utusan)",
  "KMD (Menyelenggarakan/mengirimkan utusan)",
  "KML (Menyelenggarakan/mengirimkan utusan)",
  "Mengirimkan utusan KPD",
  "Mengirimkan utusan KPL",
  "Orientasi Majelis Pembimbing (Menyelenggarakan/mengirimkan utusan)",
  "Partisipasi Penanganan Bencana",
  "Partisipasi Karya Bakti Natal dan Tahun Baru",
  "Partisipasi Karya Bakti Lebaran",
];

export const C5_ACTIVITIES = [
  "Pintaran",
  "KMD",
  "KML",
  "KPD",
  "KPL",
  "Lainnya",
];

export const C6_ACTIVITIES = [
  "Muspamitraran",
  "Giat Karya Bakti",
  "Giat Saka",
  "Giat Garuda",
  "Lainnya",
];

export function createDefaultSectionC(): SectionCData {
  return {
    c1: C1_ACTIVITIES.map(() => ({ frekuensi: 0, keterangan: "" })),
    c2: C2_ACTIVITIES.map(() => ({ frekuensi: 0, keterangan: "" })),
    c3: C3_ACTIVITIES.map(() => ({ frekuensi: 0, keterangan: "" })),
    c4: C4_ACTIVITIES.map(() => ({ frekuensi: 0, keterangan: "" })),
    c5: C5_ACTIVITIES.map(() => ({ frekuensi: 0, keterangan: "" })),
    c6: C6_ACTIVITIES.map(() => ({ frekuensi: 0, keterangan: "" })),
  };
}

export function createDefaultFormData(): KwarranFormData {
  return {
    name: "",
    hasSecretariat: false,
    secretariatStatus: "",
    secretariatAddress: "",
    email: "",
    facebook: "",
    instagram: "",
    hasCampground: false,
    campgroundStatus: "",
    serviceTermStart: "",
    serviceTermEnd: "",
    catatanSk: "",
    youngMembersCount: 0,
    adultMembersCount: 0,
    maleGugusdepanCount: 0,
    femaleGugusdepanCount: 0,
    satgasPramukaPeduliCount: 0,
    secretariatStaffCount: 0,
    activeSatuanKaryaCount: 0,
    satuanKaryaNames: "",
    sectionC: createDefaultSectionC(),
  };
}
