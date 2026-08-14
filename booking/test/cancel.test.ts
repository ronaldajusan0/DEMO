import { describe, it, expect } from "vitest";
import {
  cancelAppointment,
  CancelError,
  type CancelRepo,
} from "../src/lib/booking/cancel";
import type { AppointmentRecord } from "../src/lib/booking/service";

function appt(over: Partial<AppointmentRecord> = {}): AppointmentRecord {
  return {
    id: "a1",
    serviceId: "s1",
    customerId: "c1",
    providerId: "p1",
    startAt: new Date("2026-01-10T09:00:00.000Z"),
    endAt: new Date("2026-01-10T09:30:00.000Z"),
    status: "CONFIRMED",
    ...over,
  };
}

function fakeRepo(initial: AppointmentRecord): CancelRepo & { row: AppointmentRecord } {
  const state = { row: initial };
  return {
    get row() {
      return state.row;
    },
    async getById(id) {
      return id === state.row.id ? state.row : null;
    },
    async cancel(id) {
      if (id !== state.row.id) throw new Error("missing");
      state.row = { ...state.row, status: "CANCELLED" };
      return state.row;
    },
  };
}

const owner = { id: "c1", role: "CUSTOMER" as const };
const now = new Date("2026-01-01T00:00:00.000Z"); // 9 days before start

describe("cancelAppointment", () => {
  it("owner cancels a future appointment and frees the slot", async () => {
    const repo = fakeRepo(appt());
    const out = await cancelAppointment(repo, owner, "a1", now);
    expect(out.status).toBe("CANCELLED");
    expect(repo.row.status).toBe("CANCELLED");
  });

  it("rejects a non-owner with FORBIDDEN", async () => {
    const repo = fakeRepo(appt());
    await expect(
      cancelAppointment(repo, { id: "c2", role: "CUSTOMER" }, "a1", now),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(repo.row.status).toBe("CONFIRMED");
  });

  it("blocks cancellation within 24h of start (403 → TOO_LATE)", async () => {
    const repo = fakeRepo(appt());
    // 23h59m before start
    const late = new Date("2026-01-09T09:01:00.000Z");
    await expect(cancelAppointment(repo, owner, "a1", late)).rejects.toMatchObject({
      code: "TOO_LATE",
    });
  });

  it("allows cancellation at exactly 24h before start", async () => {
    const repo = fakeRepo(appt());
    const exactly = new Date("2026-01-09T09:00:00.000Z"); // 24h out
    const out = await cancelAppointment(repo, owner, "a1", exactly);
    expect(out.status).toBe("CANCELLED");
  });

  it("404 for a missing appointment", async () => {
    const repo = fakeRepo(appt());
    await expect(cancelAppointment(repo, owner, "nope", now)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects double-cancel", async () => {
    const repo = fakeRepo(appt({ status: "CANCELLED" }));
    await expect(cancelAppointment(repo, owner, "a1", now)).rejects.toBeInstanceOf(
      CancelError,
    );
  });
});
