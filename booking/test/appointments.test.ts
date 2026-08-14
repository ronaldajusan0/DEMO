import { describe, it, expect, vi } from "vitest";
import {
  listMyAppointments,
  splitByTime,
  type MyAppointmentsRepo,
  type MyAppointment,
} from "../src/lib/appointments/service";
import {
  sendBookingConfirmation,
  buildConfirmationEmail,
} from "../src/lib/email/confirmation";
import type { EmailSender } from "../src/lib/email/sender";

const rows: MyAppointment[] = [
  {
    id: "a1",
    serviceName: "Haircut",
    startAt: new Date("2026-02-01T10:00:00.000Z"),
    endAt: new Date("2026-02-01T10:30:00.000Z"),
    status: "CONFIRMED",
  },
  {
    id: "a2",
    serviceName: "Consult",
    startAt: new Date("2025-12-01T10:00:00.000Z"),
    endAt: new Date("2025-12-01T10:30:00.000Z"),
    status: "CONFIRMED",
  },
];

describe("my appointments", () => {
  it("returns only the caller's appointments", async () => {
    const repo: MyAppointmentsRepo = {
      async listForCustomer(id) {
        expect(id).toBe("c1"); // scoped to caller
        return rows;
      },
    };
    const out = await listMyAppointments(repo, "c1");
    expect(out).toHaveLength(2);
  });

  it("splits upcoming vs past around now", () => {
    const { upcoming, past } = splitByTime(rows, new Date("2026-01-01T00:00:00.000Z"));
    expect(upcoming.map((a) => a.id)).toEqual(["a1"]);
    expect(past.map((a) => a.id)).toEqual(["a2"]);
  });
});

describe("confirmation email", () => {
  const data = {
    to: "amy@example.com",
    customerName: "Amy",
    serviceName: "Haircut",
    startAt: new Date("2026-02-01T10:00:00.000Z"),
    endAt: new Date("2026-02-01T10:30:00.000Z"),
  };

  it("builds a message addressed to the customer with the booking details", () => {
    const msg = buildConfirmationEmail(data);
    expect(msg.to).toBe("amy@example.com");
    expect(msg.subject).toContain("Haircut");
    expect(msg.body).toContain("Amy");
    expect(msg.body).toContain("2026-02-01T10:00:00.000Z");
  });

  it("calls the injected sender with the confirmation message", async () => {
    const sender: EmailSender = { send: vi.fn().mockResolvedValue(undefined) };
    const msg = await sendBookingConfirmation(sender, data);
    expect(sender.send).toHaveBeenCalledTimes(1);
    expect(sender.send).toHaveBeenCalledWith(msg);
    expect(msg.to).toBe("amy@example.com");
  });
});
