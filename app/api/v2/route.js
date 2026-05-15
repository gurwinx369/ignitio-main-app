import connectDB from "@/dbConfig/dbConnection";
import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();

  try {
    await connectDB();

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${Date.now() - startTime}ms`,
        services: {
          database: "connected",
          server: "running",
        },
        environment: process.env.NODE_ENV,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`,
        services: {
          database: "unreachable",
          server: "running",
        },
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 503 }, // 503 Service Unavailable, not 500 — DB is down, server isn't
    );
  }
}
