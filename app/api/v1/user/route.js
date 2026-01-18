import {UserProfileSchema} from "@/models/user.profile.model";
import {NextRequest, NextResponse} from "next/server";
import connectToDB from "@/dbConfig/dbConnection"

export async function POST(NextRequest) {
   await connectToDB()
   const body = await NextRequest.json()
   const {name, email, badges, questions, roadmaps} = body
   if (!name) {
      return NextResponse.json({message: "Name is missing"}, {status: 400})
   }
   if (!email) {
      return NextResponse.json({message: "Email is missing"}, {status: 400})
   }
  if (!questions.selectedTechField) {
    return NextResponse.json({message: "Tech Field is missing"}, {status: 400})
  }
  const doesUserExist = await UserProfileSchema.findOne({email})
  if (doesUserExist) return NextResponse.json({message: "User already exists"}, {status: 400})
  const userProfile = new UserProfileSchema({
    name,
    email,
    badges,
    questions,
    roadmaps
  })
  const savedUserProfile = await userProfile.save()
  if (savedUserProfile.response.status === 200 || 201) return NextResponse.json({message: "User created successfully", userProfileId: savedUserProfile._id, userProfile: savedUserProfile}, {status: 201})
}
export async function GET(NextRequest) {
  await connectToDB()
   const {email} = NextRequest.body
  const userProfile = await UserProfileSchema.findOne({email: email}).populate("badges").populate("courses")
  if (!userProfile) return NextResponse.json({message: "User not found"}, {status: 404})
  return NextResponse.json({message: "User found", userProfile}, {status: 200})
}