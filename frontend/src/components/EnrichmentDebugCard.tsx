import React from "react";

type Props = {
  address?: string;
  loading: boolean;
  error: string | null;
  data: any;
};

export default function EnrichmentDebugCard({ address, loading, error, data }: Props) {
  return (
    <section style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 8, margin: "12px 0" }}>
      <h4 style={{ margin: 0 }}>Enrichment Debug</h4>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        <div><strong>address prop:</strong> {address || "(empty)"} </div>
        <div><strong>loading:</strong> {String(loading)}</div>
        <div><strong>error:</strong> {error || "(none)"} </div>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, marginTop: 8, maxHeight: 240, overflow: "auto" }}>
{JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

