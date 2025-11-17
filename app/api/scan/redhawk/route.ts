import { NextRequest, NextResponse } from 'next/server';
import { RedhawkIntelligenceService } from '@/lib/services/redhawk-intelligence.service';

interface RedhawkScanRequest {
  target: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RedhawkScanRequest = await request.json();

    // Validate target
    if (!body.target) {
      return NextResponse.json(
        { success: false, error: 'Target domain is required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    const cleanDomain = body.target.replace(/^https?:\/\//, '').split('/')[0];
    
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Perform comprehensive intelligence gathering
    const intelligenceService = new RedhawkIntelligenceService();
    const result = await intelligenceService.gather(cleanDomain);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('RedHawk scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to gather intelligence',
      },
      { status: 500 }
    );
  }
}
