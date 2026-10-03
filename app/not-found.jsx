import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F2E0D0] px-4 font-sans text-center">
      <div className="relative mb-6">
        <h1 className="text-9xl font-black text-[#19183B] opacity-10">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-extrabold text-[#00A9FF]">Oops!</span>
        </div>
      </div>
      <h2 className="mb-4 text-2xl font-bold text-[#19183B]">Page Not Found</h2>
      <p className="mb-8 max-w-md text-[#19183B]/70">
        We couldn't find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link
        href="/home"
        className="flex items-center gap-2 rounded-full bg-[#19183B] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#19183B]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9FF] focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Dashboard
      </Link>
    </div>
  );
}
