import React from 'react';

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 24, 
  color = '#ffffff',
  className = ''
}) => (
  <div className={className}>
    <style jsx global>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div 
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid rgba(0, 0, 0, 0.1)`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} 
    />
  </div>
);

export { Loader };
export default Loader;
