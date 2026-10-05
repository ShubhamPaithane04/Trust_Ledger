import { useQuery, useQueryClient } from '@tanstack/react-query';
import { readJson, type Alert, type ChainResponse, type ProductMap } from './chainverify';

const getJson = <T,>(url: string) => fetch(url).then((r) => readJson<T>(r));

export function useChain() {
  return useQuery({ queryKey: ['chain'], queryFn: () => getJson<ChainResponse>('/api/chain'), refetchInterval: 3000 });
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: () => getJson<ProductMap>('/api/products'), refetchInterval: 5000 });
}

export function useAlerts() {
  return useQuery({ queryKey: ['alerts'], queryFn: () => getJson<Alert[]>('/api/alerts'), refetchInterval: 3000 });
}

// Call after any write so every view picks up the new block right away
export function useRefreshLedger() {
  const client = useQueryClient();
  return () => client.invalidateQueries();
}
