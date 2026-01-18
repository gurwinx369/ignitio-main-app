import {UserProfile} from "@/models/user.profile.model";
import {Badge} from "@/models/badge.model"
import {Roadmap} from "@/models/roadmap.model"
import {NextRequest, NextResponse} from "next/server";
import connectToDB from "@/dbConfig/dbConnection"

export async function POST(request) {
   await connectToDB()
   const body = await request.json()
   const {name, email, badges, questions, roadmaps} = body
   if (!name) {
      return NextResponse.json({message: "Name is missing"}, {status: 400})
   }
   if (!email) {
      return NextResponse.json({message: "Email is missing"}, {status: 400})
   }
  if (!questions?.selectedTechField) {
    return NextResponse.json({message: "Tech Field is missing"}, {status: 400})
  }
  const doesUserExist = await UserProfile.findOne({email})
  if (doesUserExist) return NextResponse.json({message: "User already exists"}, {status: 400})
   const doesBadgeExist = await Badge.findOne({name: badges})
   if (!doesBadgeExist) return NextResponse.json({message: "Badge does not exist"}, {status: 400})
   const doesRoadmapExist = await Roadmap.findOne({name: roadmaps})
   if (!doesRoadmapExist) return NextResponse.json({message: "Roadmap does not exist"}, {status: 400})
  const userProfile = new UserProfile({
    name,
    email,
    badges: doesBadgeExist._id,
    questions,
    roadmaps: doesRoadmapExist._id
  })
  const savedUserProfile = await userProfile.save()
  return NextResponse.json({message: "User created successfully", userProfileId: savedUserProfile._id, userProfile: savedUserProfile}, {status: 201})
}

export async function GET(request) {
  await connectToDB()
  const {searchParams} = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({message: "Email is missing"}, {status: 400})
  }

  const userProfile = await UserProfile.findOne({email: email}).populate("roadmaps")
  if (!userProfile) return NextResponse.json({message: "User not found"}, {status: 404})
  return NextResponse.json({message: "User found", userProfile}, {status: 200})
}