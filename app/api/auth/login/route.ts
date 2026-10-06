import { createSession, readCredentials, serverError, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const { username, password } = await readCredentials(request);

  try {
    const [user] = await query<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE username = $1",
      [username],
    );
    if (!user || !verifyPassword(password, user.password_hash)) {
      return Response.json({ error: "Username atau password salah." }, { status: 401 });
    }
    await createSession(username);
    return Response.json({ username });
  } catch (error) {
    return serverError(error);
  }
}
