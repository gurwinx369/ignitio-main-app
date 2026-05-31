import { UserProfile } from "../../../../models/v1/user.profile.model";
import { Badge } from "../../../../models/v1/badge.model"
import { Roadmap } from "../../../../models/v1/roadmap.model"
import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection"

export async function POST(NextRequest) {
    await connectToDB()
    const { firebaseUID, email, badges, questions, roadmaps } = await NextRequest.json()
    console.log("Received post body", {
        firebaseUID: firebaseUID,
        email: email,
        badges: badges,
        questions: questions.selectedTechField,
        roadmaps: roadmaps
    })
    if (!firebaseUID) {
        return NextResponse.json({ message: "firebaseUID is missing" }, { status: 400 })
    }
    if (!email) {
        return NextResponse.json({ message: "Email is missing" }, { status: 400 })
    }
    if (!questions?.selectedTechField) {
        return NextResponse.json({ message: "Selected Tech Field is missing" }, { status: 400 })
    }
    const doesUserExist = await UserProfile.findOne({ email })
    if (doesUserExist) return NextResponse.json({ message: "User already exists" }, { status: 400 })
    const doesBadgeExist = await Badge.findOne({ name: badges })
    if (!doesBadgeExist) {
        const createBadge = await Badge.create({
            name: Badge.name,
            badgeUrl: Badge.badgeUrl
        })
        await createBadge.save()
    }
    console.log(
        "Incoming roadmap:",
        roadmaps?.name
    );

    const allRoadmaps =
        await Roadmap.find({});

    console.log(
        "DB roadmaps:",
        allRoadmaps.map(
            r => r.name
        )
    );

    const doesRoadmapExist =
        await Roadmap.findOne({
            name: roadmaps.name
        });

    console.log(
        "Matched roadmap:",
        doesRoadmapExist
    );

    if (!doesRoadmapExist) {
        return NextResponse.json(
            {
                message: "Roadmap does not exist"
            },
            {
                status: 400
            }
        );
    }
    const userProfile = new UserProfile({
        firebaseUID,
        email,
        badges,
        questions,
        roadmaps: doesRoadmapExist._id
    })
    const savedUserProfile = await userProfile.save()
    return NextResponse.json({
        message: "User created successfully",
        userProfileId: savedUserProfile._id,
        userProfile: savedUserProfile
    }, { status: 201 })
}

export async function GET(request) {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json({ message: "Email is missing" }, { status: 400 })
    }

    const userProfile = await UserProfile.findOne({ email: email }).populate("roadmaps")
    if (!userProfile) return NextResponse.json({ message: "User not found" }, { status: 404 })
    return NextResponse.json({ message: "User found", userProfile }, { status: 200 })
}
