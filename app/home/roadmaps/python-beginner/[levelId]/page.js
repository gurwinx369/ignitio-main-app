import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapLevelClient from '@/layout/LevelContent/RoadmapLevelClient';
import { pythonBeginnerRoadmapData } from '@/data/pythonBeginnerRoadmapData';

const LevelIdParamSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid levelId format');

function findLevelById(levelId) {
  if (!levelId || !pythonBeginnerRoadmapData?.days) return null;
  for (const day of pythonBeginnerRoadmapData.days) {
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
      title: 'Python Lesson | Ignitio',
    };
  }

  const levelId = parseResult.data;
  const level = findLevelById(levelId);

  const title = level?.name || level?.title || 'Interactive Lesson';
  const description =
    level?.description ||
    'Master Python fundamentals, problem-solving, and practical applications.';

  return {
    title: `${title} — Python for Beginners | Ignitio`,
    description,
    alternates: {
      canonical: `/home/roadmaps/python-beginner/${levelId}`,
    },
    openGraph: {
      title: `${title} | Ignitio`,
      description,
      url: `https://app.ignitio.cloud/home/roadmaps/python-beginner/${levelId}`,
    },
  };
}

export default async function PythonBeginnerLevelPage({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    notFound();
  }

  const levelId = parseResult.data;

  return (
    <RoadmapLevelClient
      roadmapSlug="python-beginner"
      initialRoadmapData={pythonBeginnerRoadmapData}
      levelId={levelId}
    />
  );
}
