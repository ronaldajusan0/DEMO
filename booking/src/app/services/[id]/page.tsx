import Link from "next/link";
import { notFound } from "next/navigation";
import { prismaServiceRepo } from "@/lib/catalog/repo";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prismaServiceRepo.findById(id);
  if (!service || !service.active) notFound();

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
      <p>
        <Link href="/services">← All services</Link>
      </p>
      <h1>{service.name}</h1>
      <p>
        {service.category} · {service.durationMin} min
      </p>
      {service.description ? <p>{service.description}</p> : null}
      {/* Available slots + booking arrive in Sprint 2. */}
    </main>
  );
}
