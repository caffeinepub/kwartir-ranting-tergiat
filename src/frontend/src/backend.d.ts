import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface Kwarran {
    id: bigint;
    skDocument: string;
    satgasPramukaPeduliCount: bigint;
    hasCampground: boolean;
    secretariatAddress: string;
    activeSatuanKaryaCount: bigint;
    maleGugusdepanCount: bigint;
    youngMembersCount: bigint;
    instagram: string;
    name: string;
    createdAt: Time;
    femaleGugusdepanCount: bigint;
    adultMembersCount: bigint;
    email: string;
    updatedAt: Time;
    facebook: string;
    campgroundStatus: string;
    serviceTermEnd: string;
    satuanKaryaNames: string;
    secretariatStaffCount: bigint;
    hasSecretariat: boolean;
    serviceTermStart: string;
    secretariatStatus: string;
}
export interface UserProfile {
    name: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBannerImage(url: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createKwarran(kwarran: Kwarran): Promise<bigint>;
    deleteKwarran(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getKwarran(id: bigint): Promise<Kwarran | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listBannerImages(): Promise<Array<string>>;
    listKwarran(): Promise<Array<Kwarran>>;
    removeBannerImage(url: string): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateKwarran(id: bigint, kwarran: Kwarran): Promise<void>;
}
