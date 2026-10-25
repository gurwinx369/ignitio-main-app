import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapLevelClient from '@/layout/LevelContent/RoadmapLevelClient';
import { cppRoadmapData } from '@/data/cppCourseData';

const LevelIdParamSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid levelId format');

function findLevelById(levelId) {
  if (!levelId || !cppRoadmapData?.days) return null;
  for (const day of cppRoadmapData.days) {
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
      title: 'C++ Programming Lesson | Ignitio',
    };
  }

  const levelId = parseResult.data;
  const level = findLevelById(levelId);

  const title = level?.name || level?.title || 'Interactive Lesson';
  const description =
    level?.description ||
    'Master C++ fundamentals, OOP, memory management, and system design.';

  return {
    title: `${title} — C++ Programming | Ignitio`,
    description,
    alternates: {
      canonical: `/home/roadmaps/cpp/${levelId}`,
    },
    openGraph: {
      title: `${title} | Ignitio`,
      description,
      url: `https://app.ignitio.cloud/home/roadmaps/cpp/${levelId}`,
    },
  };
}

export default async function CppLevelPage({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    notFound();
  }

  const levelId = parseResult.data;

  return (
    <RoadmapLevelClient
      roadmapSlug="cpp"
      initialRoadmapData={cppRoadmapData}
      levelId={levelId}
    />
  );
}
