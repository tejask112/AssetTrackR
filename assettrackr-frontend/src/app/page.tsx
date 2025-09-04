import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function page() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session");
  redirect(hasSession ? "/Home" : "/Welcome");
}