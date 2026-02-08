// app/api/notifications/save-token/route.js
import { NextResponse } from "next/server";

// In production, save this to your database
// For now, we'll just log it
const tokens = new Set();

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        // Add token to set (in production, save to database)
        tokens.add(token);

        console.log("FCM Token saved:", token);
        console.log("Total tokens:", tokens.size);

        // TODO: Save to your database
        // Example:
        // await db.fcmTokens.create({
        //   data: {
        //     token,
        //     userId: session.user.id, // from auth session
        //     createdAt: new Date(),
        //   },
        // });

        return NextResponse.json(
            {
                success: true,
                message: "Token saved successfully"
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error saving token:", error);
        return NextResponse.json(
            { error: "Failed to save token" },
            { status: 500 }
        );
    }
}

// Get all tokens (for testing)
export async function GET() {
    return NextResponse.json(
        {
            tokens: Array.from(tokens),
            count: tokens.size
        },
        { status: 200 }
    );
}
