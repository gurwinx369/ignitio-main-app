import { NextResponse } from 'next/server';
import connectDB from '@/dbConfig/dbConnection';
import { RetentionService } from '../../../../../lib/retention/retention.service';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const service = new RetentionService();
    const summary = await service.runRetentionJob();

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error('Retention cron error:', error);
    return NextResponse.json({
      error: 'Failed to run retention cron',
      details: error.message,
    }, { status: 500 });
  }
}
