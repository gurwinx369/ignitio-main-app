import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { cppRoadmapData } from '@/data/cppCourseData';

export const metadata = {
    title: "C++ Programming Interactive Learning Roadmap",
    description: "Master C++ from basics to advanced. Learn variables, conditionals, loops, functions, OOP, and memory management with interactive labs and an AI coding helper.",
    alternates: {
        canonical: "/preview/roadmaps/cpp",
    },
    openGraph: {
        title: "C++ Interactive Learning Roadmap | Ignitio",
        description: "Master C++ from basics to advanced. Learn variables, conditionals, loops, functions, OOP, and memory management with interactive labs and an AI coding helper.",
        url: "https://app.ignitio.cloud/preview/roadmaps/cpp",
    },
};

export default function CppPage() {
    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "C++ Programming Interactive Learning Roadmap",
        "description": "Master C++ from basics to advanced. Learn variables, conditionals, loops, functions, OOP, and memory management with interactive labs and an AI coding helper.",
        "provider": {
            "@type": "Organization",
            "name": "Ignitio",
            "sameAs": "https://app.ignitio.cloud"
        },
        "courseCode": "CPP-101",
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "Online",
            "instructionType": "Interactive"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
            />
            <RoadmapTemplate roadmapData={cppRoadmapData} isPreview={true} />
        </>
    );
}
