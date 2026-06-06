import React from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import { gitGithubRoadmapData } from '@/data/gitGithubCourseData';

export const metadata = {
    title: "Git & GitHub Interactive Learning Roadmap",
    description: "Learn version control from scratch. Master staging, commits, branch management, merge conflict resolution, pull requests, and Git collaboration on GitHub.",
    alternates: {
        canonical: "/home/roadmaps/git-github",
    },
    openGraph: {
        title: "Git & GitHub Interactive Learning Roadmap | Ignitio",
        description: "Learn version control from scratch. Master staging, commits, branch management, merge conflict resolution, pull requests, and Git collaboration on GitHub.",
        url: "https://app.ignitio.cloud/home/roadmaps/git-github",
    },
};

export default function GitGithubPage() {
    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Git & GitHub Interactive Learning Roadmap",
        "description": "Learn version control from scratch. Master staging, commits, branch management, merge conflict resolution, pull requests, and Git collaboration on GitHub.",
        "provider": {
            "@type": "Organization",
            "name": "Ignitio",
            "sameAs": "https://app.ignitio.cloud"
        },
        "courseCode": "GIT-101",
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
            <RoadmapTemplate roadmapData={gitGithubRoadmapData} />
        </>
    );
}
