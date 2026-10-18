'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

interface InspirationBadgesProps {
  onSelect: (prompt: string) => void;
}

const INSPIRATIONS = [
  {
    label: 'Next.js + Stripe Payments (Hinglish)',
    prompt: 'bhai ek nextjs app banana hai stripe payments ke saath full production ready',
  },
  {
    label: 'PostgreSQL Indexing & Optimization',
    prompt: 'Analyze high read query latency in Postgres on a 10M row table with composite queries',
  },
  {
    label: 'Microservice Docker & Kubernetes Architecture',
    prompt: 'Need a zero-downtime blue-green deployment helm chart and dockerfile setup for Go microservices',
  },
  {
    label: 'Executive Series-A Pitch Summary',
    prompt: 'Draft an executive investor summary for our B2B AI developer tool showing 40% MoM growth',
  },
];

export const InspirationBadges: React.FC<InspirationBadgesProps> = ({ onSelect }) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 text-xs text-[#4E342E] mb-2 font-medium">
        <Lightbulb className="w-3.5 h-3.5 text-[#C62828]" />
        <span>Quick inspiration (slang, broken speech & technical):</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {INSPIRATIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white/90 border border-[#4E342E]/20 text-[#1B0E07] hover:text-[#C62828] hover:border-[#C62828] hover:bg-white transition-all duration-150 text-left shadow-2xs font-medium"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
