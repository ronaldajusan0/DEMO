import { getService } from "@/lib/catalog/service";
import { prismaServiceRepo } from "@/lib/catalog/repo";
import { json, error } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const service = await getService(prismaServiceRepo, id);
  if (!service || !service.active) return error(404, "Service not found");
  return json({ service });
}
