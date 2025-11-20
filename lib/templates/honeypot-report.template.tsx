import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '3 solid #ef4444',
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
    color: '#1a1a1a',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 3,
    color: '#666',
  },
  alertBox: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fee2e2',
    border: '2 solid #ef4444',
    borderRadius: 4,
  },
  successBox: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#d1fae5',
    border: '2 solid #10b981',
    borderRadius: 4,
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#1f2937',
    fontFamily: 'Helvetica-Bold',
    borderBottom: '2 solid #e5e7eb',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingVertical: 3,
  },
  label: {
    width: '40%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#6b7280',
  },
  criticalBadge: {
    padding: '4 8',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: 3,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  highBadge: {
    padding: '4 8',
    backgroundColor: '#fed7aa',
    color: '#9a3412',
    borderRadius: 3,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  mediumBadge: {
    padding: '4 8',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: 3,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  lowBadge: {
    padding: '4 8',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: 3,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  indicatorBox: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    border: '1 solid #e5e7eb',
    marginBottom: 8,
  },
  indicatorDetected: {
    backgroundColor: '#fee2e2',
    border: '2 solid #fca5a5',
  },
  indicatorTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  indicatorText: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  warningText: {
    fontSize: 11,
    color: '#991b1b',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  successText: {
    fontSize: 11,
    color: '#065f46',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  methodBadge: {
    padding: '3 6',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: 3,
    fontSize: 8,
    marginRight: 4,
    marginBottom: 4,
  },
});

export interface HoneypotReportData {
  target: string;
  scanDate: string;
  isHoneypot: boolean;
  confidence: number;
  riskLevel: string;
  indicators: Array<{
    type: string;
    severity: string;
    description: string;
    details?: string;
    detected: boolean;
    score: number;
  }>;
  recommendation: string;
  detectionMethods?: string[];
  networkInfo?: {
    responseTime: number;
    openPorts: number;
    serviceFingerprints: number;
  };
  scanDuration?: number;
  securityAssessment?: {
    overallScore: number;
    securityGrade: string;
    securityLevel: string;
    httpsEnabled: boolean;
    hasValidCertificate: boolean;
    securityHeaders: {
      present: string[];
      missing: string[];
      score: number;
    };
    vulnerabilities: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    securityRecommendations: string[];
  };
}

export const HoneypotReport: React.FC<{ data: HoneypotReportData }> = ({ data }) => {
  const detectedIndicators = data.indicators.filter(i => i.detected);
  const totalScore = data.indicators.reduce((sum, ind) => sum + ind.score, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HONEYPOT DETECTION REPORT</Text>
          <Text style={styles.subtitle}>Advanced Network Decoy Analysis</Text>
          <Text style={styles.subtitle}>Target: {data.target}</Text>
          <Text style={styles.subtitle}>Scan Date: {new Date(data.scanDate).toLocaleString()}</Text>
          {data.scanDuration && (
            <Text style={styles.subtitle}>Scan Duration: {(data.scanDuration / 1000).toFixed(2)}s</Text>
          )}
        </View>

        {/* Alert Box */}
        {data.isHoneypot ? (
          <View style={styles.alertBox}>
            <Text style={styles.warningText}>HONEYPOT DETECTED - CRITICAL ALERT</Text>
            <Text style={{ fontSize: 10, color: '#991b1b' }}>
              This target has been identified as a honeypot with {data.confidence}% confidence.
              Immediate action required to prevent detection and activity logging.
            </Text>
          </View>
        ) : (
          <View style={styles.successBox}>
            <Text style={styles.successText}>NO HONEYPOT DETECTED</Text>
            <Text style={{ fontSize: 10, color: '#065f46' }}>
              No honeypot indicators found with {data.confidence}% confidence.
              This does not guarantee security - perform additional security assessments.
            </Text>
          </View>
        )}

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detection Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { fontFamily: 'Helvetica-Bold', color: data.isHoneypot ? '#991b1b' : '#065f46' }]}>
              {data.isHoneypot ? 'HONEYPOT' : 'LEGITIMATE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Confidence Level:</Text>
            <Text style={styles.value}>{data.confidence}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Risk Level:</Text>
            <Text style={[styles.value, { fontFamily: 'Helvetica-Bold' }]}>{data.riskLevel.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Risk Score:</Text>
            <Text style={styles.value}>{totalScore}/115</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Indicators Detected:</Text>
            <Text style={styles.value}>{detectedIndicators.length} of {data.indicators.length}</Text>
          </View>
        </View>

        {/* Security Assessment */}
        {data.securityAssessment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Assessment</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Overall Security Score:</Text>
              <Text style={[styles.value, { fontFamily: 'Helvetica-Bold' }]}>
                {data.securityAssessment.overallScore}/100 (Grade: {data.securityAssessment.securityGrade})
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Security Level:</Text>
              <Text style={[styles.value, { fontFamily: 'Helvetica-Bold' }]}>
                {data.securityAssessment.securityLevel}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>HTTPS Enabled:</Text>
              <Text style={styles.value}>{data.securityAssessment.httpsEnabled ? 'Yes ✓' : 'No ✗'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Valid Certificate:</Text>
              <Text style={styles.value}>{data.securityAssessment.hasValidCertificate ? 'Yes ✓' : 'No ✗'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Security Headers:</Text>
              <Text style={styles.value}>
                {data.securityAssessment.securityHeaders.present.length} present, {data.securityAssessment.securityHeaders.missing.length} missing
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vulnerabilities:</Text>
              <Text style={styles.value}>
                Critical: {data.securityAssessment.vulnerabilities.critical}, High: {data.securityAssessment.vulnerabilities.high}, Medium: {data.securityAssessment.vulnerabilities.medium}, Low: {data.securityAssessment.vulnerabilities.low}
              </Text>
            </View>
          </View>
        )}

        {/* Network Information */}
        {data.networkInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network Analysis</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Response Time:</Text>
              <Text style={styles.value}>{data.networkInfo.responseTime}ms</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Open Ports:</Text>
              <Text style={styles.value}>{data.networkInfo.openPorts}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Service Fingerprints:</Text>
              <Text style={styles.value}>{data.networkInfo.serviceFingerprints}</Text>
            </View>
          </View>
        )}

        {/* Detection Methods */}
        {data.detectionMethods && data.detectionMethods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detection Methods Applied</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {data.detectionMethods.map((method, idx) => (
                <Text key={idx} style={styles.methodBadge}>{method}</Text>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Page 1 • Honeypot Detection Report • Generated by Cipher Suite • {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* Page 2 - Indicators */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Detection Indicators ({detectedIndicators.length} Detected)
          </Text>
          
          {data.indicators.map((indicator, idx) => (
            <View 
              key={idx} 
              style={indicator.detected ? [styles.indicatorBox, styles.indicatorDetected] : styles.indicatorBox}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={styles.indicatorTitle}>
                  {indicator.detected ? '[DETECTED] ' : '[OK] '}{indicator.type}
                </Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <Text style={
                    indicator.severity === 'high' ? styles.highBadge :
                    indicator.severity === 'medium' ? styles.mediumBadge :
                    styles.lowBadge
                  }>
                    {indicator.severity.toUpperCase()}
                  </Text>
                  <Text style={styles.methodBadge}>Score: {indicator.score}</Text>
                </View>
              </View>
              
              <Text style={styles.indicatorText}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Description: </Text>
                {indicator.description}
              </Text>
              
              {indicator.details && (
                <Text style={[styles.indicatorText, { fontStyle: 'italic', color: '#9ca3af' }]}>
                  {indicator.details}
                </Text>
              )}
              
              <Text style={[styles.indicatorText, { marginTop: 3 }]}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Status: </Text>
                {indicator.detected ? 'DETECTED' : 'Not Detected'}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 2 • Honeypot Detection Report • Generated by Cipher Suite • {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* Page 3 - Security Recommendations */}
      <Page size="A4" style={styles.page}>
        {data.securityAssessment && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Recommendations</Text>
              {data.securityAssessment.securityRecommendations.map((rec, idx) => (
                <Text key={idx} style={[styles.indicatorText, { marginBottom: 5, lineHeight: 1.4 }]}>
                  • {rec}
                </Text>
              ))}
            </View>

            {data.securityAssessment.securityHeaders.missing.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Missing Security Headers</Text>
                <Text style={[styles.indicatorText, { marginBottom: 8 }]}>
                  The following security headers should be implemented to improve security posture:
                </Text>
                {data.securityAssessment.securityHeaders.missing.map((header, idx) => (
                  <Text key={idx} style={[styles.indicatorText, { marginBottom: 3, fontFamily: 'Courier' }]}>
                    • {header}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        <View style={data.isHoneypot ? styles.alertBox : styles.successBox}>
          <Text style={data.isHoneypot ? styles.warningText : styles.successText}>
            Honeypot Detection Recommendation
          </Text>
          <Text style={{ fontSize: 10, color: data.isHoneypot ? '#991b1b' : '#065f46', lineHeight: 1.5 }}>
            {data.recommendation}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis Breakdown</Text>
          
          <Text style={[styles.indicatorText, { marginBottom: 8 }]}>
            This report analyzed {data.indicators.length} different honeypot indicators using {data.detectionMethods?.length || 8} detection methods.
            The target was evaluated based on port behavior, service fingerprints, response patterns, and known honeypot signatures.
          </Text>

          <Text style={[styles.indicatorTitle, { marginTop: 10, marginBottom: 5 }]}>
            Key Findings:
          </Text>
          
          <Text style={styles.indicatorText}>
            • Total Indicators Analyzed: {data.indicators.length}
          </Text>
          <Text style={styles.indicatorText}>
            • Positive Detections: {detectedIndicators.length}
          </Text>
          <Text style={styles.indicatorText}>
            • Risk Score: {totalScore}/115
          </Text>
          <Text style={styles.indicatorText}>
            • Confidence Level: {data.confidence}%
          </Text>
          <Text style={styles.indicatorText}>
            • Risk Classification: {data.riskLevel.toUpperCase()}
          </Text>

          {data.isHoneypot && (
            <>
              <Text style={[styles.indicatorTitle, { marginTop: 15, marginBottom: 5, color: '#991b1b' }]}>
                CRITICAL ACTIONS REQUIRED:
              </Text>
              <Text style={styles.indicatorText}>
                1. Immediately cease all interaction with this target
              </Text>
              <Text style={styles.indicatorText}>
                2. Assume your IP address and scan patterns have been logged
              </Text>
              <Text style={styles.indicatorText}>
                3. Review operational security procedures
              </Text>
              <Text style={styles.indicatorText}>
                4. Consider rotating IP addresses and attack vectors
              </Text>
              <Text style={styles.indicatorText}>
                5. Document this target in your threat intelligence database
              </Text>
            </>
          )}

          {!data.isHoneypot && (
            <>
              <Text style={[styles.indicatorTitle, { marginTop: 15, marginBottom: 5, color: '#065f46' }]}>
                Recommended Next Steps:
              </Text>
              <Text style={styles.indicatorText}>
                1. Proceed with standard security assessment protocols
              </Text>
              <Text style={styles.indicatorText}>
                2. Continue monitoring for behavioral anomalies
              </Text>
              <Text style={styles.indicatorText}>
                3. Document baseline behavior for future comparison
              </Text>
              <Text style={styles.indicatorText}>
                4. Apply appropriate penetration testing methodologies
              </Text>
              <Text style={styles.indicatorText}>
                5. Maintain audit logs of all assessment activities
              </Text>
            </>
          )}
        </View>

        <View style={[styles.section, { marginTop: 15 }]}>
          <Text style={styles.sectionTitle}>Disclaimer</Text>
          <Text style={[styles.indicatorText, { lineHeight: 1.4 }]}>
            This report is generated by automated analysis and should be used as part of a comprehensive security assessment.
            Results are based on observable network behavior and known honeypot signatures. False positives and false negatives
            are possible. Always verify findings through multiple methods and consult with security professionals before taking
            action. This tool is intended for authorized security testing only.
          </Text>
        </View>

        <Text style={styles.footer}>
          Page 3 • Honeypot Detection Report • Generated by Cipher Suite • {new Date().toLocaleDateString()} • CONFIDENTIAL
        </Text>
      </Page>
    </Document>
  );
};
