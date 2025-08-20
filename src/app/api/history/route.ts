import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const filterSentiment = searchParams.get('sentiment') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    const analyses = await DatabaseService.searchUserAnalyses(
      session.user.id,
      searchTerm,
      filterSentiment,
      limit
    );

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (analysisId) {
      // Delete specific analysis
      const success = await DatabaseService.deleteAnalysis(session.user.id, analysisId);
      if (!success) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }
    } else {
      // Clear all history
      const success = await DatabaseService.clearUserHistory(session.user.id);
      if (!success) {
        return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
