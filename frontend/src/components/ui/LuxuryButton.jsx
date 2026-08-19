import React from 'react';

const variants = {
  primary: 'luxury-button',
  outline: 'luxury-button-outline',
  ghost: 'text-text-primary hover:text-color-gold transition-colors duration-300 font-sans font-medium uppercase tracking-widest text-sm px-4 py-2',
};

const LuxuryButton = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  as: Component = 'button', 
  ...props 
}) => (
  <Component
    className={`${variants[variant]} ${className}`}
    {...props}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </span>
  </Component>
);

export default LuxuryButton;
