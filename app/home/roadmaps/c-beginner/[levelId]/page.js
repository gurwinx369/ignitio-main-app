import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapLevelClient from '@/layout/LevelContent/RoadmapLevelClient';
import { clangBeginnerRoadmapData } from '@/data/clangBeginnerRoadmap';

const LevelIdParamSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid levelId format');

function findLevelById(levelId) {
  if (!levelId || !clangBeginnerRoadmapData?.days) return null;
  for (const day of clangBeginnerRoadmapData.days) {
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
      title: 'C Programming Lesson | Ignitio',
    };
  }

  const levelId = parseResult.data;
  const level = findLevelById(levelId);

  const title = level?.name || level?.title || 'Interactive Lesson';
  const description =
    level?.description ||
    'Master C programming fundamentals, pointers, memory, and algorithms.';

  return {
    title: `${title} — C Language Course | Ignitio`,
    description,
    alternates: {
      canonical: `/home/roadmaps/c-beginner/${levelId}`,
    },
    openGraph: {
      title: `${title} | Ignitio`,
      description,
      url: `https://app.ignitio.cloud/home/roadmaps/c-beginner/${levelId}`,
    },
  };
}

export default async function CLangLevelPage({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    notFound();
  }

  const levelId = parseResult.data;

  return (
    <RoadmapLevelClient
      roadmapSlug="c-beginner"
      initialRoadmapData={clangBeginnerRoadmapData}
      levelId={levelId}
    />
  );
}
