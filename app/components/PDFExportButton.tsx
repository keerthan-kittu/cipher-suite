'use client';

import React, { useState } from 'react';
import { Icons } from './Icons';

interface PDFExportButtonProps {
  scanType: 'honeypot' | 'nmap' | 'redhawk' | 'vulnercipher';
  scanData: any;
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  scanType,
  scanData,
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      onExportStart?.();

      // Send request to API
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanType,
          scanData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate PDF');
      }

      // Get PDF blob
      const blob = await response.blob();

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${scanType}-report-${Date.now()}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onExportComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error.message);
      onExportError?.(error);
      console.error('PDF export error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={disabled || isGenerating}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? <span className="animate-spin">⟳</span> : <Icons.PictureAsPdf />}
        {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
      </button>
      
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-500 rounded text-red-900 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};
