import { redirect } from "next/navigation";
import { requireRole, AuthzError } from "@/lib/auth/guard";
import { prismaMyAppointmentsRepo } from "@/lib/appointments/repo";
import { listMyAppointments, splitByTime } from "@/lib/appointments/service";
import type { MyAppointment } from "@/lib/appointments/service";
import { CancelButton } from "./CancelButton";

export const dynamic = "force-dynamic";

function Row({ a }: { a: MyAppointment }) {
  return (
    <li>
      <strong>{a.serviceName}</strong> — {a.startAt.toISOString()} [{a.status}]
      {a.status === "CONFIRMED" ? (
        <>
          {" "}
          <CancelButton id={a.id} />
        </>
      ) : null}
    </li>
  );
}

export default async function MyBookingsPage() {
  let session;
  try {
    session = await requireRole("CUSTOMER");
  } catch (e) {
    if (e instanceof AuthzError) redirect("/login");
    throw e;
  }

  const all = await listMyAppointments(prismaMyAppointmentsRepo, session.uid);
  const { upcoming, past } = splitByTime(all, new Date());

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
      <h1>My bookings</h1>

      <h2>Upcoming</h2>
      {upcoming.length === 0 ? (
        <p>No upcoming bookings.</p>
      ) : (
        <ul>
          {upcoming.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </ul>
      )}

      <h2>Past</h2>
      {past.length === 0 ? (
        <p>No past bookings.</p>
      ) : (
        <ul>
          {past.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </ul>
      )}
    </main>
  );
}
