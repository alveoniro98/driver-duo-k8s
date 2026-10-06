import { getSessionUser } from "@/lib/auth";

export async function GET() {
  return Response.json({ username: await getSessionUser() });
}
