// Read model for a customer's own appointments. Ownership is enforced by
// scoping every query to the acting customer's id (never the client).
export interface MyAppointment {
  id: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
  status: "CONFIRMED" | "CANCELLED";
}

export interface MyAppointmentsRepo {
  listForCustomer(customerId: string): Promise<MyAppointment[]>;
}

export function listMyAppointments(repo: MyAppointmentsRepo, customerId: string) {
  return repo.listForCustomer(customerId);
}

// Split into upcoming vs past relative to `now` (page/UI concern kept pure).
export function splitByTime(appointments: MyAppointment[], now: Date) {
  const upcoming: MyAppointment[] = [];
  const past: MyAppointment[] = [];
  for (const a of appointments) {
    (a.startAt.getTime() >= now.getTime() ? upcoming : past).push(a);
  }
  upcoming.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  past.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
  return { upcoming, past };
}
