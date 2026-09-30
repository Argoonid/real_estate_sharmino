import React, { useState } from 'react';
import { ImageOptimizerService } from '../../services/imageOptimizer';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatioClass?: string;
  onClick?: (e: React.MouseEvent) => void;
  onError?: (src: string) => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  aspectRatioClass = 'aspect-[16/10]',
  onClick,
  onError,
}) => {
  const imageSrc = ImageOptimizerService.cleanExternalUrl(src);
  const [imageState, setImageState] = useState<{
    src: string;
    status: 'loading' | 'loaded' | 'error';
  }>({ src: imageSrc, status: 'loading' });
  const status = imageState.src === imageSrc ? imageState.status : 'loading';

  if (!imageSrc || status === 'error') return null;
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-100 ${aspectRatioClass} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse pointer-events-none z-10" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setImageState({ src: imageSrc, status: 'loaded' })}
        onError={() => {
          setImageState({ src: imageSrc, status: 'error' });
          onError?.(src);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};
