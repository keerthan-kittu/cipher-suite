'use client';

import { useState } from 'react';
import { Download } from '@mui/icons-material';

interface SolutionButtonProps {
  vulnerabilityId: string;
  vulnerabilityName: string;
}

export default function SolutionButton({ vulnerabilityId, vulnerabilityName }: SolutionButtonProps) {
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate solution PDF');
      }

      const blob = await response.blob();
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
      alert('Failed to download solution PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      <Download className="text-lg" />
      {loading ? 'Generating...' : 'Download Step-by-Step Solution'}
    </button>
  );
}
