import "server-only";

import { redirect } from "next/navigation";
import {
  getAuthorizationContext,
  hasAnyPermission,
  type Permission,
} from "@/lib/authorization";

export async function requirePagePermission(...permissions: Permission[]) {
  const authorization = await getAuthorizationContext();

  if (!authorization) redirect("/auth/login");
  if (!hasAnyPermission(authorization, permissions)) redirect("/panel");

  return authorization;
}
