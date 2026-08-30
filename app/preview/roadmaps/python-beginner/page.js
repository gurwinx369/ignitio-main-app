import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { pythonBeginnerRoadmapData } from '@/data/pythonBeginnerRoadmapData';

export const metadata = {
    title: "Python for Beginners - Interactive Learning Roadmap",
    description: "Master Python from scratch: variables, data types, functions, OOP, and industry-ready skills for AI, ML, and software development.",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: "/preview/roadmaps/python-beginner",
    },
    openGraph: {
        title: "Python for Beginners Interactive Learning Roadmap | Ignitio",
        description: "Master Python from scratch: variables, data types, functions, OOP, and industry-ready skills for AI, ML, and software development.",
        url: "https://app.ignitio.cloud/preview/roadmaps/python-beginner",
    },
};

export default function PreviewPythonBeginnerPage() {
    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Python for Beginners Interactive Learning Roadmap",
        "description": "Master Python from scratch: variables, data types, functions, OOP, and industry-ready skills for AI, ML, and software development.",
        "provider": {
            "@type": "Organization",
            "name": "Ignitio",
            "sameAs": "https://app.ignitio.cloud"
        },
        "courseCode": "PYTHON-101",
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
            <RoadmapTemplate roadmapData={pythonBeginnerRoadmapData} isPreview={true} />
        </>
    );
}
