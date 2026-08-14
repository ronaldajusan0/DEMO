"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  async function cancel() {
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/appointments/${id}/cancel`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(data.error ?? `Error ${res.status}`);
    }
  }

  return (
    <span>
      <button onClick={cancel} disabled={busy}>
        {busy ? "Cancelling…" : "Cancel"}
      </button>
      {err ? <span style={{ color: "crimson" }}> {err}</span> : null}
    </span>
  );
}
