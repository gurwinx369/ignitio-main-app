import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapLevelClient from '@/layout/LevelContent/RoadmapLevelClient';
import { systemDesignRoadmapData } from '@/data/systemDesignData';

const LevelIdParamSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid levelId format');

function findLevelById(levelId) {
  if (!levelId || !systemDesignRoadmapData?.days) return null;
  for (const day of systemDesignRoadmapData.days) {
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
      title: 'System Design Lesson | Ignitio',
    };
  }

  const levelId = parseResult.data;
  const level = findLevelById(levelId);

  const title = level?.name || level?.title || 'Interactive Lesson';
  const description =
    level?.description ||
    'Master System Design concepts, scalability, databases, caching, and distributed architecture.';

  return {
    title: `${title} — System Design | Ignitio`,
    description,
    alternates: {
      canonical: `/home/roadmaps/system-design-fundamentals/${levelId}`,
    },
    openGraph: {
      title: `${title} | Ignitio`,
      description,
      url: `https://app.ignitio.cloud/home/roadmaps/system-design-fundamentals/${levelId}`,
    },
  };
}

export default async function SystemDesignLevelPage({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    notFound();
  }

  const levelId = parseResult.data;

  return (
    <RoadmapLevelClient
      roadmapSlug="system-design-fundamentals"
      initialRoadmapData={systemDesignRoadmapData}
      levelId={levelId}
    />
  );
}
