import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapAssignmentClient from '@/layout/LevelContent/RoadmapAssignmentClient';
import { cppRoadmapData } from '@/data/cppCourseData';

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
      title: 'C++ Programming Assignment | Ignitio',
    };
  }

  const dayId = parseResult.data;
  return {
    title: `Day Assignment (${dayId}) — C++ Programming | Ignitio`,
    description: 'Complete the C++ programming practical assignment and get graded by Kibo.',
    alternates: {
      canonical: `/home/roadmaps/cpp/assignment/${dayId}`,
    },
  };
}

export default async function CppAssignmentPage({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    notFound();
  }

  const dayId = parseResult.data;

  return (
    <RoadmapAssignmentClient
      roadmapSlug="cpp"
      initialRoadmapData={cppRoadmapData}
      dayId={dayId}
    />
  );
}

