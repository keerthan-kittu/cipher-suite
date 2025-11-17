'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Description, Download, Visibility, Delete, FilterList } from '@mui/icons-material';

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

  const mockReports: Report[] = [
    {
      id: '1',
      tool: 'Vulnercipher',
      target: 'https://example.com',
      date: '2024-11-10 14:30',
      status: 'completed',
      findings: 4
    },
    {
      id: '2',
      tool: 'NMap',
      target: '192.168.1.1',
      date: '2024-11-10 13:15',
      status: 'completed',
      findings: 5
    },
    {
      id: '3',
      tool: 'RedHawk',
      target: 'example.com',
      date: '2024-11-10 12:00',
      status: 'completed',
      findings: 0
    },
    {
      id: '4',
      tool: 'Honeypot Detection',
      target: '192.168.1.100',
      date: '2024-11-10 11:45',
      status: 'completed',
      findings: 4
    },
    {
      id: '5',
      tool: 'Vulnercipher',
      target: 'https://test-site.com',
      date: '2024-11-09 16:20',
      status: 'completed',
      findings: 2
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredReports = filter === 'all' 
    ? mockReports 
    : mockReports.filter(r => r.tool.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-background-dark">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Description className="text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Scan Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your security scan reports</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Reports</h2>
                    <div className="flex items-center gap-2">
                      <FilterList className="text-gray-600 dark:text-gray-400" />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-white/10">
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Tool</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Target</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Findings</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => (
                          <tr key={report.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{report.tool}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{report.target}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{report.date}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-bold">{report.findings}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors">
                                  <Visibility className="text-lg" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors">
                                  <Download className="text-lg" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 transition-colors">
                                  <Delete className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10">
                    <div className="text-3xl font-bold text-primary mb-2">{mockReports.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
                  </div>
                  <div className="p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {mockReports.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10">
                    <div className="text-3xl font-bold text-red-500 mb-2">
                      {mockReports.reduce((sum, r) => sum + r.findings, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Findings</div>
                  </div>
                </div>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
