import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { VulnercipherReportData } from '../types/report';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #1e293b',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  targetText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: 'bold',
    marginTop: 8,
  },
  summarySection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  severityBadge: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  criticalBadge: {
    backgroundColor: '#fee2e2',
    borderLeft: '4 solid #dc2626',
  },
  highBadge: {
    backgroundColor: '#ffedd5',
    borderLeft: '4 solid #ea580c',
  },
  mediumBadge: {
    backgroundColor: '#fef3c7',
    borderLeft: '4 solid #ca8a04',
  },
  lowBadge: {
    backgroundColor: '#dbeafe',
    borderLeft: '4 solid #2563eb',
  },
  badgeCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  criticalText: {
    color: '#dc2626',
  },
  highText: {
    color: '#ea580c',
  },
  mediumText: {
    color: '#ca8a04',
  },
  lowText: {
    color: '#2563eb',
  },
  badgeLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  vulnerabilitiesSection: {
    marginTop: 20,
  },
  vulnerabilityCard: {
    marginBottom: 15,
    padding: 12,
    border: '1 solid #e2e8f0',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  vulnerabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1 solid #f1f5f9',
  },
  vulnerabilityTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
  },
  severityTag: {
    padding: '4 8',
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  criticalTag: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
  highTag: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
  },
  mediumTag: {
    backgroundColor: '#ca8a04',
    color: '#ffffff',
  },
  lowTag: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },
  vulnerabilityDescription: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    width: 100,
  },
  infoValue: {
    fontSize: 9,
    color: '#0f172a',
    flex: 1,
  },
  recommendation: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderLeft: '3 solid #22c55e',
    borderRadius: 3,
  },
  recommendationLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 9,
    color: '#166534',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
});

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, count }) => {
  const badgeStyles = {
    critical: styles.criticalBadge,
    high: styles.highBadge,
    medium: styles.mediumBadge,
    low: styles.lowBadge,
  };

  const textStyles = {
    critical: styles.criticalText,
    high: styles.highText,
    medium: styles.mediumText,
    low: styles.lowText,
  };

  return (
    <View style={[styles.severityBadge, badgeStyles[severity]]}>
      <Text style={[styles.badgeCount, textStyles[severity]]}>{count}</Text>
      <Text style={styles.badgeLabel}>{severity}</Text>
    </View>
  );
};

interface VulnerabilityItemProps {
  vulnerability: VulnercipherReportData['vulnerabilities'][0];
}

const VulnerabilityItem: React.FC<VulnerabilityItemProps> = ({ vulnerability }) => {
  const tagStyles = {
    critical: styles.criticalTag,
    high: styles.highTag,
    medium: styles.mediumTag,
    low: styles.lowTag,
  };

  return (
    <View style={styles.vulnerabilityCard}>
      <View style={styles.vulnerabilityHeader}>
        <Text style={styles.vulnerabilityTitle}>{vulnerability.title}</Text>
        <View style={[styles.severityTag, tagStyles[vulnerability.severity]]}>
          <Text>{vulnerability.severity}</Text>
        </View>
      </View>
      
      <Text style={styles.vulnerabilityDescription}>
        {vulnerability.description}
      </Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Affected:</Text>
        <Text style={styles.infoValue}>{vulnerability.affected}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Vulnerability ID:</Text>
        <Text style={styles.infoValue}>{vulnerability.id}</Text>
      </View>
      
      <View style={styles.recommendation}>
        <Text style={styles.recommendationLabel}>RECOMMENDATION</Text>
        <Text style={styles.recommendationText}>{vulnerability.recommendation}</Text>
      </View>
    </View>
  );
};

interface VulnercipherReportProps {
  data: VulnercipherReportData;
  title?: string;
  findingsLabel?: string;
}

export const VulnercipherReport: React.FC<VulnercipherReportProps> = ({ 
  data, 
  title = 'Vulnerability Scan Report',
  findingsLabel = 'vulnerabilities'
}) => {
  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
          <Text style={styles.subtitle}>Scan Date: {new Date(data.scanDate).toLocaleString()}</Text>
          <Text style={styles.targetText}>Target: {data.target}</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.summaryGrid}>
            <SeverityBadge severity="critical" count={data.summary.critical} />
            <SeverityBadge severity="high" count={data.summary.high} />
            <SeverityBadge severity="medium" count={data.summary.medium} />
            <SeverityBadge severity="low" count={data.summary.low} />
          </View>
        </View>

        <View style={styles.vulnerabilitiesSection}>
          <Text style={styles.sectionTitle}>
            Detailed Findings ({data.summary.total} {findingsLabel})
          </Text>
          {data.vulnerabilities.map((vuln, index) => (
            <VulnerabilityItem key={index} vulnerability={vuln} />
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>Cipher Suite Security Report</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
