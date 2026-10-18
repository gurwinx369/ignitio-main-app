import { redirect } from "next/navigation";

export default async function LoginRedirectPage({ searchParams }) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params || {}).toString();
  redirect(queryString ? `/auth/login?${queryString}` : "/auth/login");
}
