"use client";

import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { cppRoadmapData } from '@/data/cppCourseData';

export default function CppPage() {
    return <RoadmapTemplate roadmapData={cppRoadmapData} />;
}
