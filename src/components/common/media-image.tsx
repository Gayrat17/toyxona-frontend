'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export function MediaImage({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!src || failedSource === src)
    return (
      <div
        role="img"
        aria-label={`${alt} — rasm mavjud emas`}
        className={`flex items-center justify-center bg-surface-2 text-ink-faint ${className}`}
      >
        <ImageOff className="h-9 w-9" aria-hidden="true" />
      </div>
    );
  // User-uploaded media is already proxied; do not require a build-time remote-host allowlist.
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={800}
      unoptimized
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      onError={() => setFailedSource(src)}
      className={className}
    />
  );
}
