"use client";

import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { promptEngineeringRoadmapData } from '@/data/promptEngineeringCourseData';

export default function PromptEngineeringPage() {
    return <RoadmapTemplate roadmapData={promptEngineeringRoadmapData} />;
}
