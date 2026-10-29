import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  enabled: boolean;
  onToggleFrame: () => void;
}

export const AndroidFrame: React.FC<Props> = ({
  children,
  enabled,
  onToggleFrame,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!enabled) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-sky-50/50 text-slate-800">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-sky-100/70 flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden">
      {/* Top Simulator Control Bar */}
      <div className="w-full max-w-sm flex items-center justify-between pb-3 px-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Smartphone size={14} className="text-sky-600" />
          Android 14 Jetpack Compose Simulator
        </span>
        <button
          type="button"
          onClick={onToggleFrame}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-700 border border-sky-200 transition text-[11px] shadow-xs"
          title="Switch to Fullscreen Responsive View"
        >
          <Monitor size={12} />
          <span>Full Screen</span>
        </button>
      </div>

      {/* Realistic Android Phone Device Shell */}
      <div className="relative w-full max-w-[412px] h-[860px] max-h-[92vh] bg-white rounded-[44px] p-3 shadow-[0_20px_50px_-15px_rgba(2,132,199,0.2)] border-4 border-slate-300 flex flex-col ring-1 ring-sky-200 ring-inset overflow-hidden">
        {/* Android Punch Hole Camera */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 z-40 border border-slate-700 flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        </div>

        {/* Android System Status Bar */}
        <div className="h-7 px-4 pt-1 flex items-center justify-between text-[11px] font-semibold text-slate-700 z-30 select-none bg-white/95 backdrop-blur-xs">
          <span>{timeStr || '10:00'}</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal size={12} />
            <Wifi size={12} />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <BatteryMedium size={14} className="text-sky-600" />
            </div>
          </div>
        </div>

        {/* Screen Viewport Content */}
        <div className="relative flex-1 w-full bg-sky-50/50 overflow-hidden flex flex-col rounded-b-[36px]">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-4 flex items-center justify-center bg-white pt-1 select-none">
          <div className="w-32 h-1 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
};
