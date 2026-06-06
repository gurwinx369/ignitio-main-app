import SignupForm from "@/features/auth/components/SignupForm";

export const metadata = {
    title: "Sign Up",
    description: "Create an account on Ignitio to start learning C++, Git & GitHub, and Prompt Engineering with personalized roadmaps.",
    alternates: {
        canonical: "/auth/signup",
    },
    openGraph: {
        title: "Sign Up | Ignitio",
        description: "Create an account on Ignitio to start learning C++, Git & GitHub, and Prompt Engineering with personalized roadmaps.",
        url: "https://app.ignitio.cloud/auth/signup",
    },
};

export default function SignUpPage() {
    return <SignupForm />;
}
