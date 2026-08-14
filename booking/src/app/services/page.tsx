import Link from "next/link";
import { prismaServiceRepo } from "@/lib/catalog/repo";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const services = await prismaServiceRepo.list({ category });

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
      <h1>Services</h1>
      {category ? <p>Filtered by category: {category}</p> : null}
      {services.length === 0 ? (
        <p>No services yet.</p>
      ) : (
        <ul>
          {services.map((s) => (
            <li key={s.id}>
              <Link href={`/services/${s.id}`}>{s.name}</Link> — {s.category} (
              {s.durationMin} min)
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
