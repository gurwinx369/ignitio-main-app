import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { clangBeginnerRoadmapData } from '@/data/clangBeginnerRoadmap';

export const metadata = {
    title: "C Programming Language - Full Beginner Course Roadmap",
    description: "Learn C programming from scratch: variables, data types, conditions, loops, functions, arrays, pointers, and memory management with interactive labs and a built-in C compiler.",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: "/preview/roadmaps/c-beginner",
    },
    openGraph: {
        title: "C Programming Beginner Roadmap | Ignitio",
        description: "Learn C programming from scratch: variables, data types, conditions, loops, functions, arrays, pointers, and memory management with interactive labs and a built-in C compiler.",
        url: "https://app.ignitio.cloud/preview/roadmaps/c-beginner",
    },
};

export default function PreviewCLangBeginnerPage() {
    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "C Programming Language Beginner Course",
        "description": "Learn C programming from scratch: variables, data types, conditions, loops, functions, arrays, pointers, and memory management with interactive labs and a built-in C compiler.",
        "provider": {
            "@type": "Organization",
            "name": "Ignitio",
            "sameAs": "https://app.ignitio.cloud"
        },
        "courseCode": "C-LANG-101",
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
            <RoadmapTemplate roadmapData={clangBeginnerRoadmapData} isPreview={true} />
        </>
    );
}
