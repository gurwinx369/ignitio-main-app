import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapLevelClient from '@/layout/LevelContent/RoadmapLevelClient';
import {
  dsaRoadmapsByRole,
  getDsaRoadmapByRole,
  dsaStudentRoadmapData,
} from '@/data/dsa';

const LevelIdParamSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid levelId format');

function findLevelById(levelId) {
  if (!levelId) return null;
  const roadmaps = Object.values(dsaRoadmapsByRole);
  for (const r of roadmaps) {
    if (!r?.days) continue;
    for (const day of r.days) {
      const match = day.levels?.find((lvl) => lvl.id === levelId);
      if (match) return match;
    }
  }
  return null;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    return {
      title: 'DSA Lesson | Ignitio',
    };
  }

  const levelId = parseResult.data;
  const level = findLevelById(levelId);

  const title = level?.name || level?.title || 'Interactive Lesson';
  const description =
    level?.description ||
    'Master Data Structures and Algorithms with hands-on practice and guided videos.';

  return {
    title: `${title} — DSA Roadmap | Ignitio`,
    description,
    alternates: {
      canonical: `/home/roadmaps/dsa/${levelId}`,
    },
    openGraph: {
      title: `${title} | Ignitio`,
      description,
      url: `https://app.ignitio.cloud/home/roadmaps/dsa/${levelId}`,
    },
  };
}

export default async function DsaLevelPage({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    notFound();
  }

  const levelId = parseResult.data;

  return (
    <RoadmapLevelClient
      roadmapSlug="dsa"
      initialRoadmapData={dsaStudentRoadmapData}
      getRoadmapByRole={getDsaRoadmapByRole}
      levelId={levelId}
    />
  );
}
