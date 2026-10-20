import { redirect } from "next/navigation";

export default async function SignupRedirectPage({ searchParams }) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params || {}).toString();
  redirect(queryString ? `/auth/signup?${queryString}` : "/auth/signup");
}
