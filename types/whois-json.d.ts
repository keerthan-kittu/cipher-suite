declare module 'whoiser' {
  interface WhoisOptions {
    timeout?: number;
    follow?: number;
    raw?: boolean;
    ignorePrivacy?: boolean;
  }

  interface WhoisSearchResult {
    [key: string]: any;
  }

  export function whoisDomain(domain: string, options?: WhoisOptions): Promise<WhoisSearchResult>;
  export function whoisIp(ip: string, options?: WhoisOptions): Promise<WhoisSearchResult>;
  export function whoisAsn(asn: number, options?: WhoisOptions): Promise<WhoisSearchResult>;
  export function whoisTld(tld: string, options?: WhoisOptions): Promise<WhoisSearchResult>;
  export function whoisQuery(server: string, query: string, options?: WhoisOptions): Promise<WhoisSearchResult>;
  export function firstResult(result: WhoisSearchResult): any;
}
