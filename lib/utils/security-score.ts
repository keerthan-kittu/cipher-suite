/**
 * Calculate security score based on vulnerabilities found
 * Score ranges from 0-100, where 100 is perfect security
 */

interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface SecurityScore {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  color: string;
}

/**
 * Calculate security score based on vulnerability severity
 * Weights: Critical = -25, High = -15, Medium = -8, Low = -3
 */
export function calculateSecurityScore(summary: VulnerabilitySummary): SecurityScore {
  // Start with perfect score
  let score = 100;

  // Deduct points based on severity
  score -= summary.critical * 25; // Critical vulnerabilities are very serious
  score -= summary.high * 15;     // High vulnerabilities are serious
  score -= summary.medium * 8;    // Medium vulnerabilities are concerning
  score -= summary.low * 3;       // Low vulnerabilities are minor

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine grade and rating
  let grade: SecurityScore['grade'];
  let rating: SecurityScore['rating'];
  let color: string;

  if (score >= 95) {
    grade = 'A+';
    rating = 'Excellent';
    color = '#22c55e'; // Green
  } else if (score >= 85) {
    grade = 'A';
    rating = 'Good';
    color = '#84cc16'; // Lime
  } else if (score >= 70) {
    grade = 'B';
    rating = 'Fair';
    color = '#eab308'; // Yellow
  } else if (score >= 50) {
    grade = 'C';
    rating = 'Poor';
    color = '#f97316'; // Orange
  } else if (score >= 25) {
    grade = 'D';
    rating = 'Critical';
    color = '#ef4444'; // Red
  } else {
    grade = 'F';
    rating = 'Critical';
    color = '#dc2626'; // Dark Red
  }

  return {
    score: Math.round(score),
    grade,
    rating,
    color,
  };
}

/**
 * Get security recommendations based on score
 */
export function getSecurityRecommendations(score: SecurityScore): string[] {
  const recommendations: string[] = [];

  if (score.score < 50) {
    recommendations.push('URGENT: Address all critical and high severity vulnerabilities immediately');
    recommendations.push('Implement a comprehensive security audit and remediation plan');
    recommendations.push('Consider engaging security professionals for assistance');
  } else if (score.score < 70) {
    recommendations.push('Prioritize fixing critical and high severity vulnerabilities');
    recommendations.push('Review and update security policies and configurations');
    recommendations.push('Implement regular security scanning and monitoring');
  } else if (score.score < 85) {
    recommendations.push('Address remaining medium and high severity issues');
    recommendations.push('Maintain regular security updates and patches');
    recommendations.push('Continue monitoring for new vulnerabilities');
  } else if (score.score < 95) {
    recommendations.push('Excellent security posture - maintain current practices');
    recommendations.push('Address minor issues to achieve perfect score');
    recommendations.push('Implement continuous security monitoring');
  } else {
    recommendations.push('Outstanding security implementation!');
    recommendations.push('Maintain current security practices');
    recommendations.push('Stay updated with latest security best practices');
  }

  return recommendations;
}

/**
 * Format score for display
 */
export function formatSecurityScore(score: SecurityScore): string {
  return `${score.score}/100 (${score.grade})`;
}
