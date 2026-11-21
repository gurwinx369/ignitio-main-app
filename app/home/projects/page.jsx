import ProjectsCatalog from "@/features/projects/components/ProjectsCatalog";

export const metadata = {
  title: "Projects Hub | Ignitio",
  description: "Build real programming projects in your browser with step-by-step guidance and instant feedback.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/home/projects",
  },
};

export default function ProjectsPage() {
  return <ProjectsCatalog />;
}
