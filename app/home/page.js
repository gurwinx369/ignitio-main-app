"use client"
import GitCourseCard from "@/components/ui/git-course-card";
import {useRouter} from "next/navigation";
import Profile from "@/layout/Profile"
import React from 'react';

export default function Home() {
    const router = useRouter();
    const handleRedirect = (event) => {
        event.preventDefault()
        router.push("/home/roadmaps/git-github");
    }
    return (
        <>
            <Profile/>
            <div className="mt-12 flex justify-center align-center">
                <GitCourseCard onClick={handleRedirect}/>
            </div>
        </>
    )
}
