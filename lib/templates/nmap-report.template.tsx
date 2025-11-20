/**
 * NMap Scan Report Template
 * Professional PDF report template for NMap network scan results
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#475569',
  },
  value: {
    width: '70%',
    color: '#1e293b',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1 solid #cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  tableCell: {
    fontSize: 10,
  },
  portCell: {
    width: '15%',
  },
  protocolCell: {
    width: '15%',
  },
  stateCell: {
    width: '15%',
  },
  serviceCell: {
    width: '25%',
  },
  versionCell: {
    width: '30%',
  },
  badge: {
    padding: '3 8',
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusOpen: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusFiltered: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusClosed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 9,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  emptyState: {
    padding: 20,
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
  },
  summary: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    color: '#475569',
    fontSize: 11,
  },
  summaryValue: {
    color: '#1e293b',
    fontWeight: 'bold',
    fontSize: 11,
  },
});

interface NMapReportProps {
  data: {
    host: string;
    status: string;
    openPorts: Array<{
      port: number;
      protocol: string;
      state: string;
      service: string;
      version: string;
    }>;
    os: string;
    latency: string;
    scanDate?: string;
    scanType?: string;
  };
}

export const NMapReport: React.FC<NMapReportProps> = ({ data }) => {
  const scanDate = data.scanDate || new Date().toISOString().split('T')[0];
  const scanType = data.scanType || 'Network Scan';
  
  // Calculate summary statistics
  const openCount = data.openPorts.filter(p => p.state === 'open').length;
  const filteredCount = data.openPorts.filter(p => p.state === 'filtered').length;
  const closedCount = data.openPorts.filter(p => p.state === 'closed').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>NMap Network Scan Report</Text>
          <Text style={styles.subtitle}>Target: {data.host}</Text>
          <Text style={styles.subtitle}>Scan Date: {scanDate}</Text>
          <Text style={styles.subtitle}>Scan Type: {scanType}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Summary</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Host Status:</Text>
              <Text style={styles.summaryValue}>{data.status.toUpperCase()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Ports Scanned:</Text>
              <Text style={styles.summaryValue}>{data.openPorts.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Open Ports:</Text>
              <Text style={styles.summaryValue}>{openCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Filtered Ports:</Text>
              <Text style={styles.summaryValue}>{filteredCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Closed Ports:</Text>
              <Text style={styles.summaryValue}>{closedCount}</Text>
            </View>
          </View>
        </View>

        {/* Host Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Host Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Target Host:</Text>
            <Text style={styles.value}>{data.host}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Host Status:</Text>
            <Text style={styles.value}>{data.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Operating System:</Text>
            <Text style={styles.value}>{data.os || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Network Latency:</Text>
            <Text style={styles.value}>{data.latency || 'N/A'}</Text>
          </View>
        </View>

        {/* Open Ports Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Ports & Services</Text>
          
          {data.openPorts.length > 0 ? (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.portCell]}>Port</Text>
                <Text style={[styles.tableCell, styles.protocolCell]}>Protocol</Text>
                <Text style={[styles.tableCell, styles.stateCell]}>State</Text>
                <Text style={[styles.tableCell, styles.serviceCell]}>Service</Text>
                <Text style={[styles.tableCell, styles.versionCell]}>Version</Text>
              </View>
              
              {/* Table Rows */}
              {data.openPorts.map((port, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.portCell]}>{port.port}</Text>
                  <Text style={[styles.tableCell, styles.protocolCell]}>{port.protocol}</Text>
                  <Text style={[styles.tableCell, styles.stateCell]}>{port.state}</Text>
                  <Text style={[styles.tableCell, styles.serviceCell]}>{port.service}</Text>
                  <Text style={[styles.tableCell, styles.versionCell]}>{port.version}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text>No ports detected or host is down</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Cipher Suite Security Tools</Text>
          <Text>Report Date: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};
