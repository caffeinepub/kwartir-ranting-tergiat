import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApprovalStatus } from "../backend";
import type { UserApprovalInfo, UserProfile } from "../backend.d.ts";
import type { Kwarran } from "../backend.d.ts";
import { useActor } from "./useActor";

export function usePublicListKwarran() {
  const { actor, isFetching } = useActor();
  return useQuery<Kwarran[]>({
    queryKey: ["public-kwarran"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listKwarran();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveCallerUserProfile(profile);
      await actor.requestApproval();
    },
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isApproved"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  return useQuery<UserApprovalInfo[]>({
    queryKey: ["approvals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      status,
    }: {
      principal: UserApprovalInfo["principal"];
      status: ApprovalStatus;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setApproval(principal, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}
