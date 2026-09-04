import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { systemDesignRoadmapData } from '@/data/systemDesignData';

export const metadata = {
    title: "System Design Fundamentals Interactive Learning Roadmap",
    description: "Master system design fundamentals: databases, caching, load balancing, replication, CAP theorem, message queues, and fault tolerance with interactive video-timestamped lessons.",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: "/preview/roadmaps/system-design-fundamentals",
    },
    openGraph: {
        title: "System Design Fundamentals Interactive Learning Roadmap | Ignitio",
        description: "Master system design fundamentals: databases, caching, load balancing, replication, CAP theorem, message queues, and fault tolerance with interactive video-timestamped lessons.",
        url: "https://app.ignitio.cloud/preview/roadmaps/system-design-fundamentals",
    },
};

export default function PreviewSystemDesignPage() {
    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "System Design Fundamentals Interactive Learning Roadmap",
        "description": "Master system design fundamentals: databases, caching, load balancing, replication, CAP theorem, message queues, and fault tolerance with interactive video-timestamped lessons.",
        "provider": {
            "@type": "Organization",
            "name": "Ignitio",
            "sameAs": "https://app.ignitio.cloud"
        },
        "courseCode": "SD-101",
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
            <RoadmapTemplate roadmapData={systemDesignRoadmapData} isPreview={true} />
        </>
    );
}
