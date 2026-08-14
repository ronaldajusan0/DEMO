"use client";

import { useState } from "react";
import type { AvailabilityWindowRecord } from "@/lib/availability/service";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

type Draft = { weekday: number; start: string; end: string };
const toMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

export function AvailabilityEditor({
  initial,
}: {
  initial: AvailabilityWindowRecord[];
}) {
  const [rows, setRows] = useState<Draft[]>(
    initial.map((w) => ({
      weekday: w.weekday,
      start: hhmm(w.startMin),
      end: hhmm(w.endMin),
    })),
  );
  const [status, setStatus] = useState<string>("");

  const add = () => setRows((r) => [...r, { weekday: 1, start: "09:00", end: "17:00" }]);
  const remove = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  async function save() {
    setStatus("Saving…");
    const res = await fetch("/api/availability", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        rows.map((r) => ({
          weekday: r.weekday,
          startMin: toMin(r.start),
          endMin: toMin(r.end),
        })),
      ),
    });
    setStatus(res.ok ? "Saved." : `Error: ${(await res.json()).error ?? res.status}`);
  }

  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <select
            value={r.weekday}
            onChange={(e) =>
              setRows((rs) =>
                rs.map((x, j) => (j === i ? { ...x, weekday: Number(e.target.value) } : x)),
              )
            }
          >
            {DAYS.map((d, di) => (
              <option key={di} value={di}>
                {d}
              </option>
            ))}
          </select>{" "}
          <input
            type="time"
            value={r.start}
            onChange={(e) =>
              setRows((rs) => rs.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))
            }
          />{" "}
          <input
            type="time"
            value={r.end}
            onChange={(e) =>
              setRows((rs) => rs.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))
            }
          />{" "}
          <button onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button onClick={add}>Add window</button>{" "}
      <button onClick={save}>Save</button>
      <p>{status}</p>
    </div>
  );
}
