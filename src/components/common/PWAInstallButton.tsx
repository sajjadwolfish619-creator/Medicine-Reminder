import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../../utils/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface Props {
  lang: Language;
}

export const PWAInstallButton: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    setShowModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-200 transition active:scale-95 cursor-pointer"
        title={t.downloadApk}
      >
        <Smartphone size={14} />
        <span>{isInstalled ? 'Installed' : t.downloadApk}</span>
      </button>

      {/* Guide & Download Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.installTitle}
                </h3>
                <span className="text-xs text-sky-600 flex items-center gap-1 mt-0.5 font-medium">
                  <ShieldCheck size={13} /> {t.offlineBadge}
                </span>
              </div>
            </div>

            {/* Direct APK Download Button */}
            <div className="mb-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-900">
                <FileCheck size={16} className="text-sky-600" />
                <span>Debug APK (.build-outputs/app-debug.apk)</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                {t.apkInBuildOutputs}
              </p>
              <a
                href="/app-debug.apk"
                download="MEDR-By-Saj-debug.apk"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-sky-500 hover:bg-sky-600 shadow-sm shadow-sky-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={15} />
                <span>{t.downloadDebugApk}</span>
              </a>
            </div>

            {/* Android WebAPK installation steps */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 text-xs text-slate-700">
              <h4 className="font-semibold text-slate-900">
                {t.installStepsTitle}
              </h4>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-600 text-[11px]">
                <li>{t.installStep1}</li>
                <li>{t.installStep2}</li>
                <li>{t.installStep3}</li>
                <li>{t.installStep4}</li>
              </ol>
            </div>

            {deferredPrompt && (
              <button
                type="button"
                onClick={async () => {
                  setShowModal(false);
                  await deferredPrompt.prompt();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-sky-800 bg-sky-100 hover:bg-sky-200 border border-sky-300 transition mb-2.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                {t.installPwaBtn}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2 px-4 rounded-xl font-medium text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
