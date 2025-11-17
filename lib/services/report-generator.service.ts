import { renderToBuffer } from '@react-pdf/renderer';
import { ReportGenerationRequest, VulnercipherReportData } from '../types/report';
import { VulnercipherReport } from '../templates/vulnercipher-report.template';
import React from 'react';

export class ReportGeneratorService {
  async generatePDF(request: ReportGenerationRequest): Promise<Buffer> {
    // Validate scan data
    this.validateScanData(request.scanType, request.scanData);

    // Apply filters if provided
    const filteredData = this.applyFilters(request.scanData, request.options);

    // Select and render template
    const template = this.selectTemplate(request.scanType, filteredData);

    // Render PDF
    return await this.renderPDF(template);
  }

  private validateScanData(scanType: string, data: any): void {
    if (!data) {
      throw new Error('Scan data is required');
    }

    if (!data.scanDate) {
      throw new Error('Scan date is required');
    }

    switch (scanType) {
      case 'vulnercipher':
        if (!data.target) {
          throw new Error('Target is required for vulnerability scan data');
        }
        if (!Array.isArray(data.vulnerabilities)) {
          throw new Error('Vulnerabilities must be an array');
        }
        if (!data.summary || typeof data.summary !== 'object') {
          throw new Error('Summary is required and must be an object');
        }
        break;
      
      case 'nmap':
        if (!data.host) {
          throw new Error('Host is required for NMap scan data');
        }
        break;
      
      case 'honeypot':
        if (!data.target) {
          throw new Error('Target is required for honeypot scan data');
        }
        break;
      
      case 'redhawk':
        if (!data.domain) {
          throw new Error('Domain is required for RedHawk scan data');
        }
        break;
      
      default:
        throw new Error(`Unsupported scan type: ${scanType}`);
    }
  }

  private applyFilters(data: any, options?: ReportGenerationRequest['options']): any {
    if (!options) {
      return data;
    }

    const filteredData = { ...data };

    // Apply severity filter for vulnerability scans
    if (options.severityFilter && Array.isArray(options.severityFilter) && options.severityFilter.length > 0) {
      if (filteredData.vulnerabilities) {
        filteredData.vulnerabilities = filteredData.vulnerabilities.filter((vuln: any) =>
          options.severityFilter!.includes(vuln.severity)
        );

        // Recalculate summary
        if (filteredData.summary) {
          filteredData.summary = {
            total: filteredData.vulnerabilities.length,
            critical: filteredData.vulnerabilities.filter((v: any) => v.severity === 'critical').length,
            high: filteredData.vulnerabilities.filter((v: any) => v.severity === 'high').length,
            medium: filteredData.vulnerabilities.filter((v: any) => v.severity === 'medium').length,
            low: filteredData.vulnerabilities.filter((v: any) => v.severity === 'low').length,
          };
        }
      }
    }

    // Remove recommendations if not included
    if (options.includeRecommendations === false && filteredData.vulnerabilities) {
      filteredData.vulnerabilities = filteredData.vulnerabilities.map((vuln: any) => ({
        ...vuln,
        recommendation: '',
      }));
    }

    return filteredData;
  }

  private selectTemplate(scanType: string, data: any): React.ReactElement {
    // Get appropriate title and labels for each scan type
    const config = {
      vulnercipher: {
        title: 'Vulnerability Scan Report',
        findingsLabel: 'vulnerabilities'
      },
      nmap: {
        title: 'Network Scan Report',
        findingsLabel: 'findings'
      },
      honeypot: {
        title: 'Honeypot Detection Report',
        findingsLabel: 'indicators'
      },
      redhawk: {
        title: 'Intelligence Gathering Report',
        findingsLabel: 'findings'
      },
    };

    switch (scanType) {
      case 'vulnercipher':
        return React.createElement(VulnercipherReport, { 
          data: data as VulnercipherReportData,
          title: config.vulnercipher.title,
          findingsLabel: config.vulnercipher.findingsLabel
        });
      
      case 'nmap':
      case 'honeypot':
      case 'redhawk':
        // For now, use the Vulnercipher template as a generic template
        // TODO: Create specific templates for each scan type
        return React.createElement(VulnercipherReport, { 
          data: this.convertToGenericFormat(scanType, data),
          title: config[scanType as keyof typeof config].title,
          findingsLabel: config[scanType as keyof typeof config].findingsLabel
        });
      
      default:
        throw new Error(`No template available for scan type: ${scanType}`);
    }
  }

  private convertToGenericFormat(scanType: string, data: any): VulnercipherReportData {
    // Convert other scan types to a format compatible with the Vulnercipher template
    // This is a temporary solution until specific templates are created
    
    const scanDate = data.scanDate || new Date().toISOString();
    
    switch (scanType) {
      case 'nmap':
        return {
          target: data.host || 'Unknown',
          scanDate,
          vulnerabilities: data.openPorts?.map((port: any, index: number) => ({
            id: `port-${port.port}`,
            severity: port.state === 'open' ? 'medium' : 'low',
            title: `Port ${port.port} (${port.service})`,
            description: `${port.protocol.toUpperCase()} port ${port.port} is ${port.state}`,
            affected: `${port.service} - ${port.version}`,
            recommendation: port.state === 'open' 
              ? `Review if port ${port.port} needs to be publicly accessible`
              : 'Monitor this port for changes'
          })) || [],
          summary: {
            total: data.openPorts?.length || 0,
            critical: 0,
            high: 0,
            medium: data.openPorts?.filter((p: any) => p.state === 'open').length || 0,
            low: data.openPorts?.filter((p: any) => p.state !== 'open').length || 0,
          }
        };
      
      case 'honeypot':
        return {
          target: data.target || 'Unknown',
          scanDate,
          vulnerabilities: data.indicators?.map((indicator: any, index: number) => ({
            id: `indicator-${index}`,
            severity: indicator.severity,
            title: indicator.type,
            description: indicator.description,
            affected: 'Target System',
            recommendation: indicator.detected 
              ? 'This indicator suggests honeypot characteristics'
              : 'No issues detected for this indicator'
          })) || [],
          summary: {
            total: data.indicators?.length || 0,
            critical: data.isHoneypot ? 1 : 0,
            high: data.indicators?.filter((i: any) => i.severity === 'high' && i.detected).length || 0,
            medium: data.indicators?.filter((i: any) => i.severity === 'medium' && i.detected).length || 0,
            low: data.indicators?.filter((i: any) => i.severity === 'low' && i.detected).length || 0,
          }
        };
      
      case 'redhawk':
        const findings = [];
        
        // Add DNS findings
        if (data.dns) {
          Object.entries(data.dns).forEach(([type, records]: [string, any]) => {
            if (Array.isArray(records) && records.length > 0) {
              findings.push({
                id: `dns-${type}`,
                severity: 'low' as const,
                title: `${type} DNS Records`,
                description: `Found ${records.length} ${type} record(s)`,
                affected: 'DNS Configuration',
                recommendation: records.join(', ')
              });
            }
          });
        }
        
        // Add technology findings
        if (data.technologies && data.technologies.length > 0) {
          findings.push({
            id: 'technologies',
            severity: 'medium' as const,
            title: 'Detected Technologies',
            description: `${data.technologies.length} technologies identified`,
            affected: 'Web Stack',
            recommendation: data.technologies.join(', ')
          });
        }
        
        // Add subdomain findings
        if (data.subdomains && data.subdomains.length > 0) {
          findings.push({
            id: 'subdomains',
            severity: 'low' as const,
            title: 'Discovered Subdomains',
            description: `${data.subdomains.length} subdomains found`,
            affected: 'Domain Infrastructure',
            recommendation: data.subdomains.join(', ')
          });
        }
        
        return {
          target: data.domain || 'Unknown',
          scanDate,
          vulnerabilities: findings,
          summary: {
            total: findings.length,
            critical: 0,
            high: 0,
            medium: findings.filter(f => f.severity === 'medium').length,
            low: findings.filter(f => f.severity === 'low').length,
          }
        };
      
      default:
        return {
          target: 'Unknown',
          scanDate,
          vulnerabilities: [],
          summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
        };
    }
  }

  private async renderPDF(template: React.ReactElement): Promise<Buffer> {
    try {
      const buffer = await renderToBuffer(template);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to render PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
