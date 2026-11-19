"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "@/features/context/AuthContext";
import DashboardBottomNav from "@/features/dashboard/components/DashboardBottomNav";
import ProjectCard from "./ProjectCard";
import { Sparkles, Terminal, Code2, FolderGit2 } from "lucide-react";

const TRACKS = [
  { id: "all", label: "All Projects" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "c", label: "C Language" },
  { id: "dsa", label: "DSA" },
  { id: "web", label: "Web Dev" },
];

export default function ProjectsCatalog() {
  const { user } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState("all");

  // Fetcher using Firebase ID Token
  const fetcher = async (url) => {
    let headers = {};
    if (user && user.getIdToken) {
      try {
        const token = await user.getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        console.warn("[ProjectsCatalog] Token fetch error:", e);
      }
    }
    const res = await fetch(url, { headers });
    const json = await res.json();
    return json?.data || [];
  };

  // High performance SWR caching: loads once, serves from cache with 0ms delay
  const { data: allProjects = [], isLoading, error } = useSWR(
    "/api/v2/projects",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // Instant in-memory filtering (0ms latency, zero screen flicker)
  const filteredProjects = useMemo(() => {
    if (selectedTrack === "all") return allProjects;
    return allProjects.filter((p) => p.track === selectedTrack);
  }, [allProjects, selectedTrack]);

  return (
    <div className="min-h-screen bg-[#FCF5EE] pb-28 text-[#19183B]">
      {/* ── HEADER & HERO BANNER ── */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10">
        <div
          className="relative overflow-hidden rounded-[24px] p-6 sm:p-8"
          style={{
            background: "#F2E0D0",
            border: "1px solid #DFC8B5",
            boxShadow: "0 5px 10px rgba(25,24,59,0.06)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00A9FF]/15 px-3 py-1 text-xs font-black text-[#0085C7] uppercase tracking-wide">
                <Code2 className="h-3.5 w-3.5" />
                <span>Capstone Arenas</span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-[#19183B]">
                Guided Projects & Coding Arenas
              </h1>

              <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-[#19183B]/75">
                Graduate from watching tutorials to building software. Decomposed into bite-sized milestones with in-browser execution and instant automated verification.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A9FF] text-white shadow-[0_4px_0_#0085C7] transition-transform active:scale-95"
              >
                <Terminal className="h-7 w-7 text-[#19183B]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── TRACK FILTER TABS (INSTANT 0ms SWITCHING) ── */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {TRACKS.map((t) => {
            const isSelected = selectedTrack === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrack(t.id)}
                className={`rounded-[14px] px-4 py-2 text-xs font-extrabold transition-all duration-150 ${
                  isSelected
                    ? "bg-[#00A9FF] text-white shadow-[0_3px_0_#0085C7] translate-y-[-1px]"
                    : "bg-[#F2E0D0] text-[#19183B] hover:bg-[#FCEBDC] border border-[#DFC8B5]"
                } active:translate-y-[1px]`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── PROJECTS CARDS GRID ── */}
      <section className="mx-auto max-w-6xl px-4 mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[520px] animate-pulse rounded-[24px] bg-[#F2E0D0]/70 border border-[#DFC8B5]"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            className="rounded-[24px] p-12 text-center"
            style={{
              background: "#F2E0D0",
              border: "1px solid #DFC8B5",
            }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-2xl shadow-inner">
              ⚡
            </div>
            <h3 className="mt-4 text-base font-black text-[#19183B]">No Projects in this Track Yet</h3>
            <p className="mt-1 text-xs font-medium text-[#19183B]/60">
              New scaffolded missions for this track are rolling out shortly. Select another track above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* ── PERSISTENT BOTTOM NAV ── */}
      <DashboardBottomNav />
    </div>
  );
}
