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
    borderBottom: '2 solid #2563eb',
  },
  title: {
    fontSize: 22,
    marginBottom: 5,
    color: '#1a1a1a',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 3,
    color: '#666',
  },
  section: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 8,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
    borderBottom: '1 solid #dbeafe',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 2,
  },
  label: {
    width: '35%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  value: {
    width: '65%',
    fontSize: 9,
    color: '#6b7280',
  },
  badge: {
    padding: '3 6',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: 3,
    fontSize: 8,
    marginRight: 4,
    marginBottom: 3,
  },
  criticalBadge: {
    padding: '3 6',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: 3,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  highBadge: {
    padding: '3 6',
    backgroundColor: '#fed7aa',
    color: '#9a3412',
    borderRadius: 3,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  mediumBadge: {
    padding: '3 6',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: 3,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  issueBox: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    border: '1 solid #e5e7eb',
    marginBottom: 6,
  },
  issueTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  issueText: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
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
  apiKeys?: any[];
  securityIssues?: any[];
  metadata?: any;
  jsLibraries?: string[];
  analytics?: any[];
  cdn?: any;
  robots?: any;
  sitemap?: any;
  confidentialData?: any[];
}

export const RedhawkReport: React.FC<{ data: RedhawkReportData }> = ({ data }) => (
  <Document>
    {/* PAGE 1 */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Intelligence Report</Text>
        <Text style={styles.subtitle}>Domain: {data.domain}</Text>
        <Text style={styles.subtitle}>IP Address: {data.ip}</Text>
        <Text style={styles.subtitle}>Scan Date: {new Date(data.scanDate).toLocaleString()}</Text>
      </View>

      {/* WHOIS Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WHOIS Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Registrar:</Text>
          <Text style={styles.value}>{data.whois?.registrar || 'Not Available'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{data.whois?.createdDate || 'Not Available'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Expires:</Text>
          <Text style={styles.value}>{data.whois?.expiryDate || 'Not Available'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Name Servers:</Text>
          <Text style={styles.value}>{data.whois?.nameServers?.join(', ') || 'None'}</Text>
        </View>
      </View>

      {/* DNS Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DNS Records</Text>
        <View style={styles.row}>
          <Text style={styles.label}>A Records:</Text>
          <Text style={styles.value}>{data.dns?.A?.join(', ') || 'None'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>AAAA Records:</Text>
          <Text style={styles.value}>{data.dns?.AAAA?.join(', ') || 'None'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>MX Records:</Text>
          <Text style={styles.value}>{data.dns?.MX?.join(', ') || 'None'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>NS Records:</Text>
          <Text style={styles.value}>{data.dns?.NS?.join(', ') || 'None'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>TXT Records:</Text>
          <Text style={styles.value}>{data.dns?.TXT?.join(', ') || 'None'}</Text>
        </View>
        {data.dns?.CNAME && (
          <View style={styles.row}>
            <Text style={styles.label}>CNAME Records:</Text>
            <Text style={styles.value}>{data.dns.CNAME}</Text>
          </View>
        )}
      </View>

      {/* Detected Technologies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detected Technologies</Text>
        <Text style={styles.value}>{data.technologies?.join(', ') || 'None detected'}</Text>
      </View>

      {/* HTTP Headers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HTTP Headers</Text>
        {data.headers && Object.keys(data.headers).length > 0 ? (
          Object.entries(data.headers).slice(0, 8).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{key}:</Text>
              <Text style={styles.value}>{String(value).substring(0, 80)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>No headers captured</Text>
        )}
      </View>

      <Text style={styles.footer}>
        Page 1 • Generated by Cipher Suite • {new Date().toLocaleDateString()}
      </Text>
    </Page>

    {/* PAGE 2 */}
    <Page size="A4" style={styles.page}>
      {/* Geolocation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geolocation</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{data.geolocation?.country || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Region:</Text>
          <Text style={styles.value}>{data.geolocation?.region || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{data.geolocation?.city || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ISP:</Text>
          <Text style={styles.value}>{data.geolocation?.isp || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Timezone:</Text>
          <Text style={styles.value}>{data.geolocation?.timezone || 'Unknown'}</Text>
        </View>
      </View>

      {/* Server Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Server:</Text>
          <Text style={styles.value}>{data.serverInfo?.server || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>OS:</Text>
          <Text style={styles.value}>{data.serverInfo?.os || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Powered By:</Text>
          <Text style={styles.value}>{data.serverInfo?.poweredBy || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Framework:</Text>
          <Text style={styles.value}>{data.serverInfo?.framework || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Language:</Text>
          <Text style={styles.value}>{data.serverInfo?.language || 'Unknown'}</Text>
        </View>
      </View>

      {/* CMS Detection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CMS Detection</Text>
        <View style={styles.row}>
          <Text style={styles.label}>CMS:</Text>
          <Text style={styles.value}>
            {data.cms?.name ? `${data.cms.name} ${data.cms.version ? `v${data.cms.version}` : ''}` : 'Not detected'}
          </Text>
        </View>
        {data.cms?.plugins && data.cms.plugins.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Plugins:</Text>
            <Text style={styles.value}>{data.cms.plugins.slice(0, 5).join(', ')}</Text>
          </View>
        )}
        {data.cms?.themes && data.cms.themes.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Themes:</Text>
            <Text style={styles.value}>{data.cms.themes.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Social Media */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Media Profiles</Text>
        {data.socialMedia && Object.keys(data.socialMedia).length > 0 ? (
          Object.entries(data.socialMedia).map(([platform, url]) => (
            <View key={platform} style={styles.row}>
              <Text style={styles.label}>{platform}:</Text>
              <Text style={styles.value}>{url as string}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>No social media profiles found</Text>
        )}
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Response Time:</Text>
          <Text style={styles.value}>{data.performance?.responseTime || 0}ms</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Page Size:</Text>
          <Text style={styles.value}>{((data.performance?.pageSize || 0) / 1024).toFixed(2)}KB</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Load Time:</Text>
          <Text style={styles.value}>{data.performance?.loadTime || 0}ms</Text>
        </View>
      </View>

      {/* Page Metadata */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Page Metadata</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Title:</Text>
          <Text style={styles.value}>{data.metadata?.title || 'Not available'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{data.metadata?.description || 'Not available'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Keywords:</Text>
          <Text style={styles.value}>{data.metadata?.keywords || 'Not available'}</Text>
        </View>
        {data.metadata?.author && (
          <View style={styles.row}>
            <Text style={styles.label}>Author:</Text>
            <Text style={styles.value}>{data.metadata.author}</Text>
          </View>
        )}
        {data.metadata?.generator && (
          <View style={styles.row}>
            <Text style={styles.label}>Generator:</Text>
            <Text style={styles.value}>{data.metadata.generator}</Text>
          </View>
        )}
      </View>

      <Text style={styles.footer}>
        Page 2 • Generated by Cipher Suite • {new Date().toLocaleDateString()}
      </Text>
    </Page>

    {/* PAGE 3 */}
    <Page size="A4" style={styles.page}>
      {/* JavaScript Libraries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>JavaScript Libraries ({data.jsLibraries?.length || 0})</Text>
        <Text style={styles.value}>{data.jsLibraries?.join(', ') || 'None detected'}</Text>
      </View>

      {/* Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics Services</Text>
        {data.analytics && data.analytics.length > 0 ? (
          data.analytics.map((analytics: any, idx: number) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{analytics.type}:</Text>
              <Text style={styles.value}>{analytics.id}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>No analytics detected</Text>
        )}
      </View>

      {/* CDN Detection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CDN Detection</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Primary CDN:</Text>
          <Text style={styles.value}>{data.cdn?.provider || 'Not detected'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CDN Resources:</Text>
          <Text style={styles.value}>{data.cdn?.resources?.join(', ') || 'None'}</Text>
        </View>
      </View>

      {/* Robots.txt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Robots.txt</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Exists:</Text>
          <Text style={styles.value}>{data.robots?.exists ? 'Yes' : 'No'}</Text>
        </View>
        {data.robots?.disallowedPaths && data.robots.disallowedPaths.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Disallowed Paths:</Text>
            <Text style={styles.value}>{data.robots.disallowedPaths.slice(0, 5).join(', ')}</Text>
          </View>
        )}
        {data.robots?.sitemaps && data.robots.sitemaps.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Sitemaps:</Text>
            <Text style={styles.value}>{data.robots.sitemaps.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Sitemap.xml */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sitemap.xml</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Exists:</Text>
          <Text style={styles.value}>{data.sitemap?.exists ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>URLs Found:</Text>
          <Text style={styles.value}>{data.sitemap?.urls || 0}</Text>
        </View>
        {data.sitemap?.lastModified && (
          <View style={styles.row}>
            <Text style={styles.label}>Last Modified:</Text>
            <Text style={styles.value}>{data.sitemap.lastModified}</Text>
          </View>
        )}
      </View>

      {/* API Keys */}
      {data.apiKeys && data.apiKeys.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 API Keys Detected ({data.apiKeys.length})</Text>
          {data.apiKeys.map((key: any, idx: number) => (
            <View key={idx} style={styles.issueBox}>
              <View style={{ flexDirection: 'row', marginBottom: 3 }}>
                <Text style={key.severity === 'critical' ? styles.criticalBadge : key.severity === 'high' ? styles.highBadge : styles.mediumBadge}>
                  {key.severity.toUpperCase()}
                </Text>
                <Text style={styles.badge}>{key.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.issueTitle}>{key.type}</Text>
              <Text style={styles.issueText}>Key: {key.key}</Text>
              <Text style={styles.issueText}>Location: {key.location}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Security Issues */}
      {data.securityIssues && data.securityIssues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Issues ({data.securityIssues.length})</Text>
          {data.securityIssues.map((issue: any, idx: number) => (
            <View key={idx} style={styles.issueBox}>
              <Text style={issue.severity === 'critical' ? styles.criticalBadge : issue.severity === 'high' ? styles.highBadge : styles.mediumBadge}>
                {issue.severity.toUpperCase()}
              </Text>
              <Text style={styles.issueTitle}>{issue.type}</Text>
              <Text style={styles.issueText}>{issue.description}</Text>
              <Text style={styles.issueText}>Recommendation: {issue.recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.footer}>
        Page 3 • Generated by Cipher Suite • {new Date().toLocaleDateString()}
      </Text>
    </Page>

    {/* PAGE 4 */}
    <Page size="A4" style={styles.page}>
      {/* Confidential Data Detection */}
      {data.confidentialData && data.confidentialData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Confidential Information Detection ({data.confidentialData.length})</Text>
          {data.confidentialData.map((confData: any, idx: number) => (
            <View key={idx} style={styles.issueBox}>
              <View style={{ flexDirection: 'row', marginBottom: 3 }}>
                <Text style={confData.severity === 'critical' ? styles.criticalBadge : confData.severity === 'high' ? styles.highBadge : styles.mediumBadge}>
                  {confData.severity.toUpperCase()}
                </Text>
                <Text style={styles.badge}>{confData.category}</Text>
                <Text style={confData.status === 'exposed' ? styles.criticalBadge : styles.badge}>
                  {confData.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.issueTitle}>{confData.type}</Text>
              <Text style={styles.issueText}>Count: {confData.count} found</Text>
              <Text style={styles.issueText}>Location: {confData.location}</Text>
              {confData.samples && confData.samples.length > 0 && (
                <Text style={styles.issueText}>Samples (Masked): {confData.samples.join(', ')}</Text>
              )}
              <Text style={styles.issueText}>Recommendation: {confData.recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Email Addresses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Addresses Found ({data.emailAddresses?.length || 0})</Text>
        <Text style={styles.value}>{data.emailAddresses?.join(', ') || 'None found'}</Text>
      </View>

      {/* Subdomains */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discovered Subdomains ({data.subdomains?.length || 0})</Text>
        <Text style={styles.value}>{data.subdomains?.join(', ') || 'None discovered'}</Text>
      </View>

      <Text style={styles.footer}>
        Page 4 • Generated by Cipher Suite • {new Date().toLocaleDateString()} • Confidential Report
      </Text>
    </Page>
  </Document>
);
