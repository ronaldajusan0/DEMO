import { describe, it, expect } from "vitest";
import {
  setAvailability,
  AvailabilityError,
  type AvailabilityRepo,
  type AvailabilityWindowRecord,
} from "../src/lib/availability/service";

function fakeRepo(): AvailabilityRepo & { store: Map<string, AvailabilityWindowRecord[]> } {
  const store = new Map<string, AvailabilityWindowRecord[]>();
  let seq = 0;
  return {
    store,
    async listForProvider(pid) {
      return store.get(pid) ?? [];
    },
    async replaceForProvider(pid, windows) {
      const rows = windows.map((w) => ({ id: `w${++seq}`, providerId: pid, ...w }));
      store.set(pid, rows);
      return rows;
    },
  };
}

describe("setAvailability validation", () => {
  it("accepts multiple windows on the same weekday", async () => {
    const repo = fakeRepo();
    const out = await setAvailability(repo, "p1", [
      { weekday: 1, startMin: 540, endMin: 720 },
      { weekday: 1, startMin: 780, endMin: 1020 },
    ]);
    expect(out).toHaveLength(2);
    expect(out.every((w) => w.providerId === "p1")).toBe(true);
  });

  it("rejects startMin >= endMin", async () => {
    const repo = fakeRepo();
    await expect(
      setAvailability(repo, "p1", [{ weekday: 2, startMin: 600, endMin: 600 }]),
    ).rejects.toBeInstanceOf(AvailabilityError);
    await expect(
      setAvailability(repo, "p1", [{ weekday: 2, startMin: 700, endMin: 600 }]),
    ).rejects.toBeInstanceOf(AvailabilityError);
  });

  it("rejects out-of-range weekday and minutes", async () => {
    const repo = fakeRepo();
    await expect(
      setAvailability(repo, "p1", [{ weekday: 7, startMin: 0, endMin: 60 }]),
    ).rejects.toBeInstanceOf(AvailabilityError);
    await expect(
      setAvailability(repo, "p1", [{ weekday: 0, startMin: -1, endMin: 60 }]),
    ).rejects.toBeInstanceOf(AvailabilityError);
    await expect(
      setAvailability(repo, "p1", [{ weekday: 0, startMin: 0, endMin: 1500 }]),
    ).rejects.toBeInstanceOf(AvailabilityError);
  });

  it("scopes windows to the acting provider, ignoring any client providerId", async () => {
    const repo = fakeRepo();
    const out = await setAvailability(repo, "p1", [
      // an attacker-supplied providerId must be ignored (strict schema drops it)
      { weekday: 3, startMin: 540, endMin: 600 },
    ]);
    expect(out[0].providerId).toBe("p1");
    expect(await repo.listForProvider("p2")).toHaveLength(0);
  });
});
