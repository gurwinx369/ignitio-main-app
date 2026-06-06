import Dashboard from "@/features/dashboard/components/Dashboard";

export const metadata = {
  title: "Dashboard",
  description: "Manage your courses, view progress, and access customized programming roadmaps on Ignitio.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/home",
  },
  openGraph: {
    title: "Dashboard | Ignitio",
    description: "Manage your courses, view progress, and access customized programming roadmaps on Ignitio.",
    url: "https://app.ignitio.cloud/home",
  },
};

export default function HomePage() {
  return <Dashboard />;
}
