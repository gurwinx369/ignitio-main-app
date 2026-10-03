import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { callKyleFastApi } from "@/features/kyle/server/kyle-fastapi.client";

const BodySchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
  user_profession: z.enum(["student", "developer", "writer", "designer", "other"]).optional(),
});

export async function POST(request) {
  const { error, status } = await verifyFirebaseToken(request);
  if (error) return NextResponse.json({ error }, { status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues || parsed.error.errors || [];
    const first = issues[0];
    return NextResponse.json(
      { error: `Validation Error: ${first?.path?.join(".")} - ${first?.message}` },
      { status: 422 }
    );
  }

  try {
    const response = await callKyleFastApi({
      request,
      path: "/api/v1/funfact",
      body: parsed.data,
    });
    return NextResponse.json(response);
  } catch (err) {
    console.error("[Kyle Fun Fact] Proxy error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reach AI service" },
      { status: err.status || 500 }
    );
  }
}
