import React from 'react';

const SectionHeading = ({ title, subtitle, className = '', align = 'center' }) => {
  let alignmentClass = 'text-center';
  if (align === 'left') alignmentClass = 'text-left';
  else if (align === 'right') alignmentClass = 'text-right';

  return (
    <div className={`flex flex-col gap-4 ${alignmentClass} ${className}`}>
      {subtitle && (
        <span className="font-sans font-semibold uppercase tracking-[0.2em] text-xs text-color-gold">
          {subtitle}
        </span>
      )}
      <h2 className="text-display text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-[1.1]">
        {title}
      </h2>
    </div>
  );
};

export default SectionHeading;
