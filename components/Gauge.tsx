import React from 'react';

interface GaugeProps {
  value: number;
  label: string;
}

export const Gauge: React.FC<GaugeProps> = ({ value, label }) => {
  // AQI Max usually 500 for visualization
  const percentage = Math.min(value / 500, 1);
  const rotation = -90 + percentage * 180;
  
  let colorClass = "text-green-500";
  if (value > 50) colorClass = "text-yellow-500";
  if (value > 100) colorClass = "text-orange-500";
  if (value > 200) colorClass = "text-red-500";
  if (value > 300) colorClass = "text-purple-500";
  if (value > 400) colorClass = "text-rose-900";

  return (
    <div className="relative w-48 h-32 flex flex-col items-center justify-end">
      {/* Background Arc */}
      <div className="absolute top-0 w-40 h-40 rounded-full border-[16px] border-slate-200 border-b-transparent transform rotate-45 box-border"></div>
      
      {/* Colored Arc Indicator - simplified CSS rotation for demo */}
      <div 
        className={`absolute top-0 w-40 h-40 rounded-full border-[16px] border-current border-b-transparent border-r-transparent transform rotate-[45deg] opacity-20 ${colorClass}`}
      ></div>

      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-800 origin-bottom transform transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      >
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-slate-800 rounded-full"></div>
      </div>
      
      <div className="absolute bottom-0 text-center translate-y-8">
        <div className={`text-3xl font-bold ${colorClass}`}>{Math.round(value)}</div>
        <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{label}</div>
      </div>
    </div>
  );
};