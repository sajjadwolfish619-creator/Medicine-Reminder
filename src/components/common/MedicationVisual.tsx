import React from 'react';
import { MedicationIconType } from '../../types';
import { 
  Pill, 
  CircleDot, 
  Layers, 
  FlaskConical, 
  Syringe, 
  Wind, 
  Droplets, 
  Sparkles, 
  Square, 
  Wheat, 
  SprayCan, 
  Leaf 
} from 'lucide-react';

interface Props {
  imageUrl?: string;
  icon?: MedicationIconType;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  altText?: string;
}

export const MedicationVisual: React.FC<Props> = ({
  imageUrl,
  icon = 'pill',
  color = '#0d9488',
  size = 'md',
  className = '',
  altText = 'Medication',
}) => {
  const sizeMap = {
    xs: 'w-7 h-7 text-xs rounded-lg',
    sm: 'w-9 h-9 text-sm rounded-xl',
    md: 'w-12 h-12 text-base rounded-2xl',
    lg: 'w-16 h-16 text-lg rounded-2xl',
    xl: 'w-20 h-20 text-2xl rounded-3xl',
    hero: 'w-28 h-28 text-3xl rounded-3xl',
  };

  const iconSizeMap = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 40,
    hero: 56,
  };

  const iconPx = iconSizeMap[size];

  // If user uploaded a custom photo, display the photo
  if (imageUrl) {
    return (
      <div 
        className={`relative overflow-hidden flex-shrink-0 border-2 border-white/20 shadow-md ${sizeMap[size]} ${className}`}
        style={{ borderColor: color }}
      >
        <img 
          src={imageUrl} 
          alt={altText} 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
        {/* Subtle pill badge in corner to reinforce medical nature */}
        <div 
          className="absolute bottom-0 right-0 p-0.5 rounded-tl bg-slate-900/80 text-white"
          style={{ transform: 'scale(0.8)' }}
        >
          <Pill size={Math.max(10, iconPx * 0.4)} style={{ color }} />
        </div>
      </div>
    );
  }

  // Predefined icon mapping
  const renderIcon = () => {
    switch (icon) {
      case 'capsule':
        return <Pill size={iconPx} className="rotate-45" />;
      case 'tablet':
        return <CircleDot size={iconPx} />;
      case 'liquid':
        return <FlaskConical size={iconPx} />;
      case 'injection':
        return <Syringe size={iconPx} />;
      case 'inhaler':
        return <Wind size={iconPx} />;
      case 'drops':
        return <Droplets size={iconPx} />;
      case 'cream':
        return <Sparkles size={iconPx} />;
      case 'patch':
        return <Square size={iconPx} />;
      case 'powder':
        return <Wheat size={iconPx} />;
      case 'spray':
        return <SprayCan size={iconPx} />;
      case 'herb':
        return <Leaf size={iconPx} />;
      case 'pill':
      default:
        return <Layers size={iconPx} />;
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 transition-transform shadow-sm ${sizeMap[size]} ${className}`}
      style={{
        backgroundColor: `${color}25`, // 15% opacity tint
        color: color,
        border: `1.5px solid ${color}60`,
      }}
    >
      {renderIcon()}
    </div>
  );
};
