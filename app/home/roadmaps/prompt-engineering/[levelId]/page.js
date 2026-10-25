import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import PromptEngineeringLevelClient from '@/features/roadmaps/PromptEngineering/components/PromptEngineeringLevelClient';
import {
  promptEngineeringRoadmapsByRole,
  promptEngineeringRoadmapData,
} from '@/data/promptEngineering';

// Input validation schema adhering to /backend-security-coder and /api-design-principles
const LevelIdParamSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid levelId format');

function findLevelById(levelId) {
  if (!levelId) return null;
  const roadmaps = Object.values(promptEngineeringRoadmapsByRole);
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
      title: 'Prompt Engineering Lesson | Ignitio',
    };
  }

  const levelId = parseResult.data;
  const level = findLevelById(levelId);

  const title = level?.name || level?.title || 'Interactive Lesson';
  const description =
    level?.description ||
    'Master Generative AI and Prompt Engineering with hands-on labs and AI feedback.';

  return {
    title: `${title} — Prompt Engineering | Ignitio`,
    description,
    alternates: {
      canonical: `/home/roadmaps/prompt-engineering/${levelId}`,
    },
    openGraph: {
      title: `${title} | Ignitio`,
      description,
      url: `https://app.ignitio.cloud/home/roadmaps/prompt-engineering/${levelId}`,
    },
  };
}

export default async function PromptEngineeringLevelPage({ params }) {
  const resolvedParams = await params;
  const parseResult = LevelIdParamSchema.safeParse(resolvedParams?.levelId);

  if (!parseResult.success) {
    notFound();
  }

  const levelId = parseResult.data;

  return <PromptEngineeringLevelClient levelId={levelId} />;
}
