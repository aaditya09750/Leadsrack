import { cn } from '../../lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = ({ src, alt, size = 'md', className }: AvatarProps) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <img 
      src={src} 
      alt={alt} 
      className={cn("rounded-full object-cover", sizes[size], className)} 
    />
  );
};
