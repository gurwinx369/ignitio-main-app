import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapAssignmentClient from '@/layout/LevelContent/RoadmapAssignmentClient';
import { dsaStudentRoadmapData, dsaRoadmapsByRole } from '@/data/dsa';

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
      title: 'DSA Assignment | Ignitio',
    };
  }

  const dayId = parseResult.data;
  return {
    title: `Day Assignment (${dayId}) — DSA Roadmap | Ignitio`,
    description: 'Complete the DSA practical assignment and get graded by Kibo.',
    alternates: {
      canonical: `/home/roadmaps/dsa/assignment/${dayId}`,
    },
  };
}

export default async function DsaAssignmentPage({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    notFound();
  }

  const dayId = parseResult.data;

  return (
    <RoadmapAssignmentClient
      roadmapSlug="dsa"
      initialRoadmapData={dsaStudentRoadmapData}
      roadmapsByRole={dsaRoadmapsByRole}
      dayId={dayId}
    />
  );
}

