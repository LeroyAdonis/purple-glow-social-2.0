import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  // Pass session data to client component
  return (
    <DashboardClient 
      userName={session.user.name || "User"}
      userEmail={session.user.email}
      userImage={session.user.image}
      userId={session.user.id}
    />
  );
}