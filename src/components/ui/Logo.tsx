
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-white p-1 rounded-full shadow-md">
        <img
          src="/src/components/ui/finallogo.png"
          alt="Tutorly Logo"
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold dark:text-foreground`}>
          Tutorly
        </span>
      )}
    </div>
  );
};

export default Logo;
