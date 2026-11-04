import React from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import RoadmapAssignmentClient from '@/layout/LevelContent/RoadmapAssignmentClient';
import { gitGithubRoadmapData } from '@/data/gitGithubCourseData';

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
      title: 'Git & GitHub Assignment | Ignitio',
    };
  }

  const dayId = parseResult.data;
  return {
    title: `Day Assignment (${dayId}) — Git & GitHub | Ignitio`,
    description: 'Complete the Git & GitHub practical assignment and get graded by Kibo.',
    alternates: {
      canonical: `/home/roadmaps/git-github/assignment/${dayId}`,
    },
  };
}

export default async function GitGithubAssignmentPage({ params }) {
  const resolvedParams = await params;
  const parseResult = DayIdParamSchema.safeParse(resolvedParams?.dayId);

  if (!parseResult.success) {
    notFound();
  }

  const dayId = parseResult.data;

  return (
    <RoadmapAssignmentClient
      roadmapSlug="git-github"
      initialRoadmapData={gitGithubRoadmapData}
      dayId={dayId}
    />
  );
}

