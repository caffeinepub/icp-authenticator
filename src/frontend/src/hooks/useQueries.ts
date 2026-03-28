import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

type Account = {
  id: bigint;
  accountName: string;
  issuer: string;
  secret: string;
};

export function useRegister() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const result = await (actor as any).register();
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useGetAccounts() {
  const { actor, isFetching } = useActor();
  return useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAccounts();
      if ("err" in result) throw new Error(result.err);
      return result.ok as Account[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      accountName: string;
      issuer: string;
      secret: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await (actor as any).addAccount(
        data.accountName,
        data.issuer,
        data.secret,
      );
      if ("err" in result) throw new Error(result.err);
      return result.ok as bigint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await (actor as any).deleteAccount(id);
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
