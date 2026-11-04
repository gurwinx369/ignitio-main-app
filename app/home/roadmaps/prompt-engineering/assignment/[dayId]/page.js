import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapAssignmentClient from '@/layout/LevelContent/RoadmapAssignmentClient';
import { promptEngineeringRoadmapData, promptEngineeringRoadmapsByRole } from '@/data/promptEngineering';

const DayIdParamSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid dayId format');

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    return {
      title: 'Prompt Engineering Assignment | Ignitio',
    };
  }

  const dayId = parseResult.data;
  return {
    title: `Day Assignment (${dayId}) — Prompt Engineering | Ignitio`,
    description: 'Complete the Prompt Engineering practical assignment and get graded by Kibo.',
    alternates: {
      canonical: `/home/roadmaps/prompt-engineering/assignment/${dayId}`,
    },
  };
}

export default async function PromptEngineeringAssignmentPage({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    notFound();
  }

  const dayId = parseResult.data;

  return (
    <RoadmapAssignmentClient
      roadmapSlug="prompt-engineering"
      initialRoadmapData={promptEngineeringRoadmapData}
      roadmapsByRole={promptEngineeringRoadmapsByRole}
      dayId={dayId}
    />
  );
}

