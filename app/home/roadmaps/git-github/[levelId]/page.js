import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapLevelClient from '@/layout/LevelContent/RoadmapLevelClient';
import { gitGithubRoadmapData } from '@/data/gitGithubCourseData';

const LevelIdParamSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid levelId format');

function findLevelById(levelId) {
  if (!levelId || !gitGithubRoadmapData?.days) return null;
  for (const day of gitGithubRoadmapData.days) {
    const match = day.levels?.find((lvl) => lvl.id === levelId);
    if (match) return match;
  }
  return null;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    return {
      title: 'Git & GitHub Lesson | Ignitio',
    };
  }

  const levelId = parseResult.data;
  const level = findLevelById(levelId);

  const title = level?.name || level?.title || 'Interactive Lesson';
  const description =
    level?.description ||
    'Master Git & GitHub fundamentals, workflows, and collaboration.';

  return {
    title: `${title} — Git & GitHub | Ignitio`,
    description,
    alternates: {
      canonical: `/home/roadmaps/git-github/${levelId}`,
    },
    openGraph: {
      title: `${title} | Ignitio`,
      description,
      url: `https://app.ignitio.cloud/home/roadmaps/git-github/${levelId}`,
    },
  };
}

export default async function GitGithubLevelPage({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    notFound();
  }

  const levelId = parseResult.data;

  return (
    <RoadmapLevelClient
      roadmapSlug="git-github"
      initialRoadmapData={gitGithubRoadmapData}
      levelId={levelId}
    />
  );
}
