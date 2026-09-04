import Dashboard from "@/features/dashboard/components/Dashboard";

export const metadata = {
  title: "Dashboard Preview — Ignitio",
  description: "View roadmaps and preview courses without signup.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/preview/home",
  },
  openGraph: {
    title: "Dashboard Preview | Ignitio",
    description: "View roadmaps and preview courses without signup.",
    url: "https://app.ignitio.cloud/preview/home",
  },
};

export default function PreviewHomePage() {
  return <Dashboard isPreview={true} />;
}
