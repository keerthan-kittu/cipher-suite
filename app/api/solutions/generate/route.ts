import { NextRequest, NextResponse } from 'next/server';
import { VulnerabilitySolutionsService } from '@/lib/services/vulnerability-solutions.service';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#1a1a1a',
    fontFamily: 'Helvetica-Bold',
  },
  severity: {
    fontSize: 12,
    marginBottom: 20,
    padding: 8,
    borderRadius: 4,
  },
  severityCritical: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  severityHigh: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  severityMedium: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  severityLow: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 8,
  },
  stepContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    borderLeft: '3px solid #2563eb',
  },
  stepTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#1f2937',
  },
  stepDescription: {
    fontSize: 10,
    marginBottom: 8,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    padding: 10,
    borderRadius: 4,
    marginTop: 8,
  },
  code: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: '#f3f4f6',
    lineHeight: 1.4,
  },
  reference: {
    fontSize: 9,
    color: '#2563eb',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vulnerabilityId, vulnerabilityName } = body;

    if (!vulnerabilityId && !vulnerabilityName) {
      return NextResponse.json(
        { success: false, error: 'Vulnerability ID or name is required' },
        { status: 400 }
      );
    }

    const solutionsService = new VulnerabilitySolutionsService();
    const solution = vulnerabilityId 
      ? solutionsService.getSolution(vulnerabilityId)
      : solutionsService.findSolutionByName(vulnerabilityName);

    if (!solution) {
      return NextResponse.json(
        { success: false, error: 'Solution not found for this vulnerability' },
        { status: 404 }
      );
    }

    // Generate PDF using React.createElement
    const SolutionDocument = React.createElement(Document, {}, 
      React.createElement(Page, { size: "A4", style: styles.page },
        // Title
        React.createElement(Text, { style: styles.title }, solution.vulnerabilityName),
        
        // Severity
        React.createElement(View, { 
          style: Object.assign({}, 
            styles.severity,
            solution.severity === 'critical' ? styles.severityCritical : {},
            solution.severity === 'high' ? styles.severityHigh : {},
            solution.severity === 'medium' ? styles.severityMedium : {},
            solution.severity === 'low' ? styles.severityLow : {}
          )
        }, React.createElement(Text, {}, `Severity: ${solution.severity.toUpperCase()}`)),
        
        // Description
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Description'),
          React.createElement(Text, { style: styles.text }, solution.description)
        ),
        
        // Cause
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Root Cause'),
          React.createElement(Text, { style: styles.text }, solution.cause)
        ),
        
        // Recommendation
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Recommendation'),
          React.createElement(Text, { style: styles.text }, solution.recommendation)
        ),
        
        // Steps
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Step-by-Step Solution'),
          ...solution.steps.map((step, index) =>
            React.createElement(View, { key: index, style: styles.stepContainer },
              React.createElement(Text, { style: styles.stepTitle }, step.title),
              React.createElement(Text, { style: styles.stepDescription }, step.description),
              step.code && React.createElement(View, { style: styles.codeBlock },
                React.createElement(Text, { style: styles.code }, step.code)
              )
            )
          )
        ),
        
        // References
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'References'),
          ...solution.references.map((ref, index) =>
            React.createElement(Text, { key: index, style: styles.reference }, `• ${ref}`)
          )
        ),
        
        // Footer
        React.createElement(Text, { style: styles.footer }, 
          `Generated by Cipher Suite • ${new Date().toLocaleDateString()}`
        )
      )
    );

    const pdfBuffer = await renderToBuffer(SolutionDocument);

    const filename = `${solution.vulnerabilityName.replace(/[^a-zA-Z0-9]/g, '-')}-solution.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Solution PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate solution PDF' },
      { status: 500 }
    );
  }
}
