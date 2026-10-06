import { ping } from "@/lib/db";

export const dynamic = "force-dynamic";

// Status aplikasi tetap "ok" walau database mati, supaya dua masalah itu bisa dibedakan.
export async function GET() {
  const db = await ping().then(
    () => "ok",
    () => "down",
  );
  return Response.json({ status: "ok", db, uptime: Math.round(process.uptime()) });
}
