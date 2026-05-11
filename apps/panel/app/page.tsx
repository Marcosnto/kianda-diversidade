import { auth0 } from "@/lib/auth0";
import { Button } from "@workspace/ui/components/button";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <><h1 className="text-2xl font-bold">Kianda Diversidade</h1></>
  );
}
