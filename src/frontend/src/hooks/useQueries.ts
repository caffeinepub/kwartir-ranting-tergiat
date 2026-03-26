import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Kwarran } from "../backend.d.ts";
import { useActor } from "./useActor";

export function useListKwarran() {
  const { actor, isFetching } = useActor();
  return useQuery<Kwarran[]>({
    queryKey: ["kwarran"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listKwarran();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetKwarran(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Kwarran | null>({
    queryKey: ["kwarran", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getKwarran(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateKwarran() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (kwarran: Kwarran) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createKwarran(kwarran);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kwarran"] });
    },
  });
}

export function useUpdateKwarran() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, kwarran }: { id: bigint; kwarran: Kwarran }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateKwarran(id, kwarran);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kwarran"] });
    },
  });
}

export function useDeleteKwarran() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteKwarran(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kwarran"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBannerImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addBannerImage(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-images"] });
    },
  });
}

export function useRemoveBannerImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeBannerImage(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-images"] });
    },
  });
}
