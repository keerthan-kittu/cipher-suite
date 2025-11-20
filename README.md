# 🛡️ Cipher Suite - Complete Security Scanning Platform

A comprehensive web-based security scanning and reconnaissance platform with 4 powerful tools for penetration testing, vulnerability assessment, and threat intelligence.

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the platform.

---

## 🔧 Available Security Tools

### 1. 🕵️ RedHawk Intelligence Scanner

**What it does:** Comprehensive reconnaissance and intelligence gathering on target domains.

**Features:**
- DNS record enumeration (A, AAAA, MX, NS, TXT, SOA)
- WHOIS information lookup
- Subdomain discovery
- IP geolocation
- Server fingerprinting
- Technology stack detection
- SSL/TLS certificate analysis

**How to use:**
1. Navigate to Tools → RedHawk Intelligence
2. Enter a domain (e.g., `example.com` or `https://example.com`)
3. Click "Start Intelligence Scan"
4. Wait 20-40 seconds for comprehensive analysis

**Example targets to try:**
- `google.com` - See Google's infrastructure
- `github.com` - Analyze GitHub's setup
- `cloudflare.com` - Check Cloudflare's security
- Your own website

**What you'll get:**
- Complete DNS records
- Domain registration details
- Server location and ISP
- SSL certificate information
- Detected technologies
- Security recommendations

---

### 2. 🔍 Nmap Port Scanner

**What it does:** Network port scanning and service detection using Nmap.

**Features:**
- Port scanning (common ports or custom ranges)
- Service version detection
- Operating system fingerprinting
- Vulnerability detection
- Banner grabbing
- Real-time scan progress

**How to use:**
1. Navigate to Tools → Nmap Scanner
2. Enter target IP or domain (e.g., `192.168.1.1` or `scanme.nmap.org`)
3. Select scan type:
   - **Quick Scan**: Top 100 ports (fast)
   - **Standard Scan**: Top 1000 ports (recommended)
   - **Full Scan**: All 65535 ports (slow)
   - **Custom**: Specify port range
4. Click "Start Scan"

**Example targets to try:**
- `scanme.nmap.org` - Official Nmap test server
- `localhost` or `127.0.0.1` - Scan your own machine
- Your router IP (e.g., `192.168.1.1`)

**What you'll get:**
- Open/closed/filtered ports
- Running services (HTTP, SSH, FTP, etc.)
- Service versions
- Potential vulnerabilities
- Security score

**⚠️ Requirements:**
- Nmap must be installed on your system
- Run `nmap --version` to verify installation
- Install: `brew install nmap` (Mac) or `apt install nmap` (Linux)

---

### 3. 🍯 Honeypot Detection System

**What it does:** Detects if a target is a honeypot/decoy system AND performs comprehensive security assessment.

**Features:**

#### Honeypot Detection:
- HTTP response analysis
- Timing pattern analysis
- Header fingerprinting
- Content pattern matching
- Behavioral analysis
- Known honeypot signature detection

#### Security Assessment:
- HTTPS/SSL certificate validation
- Security header analysis (7 critical headers)
- Cookie security evaluation
- Server information disclosure
- Technology stack detection
- Content analysis (login forms, file uploads, admin panels)
- Vulnerability categorization (Critical/High/Medium/Low)
- Compliance status (GDPR, PCI DSS, OWASP)
- Overall security score (0-100) with letter grade

**How to use:**
1. Navigate to Tools → Honeypot Detection
2. Enter target URL (e.g., `http://example.com` or `https://example.com`)
3. Click "Start Detection Scan"
4. Review both honeypot status AND security assessment

**Example targets to try:**
- `http://httpforever.com` - Insecure HTTP site
- `https://google.com` - Secure site with good headers
- `https://github.com` - Well-secured platform
- `http://testphp.vulnweb.com` - Intentionally vulnerable site

**What you'll get:**

**Honeypot Detection:**
- Is it a honeypot? (Yes/No)
- Confidence level (0-100%)
- Risk level (Critical/High/Medium/Low)
- Detected indicators
- Behavioral anomalies

**Security Assessment:**
- Overall security score (0-100)
- Security grade (A+ to F)
- Security level (Excellent/Good/Fair/Poor/Critical)
- HTTPS status
- Missing security headers
- Cookie security issues
- Detected vulnerabilities with remediation steps
- Server & technology information
- Content analysis results
- Compliance status
- Risk factors
- Positive security findings
- Actionable recommendations

---

### 4. 🔐 VulnerCipher Scanner

**What it does:** Advanced vulnerability scanning and cipher suite analysis.

**Features:**
- SSL/TLS vulnerability detection
- Weak cipher identification
- Certificate validation
- Protocol version checking
- Common web vulnerabilities
- Security misconfigurations
- Detailed remediation guidance

**How to use:**
1. Navigate to Tools → VulnerCipher
2. Enter target URL (e.g., `https://example.com`)
3. Click "Start Vulnerability Scan"
4. Review detected vulnerabilities

**Example targets to try:**
- `https://badssl.com` - Various SSL/TLS issues
- `https://expired.badssl.com` - Expired certificate
- `https://self-signed.badssl.com` - Self-signed cert
- Your own HTTPS website

**What you'll get:**
- SSL/TLS vulnerabilities
- Weak ciphers
- Certificate issues
- Protocol weaknesses
- Security recommendations
- Compliance status

---

## 📊 Reports & Export

All scans automatically save to the Reports page:

1. Navigate to **Reports** in the header
2. View all past scans
3. Filter by tool type
4. Export individual reports as PDF
5. Delete old reports

**PDF Reports include:**
- Complete scan results
- Detailed findings
- Vulnerability analysis
- Remediation steps
- Executive summary

---

## 🎯 Common Use Cases

### 1. **Website Security Audit**
```
Step 1: Run RedHawk → Get domain info & technologies
Step 2: Run Honeypot Detection → Check security posture
Step 3: Run VulnerCipher → Find SSL/TLS issues
Step 4: Run Nmap → Discover open ports
```

### 2. **Penetration Testing**
```
Step 1: Run Nmap → Map network & services
Step 2: Run RedHawk → Gather intelligence
Step 3: Run VulnerCipher → Find vulnerabilities
Step 4: Run Honeypot Detection → Verify it's not a trap
```

### 3. **Security Compliance Check**
```
Step 1: Run Honeypot Detection → Get security score
Step 2: Check compliance status (GDPR, PCI DSS, OWASP)
Step 3: Review missing security headers
Step 4: Export PDF report for documentation
```

### 4. **Bug Bounty Reconnaissance**
```
Step 1: Run RedHawk → Subdomain discovery
Step 2: Run Nmap → Port scanning
Step 3: Run Honeypot Detection → Avoid honeypots
Step 4: Run VulnerCipher → Find vulnerabilities
```

---

## 🧪 Test Targets

### Safe & Legal Test Sites:

**For Nmap:**
- `scanme.nmap.org` - Official Nmap test server
- `localhost` - Your own machine

**For Web Scanning:**
- `http://testphp.vulnweb.com` - Vulnerable web app
- `http://testhtml5.vulnweb.com` - HTML5 test site
- `http://testasp.vulnweb.com` - ASP test site
- `https://badssl.com` - SSL/TLS testing

**For SSL/TLS Testing:**
- `https://expired.badssl.com` - Expired certificate
- `https://wrong.host.badssl.com` - Wrong hostname
- `https://self-signed.badssl.com` - Self-signed cert
- `https://untrusted-root.badssl.com` - Untrusted root

**Production Sites (Read-only):**
- `google.com` - Well-secured
- `github.com` - Good security
- `cloudflare.com` - Excellent security

---

## ⚠️ Legal & Ethical Guidelines

### ✅ DO:
- Test your own websites and servers
- Use official test sites (scanme.nmap.org, badssl.com, etc.)
- Get written permission before testing
- Follow responsible disclosure
- Use for educational purposes

### ❌ DON'T:
- Scan sites without permission
- Exploit found vulnerabilities
- Perform DoS attacks
- Access unauthorized systems
- Violate terms of service

**Legal Notice:** Unauthorized scanning may violate laws including the Computer Fraud and Abuse Act (CFAA) and similar regulations worldwide. Always obtain explicit permission before testing.

---

## 🔍 Understanding Results

### Security Scores

**Honeypot Detection:**
- **0-20%**: Likely legitimate
- **20-35%**: Some suspicious indicators
- **35-60%**: High probability honeypot
- **60%+**: Almost certainly a honeypot

**Security Assessment:**
- **90-100 (A+/A)**: Excellent security
- **75-89 (B)**: Good security
- **60-74 (C)**: Fair security
- **40-59 (D)**: Poor security
- **0-39 (F)**: Critical security issues

### Vulnerability Severity

- **Critical**: Immediate action required (e.g., no HTTPS on login)
- **High**: Serious issue (e.g., missing CSP header)
- **Medium**: Should be fixed (e.g., missing HttpOnly flag)
- **Low**: Best practice (e.g., server version disclosure)

---

## 🛠️ Troubleshooting

### Nmap not working?
```bash
# Check if Nmap is installed
nmap --version

# Install Nmap
# Mac:
brew install nmap

# Linux:
sudo apt install nmap

# Windows:
# Download from https://nmap.org/download.html
```

### Scans timing out?
- Increase timeout in scan settings
- Check firewall settings
- Verify target is reachable
- Try a different network

### No results showing?
- Check browser console for errors
- Verify target format (include http:// or https://)
- Ensure target is accessible
- Check if target blocks scanners

---

## 📚 Additional Resources

### Learn More:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Nmap Documentation](https://nmap.org/book/man.html)
- [SSL Labs](https://www.ssllabs.com/)
- [Security Headers](https://securityheaders.com/)

### Tools Used:
- Nmap - Network scanning
- Node.js - Backend runtime
- Next.js - Frontend framework
- React PDF - Report generation

---

## 🤝 Contributing

Found a bug or want to add features? Contributions welcome!

---

## 📄 License

This tool is for educational and authorized testing only. Use responsibly.

---

## 🎓 Educational Purpose

This platform is designed for:
- Security professionals
- Penetration testers
- Bug bounty hunters
- Students learning cybersecurity
- System administrators
- DevOps engineers

**Remember:** With great power comes great responsibility. Always use these tools ethically and legally.
