/**
 * Utility functions for storing and managing scan reports
 */

export interface ScanReport {
  tool: string;
  target: string;
  findings: number;
  data?: any;
}

/**
 * Save a scan result as a report
 */
export async function saveScanReport(report: ScanReport): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, reportId: data.report.id };
    } else {
      return { success: false, error: data.error || 'Failed to save report' };
    }
  } catch (error) {
    console.error('Error saving report:', error);
    return { success: false, error: 'Network error while saving report' };
  }
}

/**
 * Fetch all reports
 */
export async function fetchReports(): Promise<{ success: boolean; reports?: any[]; error?: string }> {
  try {
    const response = await fetch('/api/reports');
    const data = await response.json();

    if (data.success) {
      return { success: true, reports: data.reports };
    } else {
      return { success: false, error: data.error || 'Failed to fetch reports' };
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: 'Network error while fetching reports' };
  }
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/reports?id=${reportId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to delete report' };
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    return { success: false, error: 'Network error while deleting report' };
  }
}
