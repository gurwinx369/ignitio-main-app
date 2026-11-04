import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapAssignmentClient from '@/layout/LevelContent/RoadmapAssignmentClient';
import { systemDesignRoadmapData } from '@/data/systemDesignData';

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
      title: 'System Design Assignment | Ignitio',
    };
  }

  const dayId = parseResult.data;
  return {
    title: `Day Assignment (${dayId}) — System Design | Ignitio`,
    description: 'Complete the System Design practical assignment and get graded by Kibo.',
    alternates: {
      canonical: `/home/roadmaps/system-design-fundamentals/assignment/${dayId}`,
    },
  };
}

export default async function SystemDesignAssignmentPage({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    notFound();
  }

  const dayId = parseResult.data;

  return (
    <RoadmapAssignmentClient
      roadmapSlug="system-design-fundamentals"
      initialRoadmapData={systemDesignRoadmapData}
      dayId={dayId}
    />
  );
}

