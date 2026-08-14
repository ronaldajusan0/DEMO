import { describe, it, expect } from "vitest";
import {
  createService,
  listServices,
  CatalogError,
  type ServiceRepo,
  type ServiceRecord,
} from "../src/lib/catalog/service";

function fakeRepo(): ServiceRepo & { rows: ServiceRecord[] } {
  const rows: ServiceRecord[] = [];
  return {
    rows,
    async list({ category }) {
      return rows.filter((r) => r.active && (!category || r.category === category));
    },
    async findById(id) {
      return rows.find((r) => r.id === id) ?? null;
    },
    async create(data) {
      const rec: ServiceRecord = { id: `s${rows.length + 1}`, ...data };
      rows.push(rec);
      return rec;
    },
  };
}

const provider = { id: "p1", role: "PROVIDER" as const };
const customer = { id: "c1", role: "CUSTOMER" as const };
const validInput = {
  name: "Haircut",
  category: "beauty",
  durationMin: 30,
  description: "A trim",
};

describe("createService authorization", () => {
  it("allows a provider to create", async () => {
    const repo = fakeRepo();
    const s = await createService(repo, provider, validInput);
    expect(s.providerId).toBe("p1");
    expect(s.active).toBe(true);
  });

  it("rejects a customer with FORBIDDEN", async () => {
    const repo = fakeRepo();
    await expect(createService(repo, customer, validInput)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(repo.rows).toHaveLength(0);
  });

  it("rejects an admin (create is provider-only)", async () => {
    const repo = fakeRepo();
    await expect(
      createService(repo, { id: "a1", role: "ADMIN" }, validInput),
    ).rejects.toBeInstanceOf(CatalogError);
  });

  it("rejects invalid input", async () => {
    const repo = fakeRepo();
    await expect(
      createService(repo, provider, { name: "", category: "x", durationMin: 30 }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(
      createService(repo, provider, { name: "X", category: "x", durationMin: 1 }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
});

describe("listServices filtering", () => {
  it("filters by category and hides inactive", async () => {
    const repo = fakeRepo();
    await createService(repo, provider, { ...validInput, category: "beauty" });
    await createService(repo, provider, { ...validInput, category: "dental" });
    repo.rows[1].active = false;

    expect(await listServices(repo, {})).toHaveLength(1);
    expect(await listServices(repo, { category: "beauty" })).toHaveLength(1);
    expect(await listServices(repo, { category: "dental" })).toHaveLength(0);
  });
});
