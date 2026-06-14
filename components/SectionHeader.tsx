interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${align === 'center' ? 'text-center max-w-2xl mx-auto' : ''}`}>
      {eyebrow && (
        <span className="inline-block text-fasty-yellow font-bold text-sm uppercase tracking-widest mb-3">
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
          dark ? 'text-white' : 'text-fasty-black'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-lg leading-relaxed ${
            dark ? 'text-gray-400' : 'text-fasty-gray'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
