import { describe, it, expect } from "vitest";
import {
  bookAppointment,
  BookingError,
  type BookingRepo,
  type AppointmentRecord,
  type BookingServiceRecord,
} from "../src/lib/booking/service";

// Fake repo. createIfFree runs its overlap check + insert synchronously (no
// await gap), mirroring the atomicity of the real Serializable transaction —
// so two concurrent bookings of the same slot cannot both succeed.
function fakeRepo(
  service: BookingServiceRecord,
  availability = [{ weekday: 1, startMin: 540, endMin: 660 }], // Mon 09:00–11:00
): BookingRepo & { rows: AppointmentRecord[] } {
  const rows: AppointmentRecord[] = [];
  let seq = 0;
  return {
    rows,
    async getService(id) {
      return id === service.id ? service : null;
    },
    async listAvailability() {
      return availability;
    },
    createIfFree(data) {
      const clash = rows.some(
        (r) =>
          r.status === "CONFIRMED" &&
          r.providerId === data.providerId &&
          data.startAt < r.endAt &&
          r.startAt < data.endAt,
      );
      if (clash) return Promise.resolve(null);
      const rec: AppointmentRecord = { id: `a${++seq}`, status: "CONFIRMED", ...data };
      rows.push(rec);
      return Promise.resolve(rec);
    },
  };
}

const service: BookingServiceRecord = {
  id: "s1",
  providerId: "p1",
  durationMin: 30,
  active: true,
};
const customer = { id: "c1", role: "CUSTOMER" as const };
// Monday 09:00 UTC — a valid grid slot inside the window.
const validStart = "2026-01-05T09:00:00.000Z";

describe("bookAppointment", () => {
  it("books a free slot and returns CONFIRMED (201-path)", async () => {
    const repo = fakeRepo(service);
    const appt = await bookAppointment(repo, customer, {
      serviceId: "s1",
      start: validStart,
    });
    expect(appt.status).toBe("CONFIRMED");
    expect(appt.customerId).toBe("c1");
    expect(appt.endAt.toISOString()).toBe("2026-01-05T09:30:00.000Z");
  });

  it("rejects a non-customer with FORBIDDEN", async () => {
    const repo = fakeRepo(service);
    await expect(
      bookAppointment(repo, { id: "p1", role: "PROVIDER" }, {
        serviceId: "s1",
        start: validStart,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an arbitrary (non-grid / out-of-window) time", async () => {
    const repo = fakeRepo(service);
    await expect(
      bookAppointment(repo, customer, {
        serviceId: "s1",
        start: "2026-01-05T09:07:00.000Z", // off-grid
      }),
    ).rejects.toMatchObject({ code: "INVALID_SLOT" });
    await expect(
      bookAppointment(repo, customer, {
        serviceId: "s1",
        start: "2026-01-06T09:00:00.000Z", // Tuesday, no availability
      }),
    ).rejects.toMatchObject({ code: "INVALID_SLOT" });
  });

  it("returns CONFLICT on a second booking of the same slot", async () => {
    const repo = fakeRepo(service);
    await bookAppointment(repo, customer, { serviceId: "s1", start: validStart });
    await expect(
      bookAppointment(repo, { id: "c2", role: "CUSTOMER" }, {
        serviceId: "s1",
        start: validStart,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("lets exactly one of two concurrent bookings win", async () => {
    const repo = fakeRepo(service);
    const results = await Promise.allSettled([
      bookAppointment(repo, customer, { serviceId: "s1", start: validStart }),
      bookAppointment(repo, { id: "c2", role: "CUSTOMER" }, {
        serviceId: "s1",
        start: validStart,
      }),
    ]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter(
      (r) => r.status === "rejected" && (r.reason as BookingError).code === "CONFLICT",
    );
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(repo.rows).toHaveLength(1);
  });
});
