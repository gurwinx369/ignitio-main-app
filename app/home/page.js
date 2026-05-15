"use client";
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import { useRouter } from "next/navigation";
import Profile from "@/layout/Profile";
import React, { useEffect } from "react";
import CppCourseCard from "../../components/ui/courseCards/cpp-course-card";
import { auth } from "@/lib/firebase/firebase";
import { getAuth } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const redirects = {
    GitGithub: "/home/roadmaps/git-github",
    CPP: "/home/roadmaps/cpp",
  };
  useEffect(() => {
    const fetchToken = async () => {
      if (!auth.currentUser) {
        console.log("No user is logged in");
        return;
      }
      const token = await auth.currentUser.getIdToken();
      console.log("Bearer Token:", token);
    };

    fetchToken();
  }, []);
  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) {
      console.log("No user is logged in");
      return;
    }
    auth.currentUser.getIdToken(true).then((token) => {
      console.log("FIREBASE TOKEN:", token);
    });
  }, []);
  const handleRedirectGitGithub = () => {
    router.push(redirects.GitGithub);
  };
  const handleRedirectCPP = () => {
    router.push(redirects.CPP);
  };
  return (
    <>
      <Profile />
      <div className="mt-12 flex justify-center align-center">
        <GitCourseCard onClick={handleRedirectGitGithub} />
      </div>
      <div className="mt-12 flex justify-center align-center">
        <CppCourseCard onClick={handleRedirectCPP} />
      </div>
    </>
  );
}
