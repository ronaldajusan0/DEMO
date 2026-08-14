import { appName, tagline } from "@/lib/health";

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "3rem", maxWidth: 640 }}>
      <h1>{appName}</h1>
      <p>{tagline}</p>
      <p>Sprint 1 scaffold is live. Booking flow ships in Sprint 2.</p>
    </main>
  );
}
