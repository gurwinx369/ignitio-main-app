"use client";

import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { gitGithubRoadmapData } from '@/data/gitGithubCourseData';

export default function GitGithubPage() {
    return <RoadmapTemplate roadmapData={gitGithubRoadmapData} />;
}
