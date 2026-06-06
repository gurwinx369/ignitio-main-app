import React from 'react';
import PromptEngineeringClient from '@/features/roadmaps/PromptEngineering/components/PromptEngineeringClient';

export const metadata = {
    title: "Generative AI & Prompt Engineering Interactive Learning Roadmap",
    description: "Master LLMs and generative AI prompt engineering. Learn zero-shot, few-shot, chain-of-thought, role prompting, and agents with interactive labs and AI feedback.",
    alternates: {
        canonical: "/home/roadmaps/prompt-engineering",
    },
    openGraph: {
        title: "Prompt Engineering Interactive Learning Roadmap | Ignitio",
        description: "Master LLMs and generative AI prompt engineering. Learn zero-shot, few-shot, chain-of-thought, role prompting, and agents with interactive labs and AI feedback.",
        url: "https://app.ignitio.cloud/home/roadmaps/prompt-engineering",
    },
};

export default function PromptEngineeringPage() {
    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Generative AI & Prompt Engineering Interactive Learning Roadmap",
        "description": "Master LLMs and generative AI prompt engineering. Learn zero-shot, few-shot, chain-of-thought, role prompting, and agents with interactive labs and AI feedback.",
        "provider": {
            "@type": "Organization",
            "name": "Ignitio",
            "sameAs": "https://app.ignitio.cloud"
        },
        "courseCode": "PE-101",
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
            <PromptEngineeringClient />
        </>
    );
}
