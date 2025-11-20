import { NextRequest, NextResponse } from 'next/server';
import { VulnerabilitySolutionsService } from '@/lib/services/vulnerability-solutions.service';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

/**
 * Generate AI-powered solution using OpenAI or fallback to structured template
 */
async function generateAISolution(
  vulnerabilityName: string,
  description?: string,
  severity?: string
): Promise<any> {
  // Try OpenAI first if API key is available
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert. Generate comprehensive, step-by-step solutions for security vulnerabilities. Format your response as JSON with: description, cause, recommendation, steps (array of {title, description, code}), and references (array of URLs).'
            },
            {
              role: 'user',
              content: `Generate a detailed security solution for: "${vulnerabilityName}". ${description ? `Description: ${description}` : ''} Include step-by-step remediation instructions with code examples where applicable.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Try to parse JSON response
        try {
          const parsed = JSON.parse(content);
          return {
            vulnerabilityName,
            severity: severity || 'medium',
            ...parsed,
          };
        } catch {
          // If not JSON, structure the text response
          return structureAIResponse(vulnerabilityName, content, severity);
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  // Fallback to template-based solution
  return generateTemplateSolution(vulnerabilityName, description, severity);
}

/**
 * Structure AI text response into proper format
 */
function structureAIResponse(name: string, content: string, severity?: string): any {
  const lines = content.split('\n').filter(l => l.trim());
  
  return {
    vulnerabilityName: name,
    severity: severity || 'medium',
    description: lines[0] || `Security vulnerability: ${name}`,
    cause: lines[1] || 'Security misconfiguration or implementation flaw',
    recommendation: lines[2] || 'Follow security best practices and apply patches',
    steps: [
      {
        title: 'Step 1: Assess the Vulnerability',
        description: 'Review the vulnerability details and understand the security impact',
        code: null,
      },
      {
        title: 'Step 2: Apply Security Fixes',
        description: content.substring(0, 500),
        code: null,
      },
      {
        title: 'Step 3: Verify and Test',
        description: 'Test the fix and verify the vulnerability is resolved',
        code: null,
      },
    ],
    references: [
      'https://owasp.org/www-project-top-ten/',
      'https://cwe.mitre.org/',
      'https://nvd.nist.gov/',
    ],
  };
}

/**
 * Generate template-based solution when AI is not available
 */
function generateTemplateSolution(name: string, description?: string, severity?: string): any {
  return {
    vulnerabilityName: name,
    severity: severity || 'medium',
    description: description || `This security vulnerability (${name}) requires immediate attention to prevent potential security breaches.`,
    cause: 'Security misconfiguration, outdated software, or implementation flaw that exposes the system to potential attacks.',
    recommendation: 'Follow industry best practices, apply security patches, implement proper input validation, and conduct regular security audits.',
    steps: [
      {
        title: 'Step 1: Identify Affected Systems',
        description: 'Scan and identify all systems, applications, or components affected by this vulnerability. Document the scope and potential impact.',
        code: null,
      },
      {
        title: 'Step 2: Review Security Documentation',
        description: 'Consult OWASP guidelines, CVE databases, and vendor security advisories for specific remediation guidance related to this vulnerability.',
        code: null,
      },
      {
        title: 'Step 3: Implement Security Controls',
        description: 'Apply appropriate security controls such as input validation, output encoding, access controls, encryption, or security headers as needed.',
        code: '// Example: Add security headers\napp.use((req, res, next) => {\n  res.setHeader("X-Content-Type-Options", "nosniff");\n  res.setHeader("X-Frame-Options", "DENY");\n  res.setHeader("Content-Security-Policy", "default-src \'self\'");\n  next();\n});',
      },
      {
        title: 'Step 4: Update and Patch',
        description: 'Update all affected software, libraries, and dependencies to the latest secure versions. Apply vendor-provided security patches.',
        code: '# Update packages\nnpm audit fix\n# or\npip install --upgrade package-name',
      },
      {
        title: 'Step 5: Configure Security Settings',
        description: 'Review and harden security configurations. Disable unnecessary features, enforce strong authentication, and implement least privilege access.',
        code: null,
      },
      {
        title: 'Step 6: Test and Validate',
        description: 'Perform thorough testing to verify the vulnerability is resolved. Use security scanning tools to confirm the fix is effective.',
        code: '# Run security scan\nnpm audit\n# or use security testing tools',
      },
      {
        title: 'Step 7: Monitor and Maintain',
        description: 'Implement continuous monitoring, set up alerts for suspicious activity, and maintain regular security updates to prevent recurrence.',
        code: null,
      },
    ],
    references: [
      'https://owasp.org/www-project-top-ten/',
      'https://cwe.mitre.org/data/index.html',
      'https://nvd.nist.gov/vuln/search',
      'https://cheatsheetseries.owasp.org/',
      'https://www.cisa.gov/cybersecurity',
    ],
  };
}

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
    let solution = vulnerabilityId 
      ? solutionsService.getSolution(vulnerabilityId)
      : solutionsService.findSolutionByName(vulnerabilityName);

    // If no predefined solution, generate one using AI
    if (!solution) {
      console.log(`[Solutions API] No predefined solution found for: ${vulnerabilityId || vulnerabilityName}`);
      console.log(`[Solutions API] Generating AI-powered solution...`);
      
      try {
        solution = await generateAISolution(vulnerabilityName, body.description, body.severity);
        console.log(`[Solutions API] AI solution generated successfully`);
      } catch (aiError) {
        console.error('[Solutions API] AI generation failed:', aiError);
        return NextResponse.json(
          { success: false, error: `Solution not found for "${vulnerabilityName}" and AI generation failed. Please try again later.` },
          { status: 404 }
        );
      }
    }

    console.log(`[Solutions API] Generating PDF for: ${solution.vulnerabilityName}`);

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
