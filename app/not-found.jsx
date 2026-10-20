import KiboNotFound from "@/features/kyle/not-found/KiboNotFound";

export const metadata = {
  title: "404 - Page Not Found | Ignitio",
  description: "The page you are looking for has moved or does not exist.",
};

export default function NotFound() {
  return <KiboNotFound />;
}
