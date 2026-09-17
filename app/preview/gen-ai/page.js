import PreviewGenAiFlow from "@/features/onboarding/diagnostic/PreviewGenAiFlow";

export const metadata = {
  title: "Gen AI Assessment — Ignitio",
  description: "Test your skills and get a personalized Gen AI roadmap.",
  robots: { index: false, follow: false },
};

export default function GenAiPreviewPage() {
  return <PreviewGenAiFlow />;
}
