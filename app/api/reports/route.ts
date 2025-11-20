import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for reports (in production, use a database)
let reports: Array<{
  id: string;
  tool: string;
  target: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  findings: number;
  data?: any;
}> = [];

// GET - Fetch all reports
export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      reports: reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, target, findings, data } = body;

    if (!tool || !target) {
      return NextResponse.json(
        { success: false, error: 'Tool and target are required' },
        { status: 400 }
      );
    }

    const newReport = {
      id: Date.now().toString(),
      tool,
      target,
      date: new Date().toISOString(),
      status: 'completed' as const,
      findings: findings || 0,
      data: data || null,
    };

    reports.push(newReport);

    return NextResponse.json({ 
      success: true, 
      report: newReport 
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const initialLength = reports.length;
    reports = reports.filter(r => r.id !== id);

    if (reports.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Report deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
