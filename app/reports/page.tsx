'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Report {
  id: string;
  tool: string;
  target: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  findings: number;
}

export default function ReportsPage() {
  const [filter, setFilter] = useState('all');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              setVisibleSections((prev) => new Set(prev).add(sectionId));
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Fetch reports from API
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        
        if (data.success && data.reports) {
          // Format dates for display
          const formattedReports = data.reports.map((report: any) => ({
            ...report,
            date: new Date(report.date).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
          setReports(formattedReports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.textContent = 'Failed to load reports';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    };

    fetchReports();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchReports, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowViewModal(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleDownloadPDF = async (report: Report) => {
    try {
      // Create a temporary notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = `Generating ${report.tool} report...`;
      document.body.appendChild(notification);

      // Call the PDF generation API
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: report.id,
          tool: report.tool.toLowerCase().replace(/\s+/g, '-'),
          target: report.target,
          findings: report.findings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.tool.toLowerCase().replace(/\s+/g, '-')}-report-${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update notification
      notification.textContent = 'Download complete!';
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      
      setTimeout(() => {
        notification.remove();
      }, 2000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorNotification.textContent = 'Failed to download PDF. Please try again.';
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.remove(), 3000);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/reports?id=${reportId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Remove from local state
          setReports(prevReports => prevReports.filter(r => r.id !== reportId));
          
          // Show success notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
          notification.textContent = 'Report deleted successfully';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        } else {
          throw new Error(data.error || 'Failed to delete report');
        }
      } catch (error) {
        console.error('Error deleting report:', error);
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.textContent = 'Failed to delete report';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    }
  };

  const closeModal = () => {
    setShowViewModal(false);
    setSelectedReport(null);
    document.body.style.overflow = 'auto';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-primary bg-primary/10 border-green-500/20';
      case 'pending': return 'text-primary bg-primary/10 border-yellow-500/20';
      case 'failed': return 'text-primary bg-primary/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.tool.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4 animate-fade-in stagger-1">
                  <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 animate-float">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary">Scan Reports</h1>
                    <p className="text-white/60 mt-1">View and manage your security scan reports</p>
                  </div>
                </div>

                <div
                  data-section="reports-table"
                  className={`bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-glow-sm hover-lift transition-all duration-700 ${
                    visibleSections.has('reports-table') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('reports-table') ? '0.1s' : '0s' }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      <h2 className="text-xl font-bold text-white">Recent Reports</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-primary/20 bg-surface-dark text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:border-primary/40"
                      >
                        <option value="all">All Tools</option>
                        <option value="vulnercipher">Vulnercipher</option>
                        <option value="nmap">NMap</option>
                        <option value="redhawk">RedHawk</option>
                        <option value="honeypot">Honeypot Detection</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {filteredReports.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">No Reports Found</h3>
                        <p className="text-white/60 mb-6">
                          {filter === 'all' 
                            ? 'Start scanning to generate your first report' 
                            : `No ${filter} reports found. Try a different filter.`}
                        </p>
                        <a
                          href="/tools"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/80 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Start New Scan
                        </a>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/20">
                            <th className="text-left py-4 px-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Tool</th>
                            <th className="text-left py-4 px-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Target</th>
                            <th className="text-left py-4 px-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Date</th>
                            <th className="text-left py-4 px-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Status</th>
                            <th className="text-left py-4 px-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Findings</th>
                            <th className="text-left py-4 px-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {filteredReports.map((report, idx) => (
                          <tr
                            key={report.id}
                            className="border-b border-white/5 hover:bg-surface-dark transition-all duration-200 group"
                            style={{
                              animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s forwards`,
                              opacity: 0,
                            }}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {report.tool === 'Vulnercipher' && (
                                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                  </svg>
                                )}
                                {report.tool === 'NMap' && (
                                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                                  </svg>
                                )}
                                {report.tool === 'RedHawk' && (
                                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                  </svg>
                                )}
                                {report.tool === 'Honeypot Detection' && (
                                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                                  </svg>
                                )}
                                <span className="text-white font-medium">{report.tool}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <code className="text-white/60 font-mono text-xs bg-surface-dark px-2 py-1 rounded">
                                {report.target}
                              </code>
                            </td>
                            <td className="py-4 px-4 text-white/60 text-xs">{report.date}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)} capitalize`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-primary font-bold text-base">{report.findings}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 transition-opacity">
                                <button
                                  onClick={() => handleViewReport(report)}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-white/60 hover:text-primary transition-all"
                                  title="View Report"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDownloadPDF(report)}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-white/60 hover:text-primary transition-all"
                                  title="Download PDF"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-500 transition-all"
                                  title="Delete Report"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div
                    data-section="stat-1"
                    className={`p-6 rounded-xl bg-surface-elevated border border-primary/20 shadow-glow-sm hover-lift transition-all duration-700 ${
                      visibleSections.has('stat-1') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                    }`}
                    style={{ transitionDelay: visibleSections.has('stat-1') ? '0.1s' : '0s' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                      <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">Total Reports</div>
                    </div>
                    <div className="text-4xl font-bold text-primary">{reports.length}</div>
                  </div>
                  <div
                    data-section="stat-2"
                    className={`p-6 rounded-xl bg-surface-elevated border border-primary/20 shadow-glow-sm hover-lift transition-all duration-700 ${
                      visibleSections.has('stat-2') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                    style={{ transitionDelay: visibleSections.has('stat-2') ? '0.2s' : '0s' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">Completed</div>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {reports.filter((r) => r.status === 'completed').length}
                    </div>
                  </div>
                  <div
                    data-section="stat-3"
                    className={`p-6 rounded-xl bg-surface-elevated border border-primary/20 shadow-glow-sm hover-lift transition-all duration-700 ${
                      visibleSections.has('stat-3') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                    }`}
                    style={{ transitionDelay: visibleSections.has('stat-3') ? '0.3s' : '0s' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">Total Findings</div>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {reports.reduce((sum, r) => sum + r.findings, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <Footer />

            {/* View Report Modal */}
          {showViewModal && selectedReport && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
              <div className="bg-surface-elevated border border-primary/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-glow-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="sticky top-0 bg-surface-elevated border-b border-primary/20 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Report Details</h2>
                    <p className="text-sm text-white/60 mt-1">{selectedReport.tool} Scan Report</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg hover:bg-surface-dark text-white/60 hover:text-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Report Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-surface-dark border border-primary/10">
                      <div className="text-xs text-white/60 mb-1">Tool</div>
                      <div className="text-lg font-bold text-white">{selectedReport.tool}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-surface-dark border border-primary/10">
                      <div className="text-xs text-white/60 mb-1">Status</div>
                      <div className={`text-lg font-bold capitalize ${
                        selectedReport.status === 'completed' ? 'text-green-500' :
                        selectedReport.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                      }`}>{selectedReport.status}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-surface-dark border border-primary/10">
                      <div className="text-xs text-white/60 mb-1">Target</div>
                      <div className="text-sm font-mono text-white break-all">{selectedReport.target}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-surface-dark border border-primary/10">
                      <div className="text-xs text-white/60 mb-1">Scan Date</div>
                      <div className="text-sm text-white">{selectedReport.date}</div>
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Findings</h3>
                      <span className="text-3xl font-bold text-primary">{selectedReport.findings}</span>
                    </div>
                    <p className="text-sm text-white/60">
                      This scan identified {selectedReport.findings} {selectedReport.findings === 1 ? 'issue' : 'issues'} that {selectedReport.findings === 1 ? 'requires' : 'require'} attention.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleDownloadPDF(selectedReport);
                        closeModal();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/80 transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                      Download PDF
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteReport(selectedReport.id);
                        closeModal();
                      }}
                      className="px-6 py-3 rounded-lg bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all border border-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
