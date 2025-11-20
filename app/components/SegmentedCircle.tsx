'use client';

interface SegmentedCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function SegmentedCircle({
  percentage,
  size = 128,
  strokeWidth = 8,
}: SegmentedCircleProps) {
  const totalSegments = 10;
  const filledSegments = Math.round(percentage / 10);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Calculate segment properties with proper gaps
  const gapAngle = 12; // Gap between segments in degrees
  const segmentAngle = (360 - totalSegments * gapAngle) / totalSegments;

  // Generate segments as arcs
  const segments = Array.from({ length: totalSegments }, (_, index) => {
    const startAngle = index * (segmentAngle + gapAngle) - 90;
    const endAngle = startAngle + segmentAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Round to avoid hydration mismatches
    const startX = Math.round((center + radius * Math.cos(startRad)) * 100) / 100;
    const startY = Math.round((center + radius * Math.sin(startRad)) * 100) / 100;
    const endX = Math.round((center + radius * Math.cos(endRad)) * 100) / 100;
    const endY = Math.round((center + radius * Math.sin(endRad)) * 100) / 100;

    // Create arc path
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    const path = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

    const isFilled = index < filledSegments;

    return {
      path,
      isFilled,
      delay: index * 0.1,
    };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {segments.map((segment, index) => (
          <path
            key={`bg-${index}`}
            d={segment.path}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {segments.map((segment, index) =>
          segment.isFilled ? (
            <path
              key={`fill-${index}`}
              d={segment.path}
              stroke="#00B2A9"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              style={{
                opacity: 0,
                animation: `fadeInScale 0.4s ease-out ${segment.delay}s forwards`,
              }}
            />
          ) : null
        )}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}
