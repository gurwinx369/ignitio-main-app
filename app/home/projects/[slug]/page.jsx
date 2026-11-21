import ProjectWorkspace from "@/features/projects/components/ProjectWorkspace";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle || "Project Workspace"} | Ignitio`,
    description: "In-browser coding workspace with instant automated feedback and graduated hints.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ProjectSlugPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  return <ProjectWorkspace slug={slug} />;
}
