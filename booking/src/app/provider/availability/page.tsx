import { redirect } from "next/navigation";
import { requireRole, AuthzError } from "@/lib/auth/guard";
import { prismaAvailabilityRepo } from "@/lib/availability/repo";
import { AvailabilityEditor } from "./AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function ProviderAvailabilityPage() {
  let session;
  try {
    session = await requireRole("PROVIDER");
  } catch (e) {
    if (e instanceof AuthzError) redirect("/login");
    throw e;
  }

  const initial = await prismaAvailabilityRepo.listForProvider(session.uid);

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
      <h1>Weekly availability</h1>
      <p>Set the windows customers can book within. Times are provider-local.</p>
      <AvailabilityEditor initial={initial} />
    </main>
  );
}
