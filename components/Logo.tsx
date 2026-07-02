import Image from 'next/image';
import Link from 'next/link';

const HEIGHTS = {
  sm: 40,
  md: 48,
  lg: 64,
} as const;

// Cropped logo aspect ratio (484 x 274)
const LOGO_ASPECT = 484 / 274;

type LogoProps = {
  href?: string;
  size?: keyof typeof HEIGHTS;
  variant?: 'dark' | 'light';
  className?: string;
  suffix?: string;
  suffixClassName?: string;
};

export default function Logo({
  href = '/',
  size = 'md',
  variant = 'dark',
  className = '',
  suffix,
  suffixClassName = 'font-bold text-fasty-yellow',
}: LogoProps) {
  const height = HEIGHTS[size];
  const width = Math.round(height * LOGO_ASPECT);
  const src = variant === 'light' ? '/logo-light.png' : '/logo.png';

  const content = (
    <span className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <Image
        src={src}
        alt="Fasty-24 Home Service"
        width={width}
        height={height}
        priority
        className="w-auto object-contain"
        style={{ height, width: 'auto', maxWidth: width }}
      />
      {suffix ? <span className={suffixClassName}>{suffix}</span> : null}
    </span>
  );

  if (href) {
    return <Link href={href} className="flex items-center">
      {content}
    </Link>;
  }

  return content;
}
