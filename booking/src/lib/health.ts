// Tiny pure module so the scaffold has something real to unit-test.
export const appName = "BookIt";
export const tagline = "Book appointments with providers.";

export function health(): { status: "ok"; app: string } {
  return { status: "ok", app: appName };
}
