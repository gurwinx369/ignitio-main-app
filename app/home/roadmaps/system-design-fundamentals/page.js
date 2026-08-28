import React from 'react';
import SystemDesignClient from '@/features/roadmaps/SystemDesign/components/SystemDesignClient';

export const metadata = {
    title: "System Design Fundamentals Interactive Learning Roadmap",
    description: "Master system design fundamentals: databases, caching, load balancing, replication, CAP theorem, message queues, and fault tolerance with interactive video-timestamped lessons.",
    alternates: {
        canonical: "/home/roadmaps/system-design-fundamentals",
    },
    openGraph: {
        title: "System Design Fundamentals Interactive Learning Roadmap | Ignitio",
        description: "Master system design fundamentals: databases, caching, load balancing, replication, CAP theorem, message queues, and fault tolerance with interactive video-timestamped lessons.",
        url: "https://app.ignitio.cloud/home/roadmaps/system-design-fundamentals",
    },
};

export default function SystemDesignPage() {
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
            <SystemDesignClient />
        </>
    );
}
