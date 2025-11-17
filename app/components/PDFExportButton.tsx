'use client';

import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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
      <Button
        variant="contained"
        color="primary"
        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
        onClick={handleExport}
        disabled={disabled || isGenerating}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1.5,
        }}
      >
        {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
      </Button>
      
      {error && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #dc2626',
          borderRadius: '4px',
          color: '#991b1b',
          fontSize: '14px',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};
