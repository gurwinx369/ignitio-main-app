import LoginForm from "@/features/auth/components/LoginForm";

export const metadata = {
    title: "Login",
    description: "Access your account to resume your interactive technology roadmaps on Ignitio.",
    alternates: {
        canonical: "/auth/login",
    },
    openGraph: {
        title: "Login | Ignitio",
        description: "Access your account to resume your interactive technology roadmaps on Ignitio.",
        url: "https://app.ignitio.cloud/auth/login",
    },
};

export default function LoginPage() {
    return <LoginForm />;
}
