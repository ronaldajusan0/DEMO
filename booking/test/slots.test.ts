import { describe, it, expect } from "vitest";
import { generateSlots } from "../src/lib/slots/generate";

// 2026-01-05 is a Monday (UTC getUTCDay() === 1).
const MON = "2026-01-05T00:00:00.000Z";
const day = (hhmm: string) => new Date(`2026-01-05T${hhmm}:00.000Z`);
const rangeMon = { from: new Date(MON), to: new Date("2026-01-06T00:00:00.000Z") };
const iso = (slots: { start: Date }[]) =>
  slots.map((s) => s.start.toISOString().slice(11, 16));

describe("generateSlots", () => {
  it("returns only slots fully inside the availability window", () => {
    const slots = generateSlots(
      { durationMin: 30 },
      [{ weekday: 1, startMin: 540, endMin: 660 }], // Mon 09:00–11:00
      [],
      rangeMon,
    );
    // 09:00, 09:30, 10:00, 10:30 (last ends exactly at 11:00). No 11:00.
    expect(iso(slots)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("excludes slots overlapping a CONFIRMED appointment, keeps back-to-back", () => {
    const slots = generateSlots(
      { durationMin: 30 },
      [{ weekday: 1, startMin: 540, endMin: 660 }],
      [{ startAt: day("09:30"), endAt: day("10:00") }],
      rangeMon,
    );
    // 09:30 overlaps and is dropped; 09:00 and 10:00 touch it but are kept.
    expect(iso(slots)).toEqual(["09:00", "10:00", "10:30"]);
  });

  it("emits nothing when the service does not fit the window", () => {
    const slots = generateSlots(
      { durationMin: 30 },
      [{ weekday: 1, startMin: 540, endMin: 560 }], // only 20 min wide
      [],
      rangeMon,
    );
    expect(slots).toHaveLength(0);
  });

  it("ignores availability for other weekdays", () => {
    const slots = generateSlots(
      { durationMin: 30 },
      [{ weekday: 2, startMin: 540, endMin: 660 }], // Tuesday only
      [],
      rangeMon,
    );
    expect(slots).toHaveLength(0);
  });

  it("honors a custom grid step and endAt = start + durationMin", () => {
    const slots = generateSlots(
      { durationMin: 60 },
      [{ weekday: 1, startMin: 540, endMin: 720 }], // 09:00–12:00
      [],
      rangeMon,
      { stepMin: 60 },
    );
    expect(iso(slots)).toEqual(["09:00", "10:00", "11:00"]);
    expect(slots[0].end.toISOString()).toBe("2026-01-05T10:00:00.000Z");
  });

  it("filters slots outside the requested [from, to) range", () => {
    const slots = generateSlots(
      { durationMin: 30 },
      [{ weekday: 1, startMin: 540, endMin: 660 }],
      [],
      { from: day("09:30"), to: day("10:30") },
    );
    // from is inclusive, to is exclusive: 09:30, 10:00.
    expect(iso(slots)).toEqual(["09:30", "10:00"]);
  });
});
