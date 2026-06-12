import React from 'react';
import DSAClient from '@/features/roadmaps/DSA/components/DSAClient';

export const metadata = {
    title: "DSA Interactive Learning Roadmap",
    description: "Learn data structures and algorithms with guided videos, quizzes, assignments, and Kyle AI support.",
    alternates: {
        canonical: "/home/roadmaps/dsa",
    },
    openGraph: {
        title: "DSA Interactive Learning Roadmap | Ignitio",
        description: "Learn data structures and algorithms with guided videos, quizzes, assignments, and Kyle AI support.",
        url: "https://app.ignitio.cloud/home/roadmaps/dsa",
    },
};

export default function DSAPage() {
    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "DSA Interactive Learning Roadmap",
        "description": "Learn data structures and algorithms with guided videos, quizzes, assignments, and Kyle AI support.",
        "provider": {
            "@type": "Organization",
            "name": "Ignitio",
            "sameAs": "https://app.ignitio.cloud"
        },
        "courseCode": "DSA-101",
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
            <DSAClient />
        </>
    );
}
