// app/home/onboarding/page.js
import { redirect } from "next/navigation";

export default function OnboardingEntry() {
    redirect("/home/onboarding/diagnostic");
}