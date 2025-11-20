'use client';

import { useState } from 'react';

interface SolutionButtonProps {
  vulnerabilityId: string;
  vulnerabilityName: string;
  description?: string;
  severity?: string;
}

export default function SolutionButton({ vulnerabilityId, vulnerabilityName, description, severity }: SolutionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/solutions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vulnerabilityId,
          vulnerabilityName,
          description,
          severity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate solution PDF');
      }

      const blob = await response.blob();
      
      // Check if response is actually a PDF
      if (blob.type !== 'application/pdf') {
        throw new Error('Invalid response format');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vulnerabilityName.replace(/[^a-zA-Z0-9]/g, '-')}-solution.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading solution:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to download solution PDF: ${errorMessage}\n\nThis vulnerability may not have a solution guide available yet.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-gold-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
      {loading ? 'Generating...' : 'Download Step-by-Step Solution'}
    </button>
  );
}
