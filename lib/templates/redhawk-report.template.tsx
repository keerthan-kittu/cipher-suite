import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  value: {
    width: '70%',
    fontSize: 10,
    color: '#6b7280',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    marginBottom: 8,
  },
  badge: {
    display: 'inline-block',
    padding: '4 8',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: 4,
    fontSize: 9,
    marginRight: 5,
    marginBottom: 5,
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

export interface RedhawkReportData {
  domain: string;
  ip: string;
  scanDate: string;
  whois: any;
  dns: any;
  technologies: string[];
  headers: any;
  subdomains: string[];
  geolocation?: any;
  serverInfo?: any;
  cms?: any;
  emailAddresses?: string[];
  socialMedia?: any;
  performance?: any;
}

export const RedhawkReport: React.FC<{ data: RedhawkReportData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Intelligence Gathering Report</Text>
      <Text style={styles.subtitle}>Target: {data.domain}</Text>
      <Text style={styles.subtitle}>Scan Date: {new Date(data.scanDate).toLocaleString()}</Text>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Domain:</Text>
          <Text style={styles.value}>{data.domain}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IP Address:</Text>
          <Text style={styles.value}>{data.ip}</Text>
        </View>
      </View>

      {/* WHOIS Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WHOIS Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Registrar:</Text>
          <Text style={styles.value}>{data.whois.registrar}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{data.whois.createdDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Expires:</Text>
          <Text style={styles.value}>{data.whois.expiryDate}</Text>
        </View>
        {data.whois.nameServers && data.whois.nameServers.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Name Servers:</Text>
            <Text style={styles.value}>{data.whois.nameServers.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Geolocation */}
      {data.geolocation && Object.keys(data.geolocation).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geolocation</Text>
          {data.geolocation.country && (
            <View style={styles.row}>
              <Text style={styles.label}>Country:</Text>
              <Text style={styles.value}>{data.geolocation.country}</Text>
            </View>
          )}
          {data.geolocation.city && (
            <View style={styles.row}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value}>{data.geolocation.city}</Text>
            </View>
          )}
          {data.geolocation.isp && (
            <View style={styles.row}>
              <Text style={styles.label}>ISP:</Text>
              <Text style={styles.value}>{data.geolocation.isp}</Text>
            </View>
          )}
        </View>
      )}

      {/* Server Information */}
      {data.serverInfo && Object.keys(data.serverInfo).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Information</Text>
          {data.serverInfo.server && (
            <View style={styles.row}>
              <Text style={styles.label}>Server:</Text>
              <Text style={styles.value}>{data.serverInfo.server}</Text>
            </View>
          )}
          {data.serverInfo.os && (
            <View style={styles.row}>
              <Text style={styles.label}>Operating System:</Text>
              <Text style={styles.value}>{data.serverInfo.os}</Text>
            </View>
          )}
          {data.serverInfo.framework && (
            <View style={styles.row}>
              <Text style={styles.label}>Framework:</Text>
              <Text style={styles.value}>{data.serverInfo.framework}</Text>
            </View>
          )}
          {data.serverInfo.language && (
            <View style={styles.row}>
              <Text style={styles.label}>Language:</Text>
              <Text style={styles.value}>{data.serverInfo.language}</Text>
            </View>
          )}
        </View>
      )}

      {/* CMS Detection */}
      {data.cms && data.cms.name && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CMS Detection</Text>
          <View style={styles.row}>
            <Text style={styles.label}>CMS:</Text>
            <Text style={styles.value}>{data.cms.name} {data.cms.version && `v${data.cms.version}`}</Text>
          </View>
          {data.cms.plugins && data.cms.plugins.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Plugins:</Text>
              <Text style={styles.value}>{data.cms.plugins.join(', ')}</Text>
            </View>
          )}
        </View>
      )}

      {/* Technologies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detected Technologies</Text>
        <Text style={styles.value}>{data.technologies.join(', ')}</Text>
      </View>

      {/* DNS Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DNS Records</Text>
        {data.dns.A && data.dns.A.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>A Records:</Text>
            <Text style={styles.value}>{data.dns.A.join(', ')}</Text>
          </View>
        )}
        {data.dns.MX && data.dns.MX.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>MX Records:</Text>
            <Text style={styles.value}>{data.dns.MX.join(', ')}</Text>
          </View>
        )}
        {data.dns.NS && data.dns.NS.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>NS Records:</Text>
            <Text style={styles.value}>{data.dns.NS.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Email Addresses */}
      {data.emailAddresses && data.emailAddresses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Addresses Found</Text>
          <Text style={styles.value}>{data.emailAddresses.join(', ')}</Text>
        </View>
      )}

      {/* Social Media */}
      {data.socialMedia && Object.keys(data.socialMedia).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media Profiles</Text>
          {Object.entries(data.socialMedia).map(([platform, url]) => (
            <View key={platform} style={styles.row}>
              <Text style={styles.label}>{platform}:</Text>
              <Text style={styles.value}>{url as string}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Performance Metrics */}
      {data.performance && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Response Time:</Text>
            <Text style={styles.value}>{data.performance.responseTime}ms</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Page Size:</Text>
            <Text style={styles.value}>{(data.performance.pageSize / 1024).toFixed(2)}KB</Text>
          </View>
        </View>
      )}

      {/* Subdomains */}
      {data.subdomains && data.subdomains.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discovered Subdomains ({data.subdomains.length})</Text>
          <Text style={styles.value}>{data.subdomains.join(', ')}</Text>
        </View>
      )}

      <Text style={styles.footer}>
        Generated by Cipher Suite • {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);
