import { createSession, hashPassword, readCredentials, serverError } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const { username, password } = await readCredentials(request);

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return Response.json(
      { error: "Username 3–20 karakter: huruf, angka, atau garis bawah." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return Response.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }

  try {
    const rows = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING id",
      [username, hashPassword(password)],
    );
    if (rows.length === 0) {
      return Response.json({ error: "Username sudah dipakai." }, { status: 409 });
    }
    await createSession(username);
    return Response.json({ username }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
