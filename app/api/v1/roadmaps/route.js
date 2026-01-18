import { Roadmap } from "@/models/roadmap.model";
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { Level } from "@/models/level.model";

export async function POST(request) {
  try {
    await connectToDB();
    const body = await request.json();
    const { name, phases } = body;

    // Validation
    if (!name) {
      return NextResponse.json({ message: "Name is missing" }, { status: 400 });
    }
    if (!phases || typeof phases !== 'object') {
      return NextResponse.json({ message: "Phases are missing or invalid" }, { status: 400 });
    }

    // Check if roadmap already exists
    const doesRoadmapExist = await Roadmap.findOne({ name });
    if (doesRoadmapExist) {
      return NextResponse.json({ message: "Roadmap already exists" }, { status: 400 });
    }

    // Create roadmap first (without phase references)
    const roadmap = new Roadmap({ name, phases: {} });
    const savedRoadmap = await roadmap.save();

    // Create levels for each phase and update roadmap
    const levelIds = {};
    
    for (const [phaseName, levelData] of Object.entries(phases)) {
      if (!["Beginner", "Intermediate", "Advanced"].includes(phaseName)) {
        continue;
      }

      const level = new Level({
        name: levelData.name || `${name} - ${phaseName}`,
        roadmap: savedRoadmap._id,
        phase: phaseName,
        feedback: {
          like: 0,
          dislike: 0,
        },
      });

      const savedLevel = await level.save();
      levelIds[phaseName] = savedLevel._id;
    }

    // Update roadmap with level references
    savedRoadmap.phases = levelIds;
    await savedRoadmap.save();

    return NextResponse.json({
      message: "Roadmap created successfully",
      roadmap: savedRoadmap,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating roadmap:", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    }, { status: 500 });
  }
}