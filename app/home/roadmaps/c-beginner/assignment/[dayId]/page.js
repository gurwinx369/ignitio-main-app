import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapAssignmentClient from '@/layout/LevelContent/RoadmapAssignmentClient';
import { clangBeginnerRoadmapData } from '@/data/clangBeginnerRoadmap';

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
      title: 'C Programming Assignment | Ignitio',
    };
  }

  const dayId = parseResult.data;
  return {
    title: `Day Assignment (${dayId}) — C Language Course | Ignitio`,
    description: 'Complete the C programming practical assignment and get graded by Kibo.',
    alternates: {
      canonical: `/home/roadmaps/c-beginner/assignment/${dayId}`,
    },
  };
}

export default async function CLangAssignmentPage({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    notFound();
  }

  const dayId = parseResult.data;

  return (
    <RoadmapAssignmentClient
      roadmapSlug="c-beginner"
      initialRoadmapData={clangBeginnerRoadmapData}
      dayId={dayId}
    />
  );
}

