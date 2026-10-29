import React, { useEffect } from 'react';
import { Pill, ShieldCheck } from 'lucide-react';
import { translations, Language } from '../../utils/i18n';

interface Props {
  lang: Language;
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ lang, onFinish }) => {
  const t = translations[lang];

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div 
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-sky-50 via-white to-sky-100/70 text-slate-800 cursor-pointer select-none"
    >
      <div />

      <div className="flex flex-col items-center text-center space-y-5 animate-fade-in">
        {/* App Logo Icon with ring glow */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center shadow-xl shadow-sky-200 animate-pulse">
            <Pill size={48} className="text-white rotate-45 stroke-[2.2]" />
          </div>
          <div className="absolute -inset-3 rounded-3xl bg-sky-300/30 blur-xl -z-10" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t.appName}
          </h1>
          <p className="text-sm text-sky-700 mt-1.5 font-medium">
            {t.appTagline}
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="pt-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-1">
        <span className="text-xs text-sky-700 font-semibold flex items-center gap-1.5 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
          <ShieldCheck size={14} /> {t.offlineBadge}
        </span>
        <span className="text-[10px] text-slate-400">
          Tap anywhere to continue
        </span>
      </div>
    </div>
  );
};
