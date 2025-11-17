import { NextRequest, NextResponse } from 'next/server';
import { ReportGeneratorService } from '@/lib/services/report-generator.service';
import { ReportGenerationRequest } from '@/lib/types/report';
import { config } from '@/lib/config/env.config';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ReportGenerationRequest = await request.json();

    // Validate request
    if (!body.scanType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Scan type is required',
            code: 'MISSING_SCAN_TYPE',
          },
        },
        { status: 400 }
      );
    }

    if (!body.scanData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Scan data is required',
            code: 'MISSING_SCAN_DATA',
          },
        },
        { status: 400 }
      );
    }

    // Generate PDF with timeout from configuration
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF generation timeout')), config.pdf.timeout);
    });

    const reportGenerator = new ReportGeneratorService();
    const pdfBuffer = await Promise.race([
      reportGenerator.generatePDF(body),
      timeoutPromise,
    ]);

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const targetSafe = body.scanData.target
      ? body.scanData.target.replace(/[^a-zA-Z0-9]/g, '-')
      : 'unknown';
    const filename = `${body.scanType}-report-${targetSafe}-${timestamp}.pdf`;

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'PDF generation took too long. Please try again with less data.',
            code: 'TIMEOUT',
          },
        },
        { status: 504 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to generate PDF report',
          code: 'PDF_GENERATION_FAILED',
        },
      },
      { status: 500 }
    );
  }
}
