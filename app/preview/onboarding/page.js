import PreviewOnboardingFlow from '@/features/onboarding/PreviewOnboardingFlow';

export const metadata = {
    title: "Get Started Free — Ignitio",
    description: "Start learning for free. No signup required. Experience Ignitio's interactive roadmaps and earn your first achievement.",
    robots: { index: false, follow: false },
};

export default function PreviewOnboardingPage() {
    return <PreviewOnboardingFlow />;
}
