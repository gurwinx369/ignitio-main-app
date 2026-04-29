"use client"
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import {useRouter} from "next/navigation";
import Profile from "@/layout/Profile"
import React from 'react';
import CppCourseCard from "../../components/ui/courseCards/cpp-course-card";

export default function Home() {
    const router = useRouter();
    const redirects = {
        GitGithub: "/home/roadmaps/git-github",
        CPP: "/home/roadmaps/cpp"
    }
    const handleRedirectGitGithub = () => {
        router.push(redirects.GitGithub);
    }
    const handleRedirectCPP = () => {
        router.push(redirects.CPP);
    }
    return (
        <>
            <Profile/>
            <div className="mt-12 flex justify-center align-center">
                <GitCourseCard onClick={handleRedirectGitGithub}/>
            </div>
            <div className="mt-12 flex justify-center align-center">
              <CppCourseCard onClick={handleRedirectCPP} />
            </div>
        </>
    )
}
