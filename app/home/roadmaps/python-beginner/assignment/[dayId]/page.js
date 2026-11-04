import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapAssignmentClient from '@/layout/LevelContent/RoadmapAssignmentClient';
import { pythonBeginnerRoadmapData } from '@/data/pythonBeginnerRoadmapData';

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
      title: 'Python Assignment | Ignitio',
    };
  }

  const dayId = parseResult.data;
  return {
    title: `Day Assignment (${dayId}) — Python for Beginners | Ignitio`,
    description: 'Complete the Python practical assignment and get graded by Kibo.',
    alternates: {
      canonical: `/home/roadmaps/python-beginner/assignment/${dayId}`,
    },
  };
}

export default async function PythonBeginnerAssignmentPage({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    notFound();
  }

  const dayId = parseResult.data;

  return (
    <RoadmapAssignmentClient
      roadmapSlug="python-beginner"
      initialRoadmapData={pythonBeginnerRoadmapData}
      dayId={dayId}
    />
  );
}

