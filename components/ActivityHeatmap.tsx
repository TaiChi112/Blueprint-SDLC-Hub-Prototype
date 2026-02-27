"use client";
import { useState } from 'react';

const ActivityHeatmap = () => {
  const [days] = useState<number[]>(() =>
    Array.from({ length: 150 }, () => {
      const level = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
      return level;
    })
  );

  const getColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-200';
      case 2:
        return 'bg-green-300';
      case 3:
        return 'bg-green-400';
      case 4:
        return 'bg-green-600';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-wrap gap-1">
        {days.map((level, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-sm ${
              getColor(level)
            } hover:ring-1 ring-slate-400 transition`}
            title={`Activity Level: ${level}`}
          ></div>
        ))}
      </div>
      <div className="flex items-center justify-end mt-2 space-x-2 text-xs text-slate-400">
        <span>Less</span>
        <div className="w-2 h-2 bg-slate-100 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-200 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-600 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
