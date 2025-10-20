import { useEffect, useState } from "react";
import api from "../api/client";

export type Enriched = {
  address: string;
  census?: any;
  geocode?: any;
};

export function useEnrichedAddress(address?: string) {
  const [data, setData] = useState<Enriched | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/enrich-address", { params: { address } });
        if (!cancelled) setData(res.data?.data ?? null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load enrichment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [address]);

  return { data, loading, error };
}

