import { NextResponse } from 'next/server';
import connectDB from '@/dbConfig/dbConnection';
import { UserProfile } from '../../../../../models/v2/user.profile.model';
import { verifyUnsubscribeToken } from '../../../../../lib/retention/unsubscribeToken';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(
        `<html><body><h1>Bad Request</h1><p>Missing unsubscribe token.</p></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const userId = verifyUnsubscribeToken(token);
    if (!userId) {
      return new NextResponse(
        `<html><body><h1>Invalid Token</h1><p>The unsubscribe token is invalid or corrupted.</p></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    await connectDB();

    const user = await UserProfile.findById(userId);
    if (!user) {
      return new NextResponse(
        `<html><body><h1>User Not Found</h1><p>We could not find your account.</p></body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Use updateOne to avoid full-document validation on legacy profiles
    await UserProfile.updateOne(
      { _id: userId },
      {
        $set: {
          retentionUnsubscribed: true,
          retentionUnsubscribedAt: new Date(),
        },
      },
      { timestamps: false }
    );

    return new NextResponse(
      `<html>
        <head><title>Unsubscribed Successfully</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center; color: #333;">
          <h1 style="color: #0070f3;">Unsubscribed Successfully</h1>
          <p>You have been removed from our learning reminder emails.</p>
          <p>You can close this window now.</p>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(
      `<html><body><h1>Server Error</h1><p>Failed to process unsubscribe request. Please try again later.</p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
