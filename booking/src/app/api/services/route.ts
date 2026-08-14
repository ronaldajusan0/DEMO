import {
  listServices,
  createService,
  CatalogError,
} from "@/lib/catalog/service";
import { prismaServiceRepo } from "@/lib/catalog/repo";
import { serviceQuerySchema } from "@/lib/validation/service";
import { requireRole, AuthzError } from "@/lib/auth/guard";
import { json, error } from "@/lib/http";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = serviceQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) return error(400, "Invalid query");
  const services = await listServices(prismaServiceRepo, parsed.data);
  return json({ services });
}

export async function POST(req: Request): Promise<Response> {
  let session;
  try {
    session = await requireRole("PROVIDER");
  } catch (e) {
    if (e instanceof AuthzError) return error(e.status, e.message);
    return error(500, "Auth check failed");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error(400, "Invalid JSON body");
  }

  try {
    const service = await createService(
      prismaServiceRepo,
      { id: session.uid, role: session.role },
      body,
    );
    return json({ service }, 201);
  } catch (e) {
    if (e instanceof CatalogError) {
      return error(e.code === "FORBIDDEN" ? 403 : 400, e.message);
    }
    return error(500, "Create service failed");
  }
}
