import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div 
      className={cn("rounded-xl p-6 transition-all duration-200", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
