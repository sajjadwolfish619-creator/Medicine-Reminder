import React, { useState, useRef } from 'react';
import { MedicationIconType } from '../../types';
import { MedicationVisual } from './MedicationVisual';
import { processImageUpload } from '../../utils/storage';
import { translations, Language, getIconLabel } from '../../utils/i18n';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles, 
  Check 
} from 'lucide-react';

interface Props {
  imageUrl?: string;
  icon: MedicationIconType;
  color?: string;
  lang: Language;
  onImageChange: (dataUrl?: string) => void;
  onIconChange: (icon: MedicationIconType) => void;
  onColorChange?: (color: string) => void;
}

const AVAILABLE_ICONS: MedicationIconType[] = [
  'pill',
  'capsule',
  'tablet',
  'liquid',
  'injection',
  'inhaler',
  'drops',
  'cream',
  'patch',
  'powder',
  'spray',
  'herb',
];

export const MedicationImageSelector: React.FC<Props> = ({
  imageUrl,
  icon,
  color = '#0284c7',
  lang,
  onImageChange,
  onIconChange,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'icon' | 'upload'>(imageUrl ? 'upload' : 'icon');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const dataUrl = await processImageUpload(file);
      onImageChange(dataUrl);
      setActiveTab('upload');
    } catch (err) {
      console.error('Error processing uploaded image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePhoto = () => {
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveTab('icon');
  };

  return (
    <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-xs space-y-4 text-slate-800">
      {/* Header and Live Preview */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-bold text-slate-900">
            {t.medImageAndIcon}
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.photoHelp}
          </p>
        </div>
        {/* Live Preview Avatar */}
        <div className="flex items-center gap-2">
          <MedicationVisual 
            imageUrl={imageUrl} 
            icon={icon} 
            color="#0284c7" 
            size="lg" 
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-sky-50/70 p-1 border border-sky-100">
        <button
          type="button"
          onClick={() => setActiveTab('icon')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'icon' && !imageUrl
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles size={15} />
          {t.chooseFromLibrary}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'upload' || imageUrl
              ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Camera size={15} />
          {t.uploadPhoto}
          {imageUrl && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab: Upload Custom Photo */}
      {(activeTab === 'upload' || imageUrl) && (
        <div className="space-y-3 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {imageUrl ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
              <div className="flex items-center gap-3">
                <img 
                  src={imageUrl} 
                  alt="Custom preview" 
                  className="w-14 h-14 rounded-xl object-cover border border-sky-300" 
                />
                <div>
                  <span className="text-xs font-bold text-sky-700 flex items-center gap-1">
                    <Check size={14} /> Photo Attached
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Will appear in reminder notifications and dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-sky-100 text-slate-700 border border-sky-200 transition"
                >
                  {t.changePhoto}
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1.5 text-xs rounded-xl text-rose-500 hover:bg-rose-50 transition"
                  title={t.removePhoto}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-200 hover:border-sky-400 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-sky-50/40 hover:bg-sky-50/80"
            >
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
                {isProcessing ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : (
                  <Upload size={22} />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 block">
                {t.uploadPhoto}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Take a photo or choose from device gallery (JPEG, PNG, WebP)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Predefined Icon Grid */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-semibold text-slate-600 block">
          {t.chooseFromLibrary}:
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {AVAILABLE_ICONS.map((ic) => {
            const isSelected = icon === ic;
            return (
              <button
                key={ic}
                type="button"
                onClick={() => {
                  onIconChange(ic);
                  if (activeTab === 'upload' && !imageUrl) {
                    setActiveTab('icon');
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all border ${
                  isSelected
                    ? 'border-sky-400 bg-sky-50 shadow-xs'
                    : 'border-sky-100 bg-white hover:bg-sky-50/50 text-slate-600'
                }`}
              >
                <MedicationVisual icon={ic} color="#0284c7" size="sm" />
                <span className="text-[10px] mt-1.5 font-medium text-center truncate max-w-full text-slate-700">
                  {getIconLabel(ic, lang)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
