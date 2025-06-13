import { addGlobalMemory } from "@/lib/actions/user";
import { auth } from "@/lib/authOptions";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const res = await addGlobalMemory(
    `User's name is ${session.user.name}. User's email is ${session.user.email}. User's avatar is ${session.user.avatar}.`
  )
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
