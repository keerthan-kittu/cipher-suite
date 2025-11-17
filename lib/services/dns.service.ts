/**
 * DNS Service
 * Provides DNS lookup functionality
 */

import { promises as dns } from 'dns';

export interface DnsRecords {
  A?: string[];
  AAAA?: string[];
  MX?: string[];
  NS?: string[];
  TXT?: string[];
  CNAME?: string;
  SOA?: {
    nsname: string;
    hostmaster: string;
    serial: number;
    refresh: number;
    retry: number;
    expire: number;
    minttl: number;
  };
}

export class DnsService {
  /**
   * Performs comprehensive DNS lookup for a domain
   */
  async lookup(domain: string): Promise<DnsRecords> {
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    const records: DnsRecords = {};

    // Lookup A records (IPv4)
    try {
      const aRecords = await dns.resolve4(cleanDomain);
      if (Array.isArray(aRecords) && aRecords.length > 0) {
        records.A = aRecords;
      }
    } catch (error) {
      // A records not found or error
    }

    // Lookup AAAA records (IPv6)
    try {
      const aaaaRecords = await dns.resolve6(cleanDomain);
      if (Array.isArray(aaaaRecords) && aaaaRecords.length > 0) {
        records.AAAA = aaaaRecords;
      }
    } catch (error) {
      // AAAA records not found or error
    }

    // Lookup MX records (Mail Exchange)
    try {
      const mxRecords = await dns.resolveMx(cleanDomain);
      if (Array.isArray(mxRecords) && mxRecords.length > 0) {
        records.MX = mxRecords
          .sort((a, b) => a.priority - b.priority)
          .map(mx => `${mx.exchange} (priority: ${mx.priority})`);
      }
    } catch (error) {
      // MX records not found or error
    }

    // Lookup NS records (Name Servers)
    try {
      const nsRecords = await dns.resolveNs(cleanDomain);
      if (Array.isArray(nsRecords) && nsRecords.length > 0) {
        records.NS = nsRecords;
      }
    } catch (error) {
      // NS records not found or error
    }

    // Lookup TXT records
    try {
      const txtRecords = await dns.resolveTxt(cleanDomain);
      if (Array.isArray(txtRecords) && txtRecords.length > 0) {
        records.TXT = txtRecords.map(record => 
          Array.isArray(record) ? record.join('') : String(record)
        );
      }
    } catch (error) {
      // TXT records not found or error
    }

    // Lookup CNAME record
    try {
      const cnameRecords = await dns.resolveCname(cleanDomain);
      if (Array.isArray(cnameRecords) && cnameRecords.length > 0) {
        records.CNAME = cnameRecords[0];
      }
    } catch (error) {
      // CNAME not found or error (most domains don't have CNAME at root)
    }

    // Lookup SOA record
    try {
      const soaRecord = await dns.resolveSoa(cleanDomain);
      records.SOA = soaRecord;
    } catch (error) {
      // SOA not found or error
    }

    return records;
  }

  /**
   * Performs reverse DNS lookup for an IP address
   */
  async reverseLookup(ip: string): Promise<string[]> {
    try {
      return await dns.reverse(ip);
    } catch (error) {
      return [];
    }
  }

  /**
   * Resolves a hostname to IP addresses
   */
  async resolveHostname(hostname: string): Promise<string[]> {
    try {
      const addresses = await dns.resolve4(hostname);
      return addresses;
    } catch (error) {
      // Try IPv6 if IPv4 fails
      try {
        return await dns.resolve6(hostname);
      } catch {
        return [];
      }
    }
  }

  /**
   * Checks if a domain has specific DNS records
   */
  async hasRecordType(domain: string, recordType: keyof DnsRecords): Promise<boolean> {
    const records = await this.lookup(domain);
    return !!records[recordType];
  }
}
