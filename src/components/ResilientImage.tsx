import { useState } from 'react';
import { Scale } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  aspectClass?: string;
}

export function ResilientImage({
  src,
  alt,
  title,
  className = '',
  aspectClass = 'aspect-[4/3]',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`relative w-full ${aspectClass} bg-gradient-to-br from-[#16181D] via-[#111317] to-[#0A0B0D] flex flex-col items-center justify-center p-6 text-center border border-[#262A32] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Scale className="w-8 h-8 text-[#D4B483]/70 mb-3" strokeWidth={1.5} />
        <span className="font-serif text-lg font-medium text-[#ECEAE4]">
          {title || 'Archival Plate'}
        </span>
        <span className="text-xs text-[#A3A7B0] mt-1 max-w-xs">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
