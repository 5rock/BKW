import React from 'react';

const GlassPanel = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`glass-panel p-6 sm:p-10 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
