/**
 * WHOIS Service
 * Provides domain WHOIS lookup functionality
 */

import { whoisDomain } from 'whoiser';

export interface WhoisData {
  registrar?: string;
  createdDate?: string;
  expiryDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  status?: string[];
  registrantOrganization?: string;
  registrantCountry?: string;
}

export class WhoisService {
  /**
   * Performs a WHOIS lookup for a domain
   */
  async lookup(domain: string): Promise<WhoisData> {
    try {
      // Remove protocol and path if present
      const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
      
      // Perform WHOIS lookup with whoiser
      const result = await whoisDomain(cleanDomain, { 
        timeout: 10000,
        follow: 2 // Follow up to 2 referrals
      });
      
      // Always log the raw result to help debug
      console.log('=== WHOIS RAW RESULT for', cleanDomain, '===');
      console.log(JSON.stringify(result, null, 2));
      console.log('=== END WHOIS RAW RESULT ===');
      
      // Parse the result
      const parsed = this.parseWhoisResult(result, cleanDomain);
      
      console.log('=== WHOIS PARSED RESULT ===');
      console.log(JSON.stringify(parsed, null, 2));
      console.log('=== END WHOIS PARSED RESULT ===');
      
      return parsed;
    } catch (error) {
      console.error('WHOIS lookup error:', error);
      // Return empty data on error instead of throwing
      return {};
    }
  }

  /**
   * Parses WHOIS result into standardized format
   */
  private parseWhoisResult(result: any, domain: string): WhoisData {
    const whoisData: WhoisData = {};

    // whoiser returns data organized by registry
    // Common keys: domain TLD, "whois.iana.org", registrar whois server
    // We need to find the most detailed record
    
    let detailedData: any = null;
    
    // Look for the most detailed record (usually has the most keys)
    let maxKeys = 0;
    for (const key of Object.keys(result)) {
      const record = result[key];
      if (typeof record === 'object' && record !== null) {
        const keyCount = Object.keys(record).length;
        if (keyCount > maxKeys) {
          maxKeys = keyCount;
          detailedData = record;
        }
      }
    }

    if (!detailedData) {
      return whoisData;
    }

    // Log for debugging
    if (process.env.ENABLE_DEBUG_LOGGING === 'true') {
      console.log('WHOIS parsed data keys:', Object.keys(detailedData));
      console.log('WHOIS full data:', JSON.stringify(detailedData, null, 2));
    }

    // Helper function to find value with multiple possible keys (case-insensitive)
    const findValue = (obj: any, possibleKeys: string[]): any => {
      // First try exact match (case-insensitive)
      for (const searchKey of possibleKeys) {
        for (const objKey of Object.keys(obj)) {
          if (objKey.toLowerCase() === searchKey.toLowerCase()) {
            const value = obj[objKey];
            if (value !== null && value !== undefined && value !== '') {
              console.log(`Found exact match: ${objKey} = ${value}`);
              return value;
            }
          }
        }
      }
      
      // Then try partial match (remove spaces and special chars)
      for (const searchKey of possibleKeys) {
        const normalizedSearch = searchKey.toLowerCase().replace(/[^a-z]/g, '');
        for (const objKey of Object.keys(obj)) {
          const normalizedKey = objKey.toLowerCase().replace(/[^a-z]/g, '');
          if (normalizedKey === normalizedSearch || normalizedKey.includes(normalizedSearch)) {
            const value = obj[objKey];
            if (value !== null && value !== undefined && value !== '') {
              console.log(`Found partial match: ${objKey} = ${value}`);
              return value;
            }
          }
        }
      }
      
      console.log(`No match found for keys: ${possibleKeys.join(', ')}`);
      return undefined;
    };

    // Registrar
    console.log('Looking for Registrar...');
    whoisData.registrar = findValue(detailedData, [
      'Registrar', // Exact match from whoiser
      'Registrar Name',
      'RegistrarName',
      'Sponsoring Registrar',
      'SponsoringRegistrar',
      'Registrar Organization',
      'RegistrarOrganization',
      'registrar'
    ]);

    // Created Date
    console.log('Looking for Created Date...');
    whoisData.createdDate = this.parseDate(
      findValue(detailedData, [
        'Created Date', // Exact match from whoiser
        'Creation Date',
        'CreationDate',
        'CreatedDate',
        'Created',
        'Domain Registration Date',
        'DomainRegistrationDate',
        'Registration Time',
        'RegistrationTime',
        'Registered',
        'Registration Date',
        'RegistrationDate',
        'created'
      ])
    );

    // Expiry Date
    console.log('Looking for Expiry Date...');
    whoisData.expiryDate = this.parseDate(
      findValue(detailedData, [
        'Expiry Date', // Exact match from whoiser
        'Registry Expiry Date',
        'RegistryExpiryDate',
        'Registrar Registration Expiration Date',
        'RegistrarRegistrationExpirationDate',
        'ExpiryDate',
        'Expires',
        'Domain Expiration Date',
        'DomainExpirationDate',
        'Expiration Time',
        'ExpirationTime',
        'Expiration Date',
        'ExpirationDate',
        'Expiration',
        'expires'
      ])
    );

    // Updated Date
    console.log('Looking for Updated Date...');
    whoisData.updatedDate = this.parseDate(
      findValue(detailedData, [
        'Updated Date', // Exact match from whoiser
        'UpdatedDate',
        'Last Updated',
        'LastUpdated',
        'Updated',
        'Domain Last Updated Date',
        'DomainLastUpdatedDate',
        'Modified',
        'Last Modified',
        'LastModified',
        'Changed Date',
        'ChangedDate',
        'updated'
      ])
    );

    // Name Servers
    const nameServers = findValue(detailedData, [
      'NameServer',
      'NameServers',
      'nserver',
      'DNS',
      'ns'
    ]);
    
    if (Array.isArray(nameServers)) {
      whoisData.nameServers = nameServers
        .map((ns: any) => {
          const nsStr = typeof ns === 'string' ? ns : String(ns);
          return nsStr.toLowerCase().trim().split(' ')[0]; // Remove any extra info
        })
        .filter(ns => ns.length > 0 && ns.includes('.'));
    } else if (typeof nameServers === 'string') {
      whoisData.nameServers = [nameServers.toLowerCase().trim().split(' ')[0]];
    }

    // Status
    const status = findValue(detailedData, [
      'DomainStatus',
      'Status',
      'state'
    ]);
    
    if (Array.isArray(status)) {
      whoisData.status = status.map((s: any) => String(s).trim());
    } else if (typeof status === 'string') {
      whoisData.status = [status.trim()];
    }

    // Registrant info
    whoisData.registrantOrganization = findValue(detailedData, [
      'RegistrantOrganization',
      'Registrant',
      'Organization',
      'RegistrantName',
      'org'
    ]);

    whoisData.registrantCountry = findValue(detailedData, [
      'RegistrantCountry',
      'Country',
      'RegistrantCountryCode'
    ]);

    return whoisData;
  }

  /**
   * Parses and formats date strings
   */
  private parseDate(dateValue: any): string | undefined {
    if (!dateValue) return undefined;

    try {
      // Handle array of dates (take first one)
      if (Array.isArray(dateValue)) {
        dateValue = dateValue[0];
      }

      if (!dateValue) return undefined;

      // Convert to string and clean up
      let dateStr = String(dateValue).trim();
      
      // Remove common suffixes like " (YYYY-MM-DD)" or timezone info
      dateStr = dateStr.split('(')[0].trim();
      dateStr = dateStr.split('[')[0].trim();
      
      // Try to parse the date
      const date = new Date(dateStr);
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        // Try alternative parsing for formats like "DD-MMM-YYYY"
        const altFormats = [
          // Try ISO format variations
          /(\d{4})-(\d{2})-(\d{2})/,
          // Try DD-MMM-YYYY format
          /(\d{2})-([A-Za-z]{3})-(\d{4})/,
          // Try YYYY.MM.DD format
          /(\d{4})\.(\d{2})\.(\d{2})/,
        ];

        for (const regex of altFormats) {
          const match = dateStr.match(regex);
          if (match) {
            const altDate = new Date(dateStr.replace(/\./g, '-'));
            if (!isNaN(altDate.getTime())) {
              return altDate.toISOString().split('T')[0];
            }
          }
        }
        
        return undefined;
      }

      // Return in ISO format (YYYY-MM-DD)
      return date.toISOString().split('T')[0];
    } catch (error) {
      if (process.env.ENABLE_DEBUG_LOGGING === 'true') {
        console.log('Date parsing error:', error, 'for value:', dateValue);
      }
      return undefined;
    }
  }

  /**
   * Checks if WHOIS data is available for a domain
   */
  async isAvailable(domain: string): Promise<boolean> {
    try {
      const data = await this.lookup(domain);
      return !data.registrar; // If no registrar, domain might be available
    } catch {
      return false;
    }
  }
}
