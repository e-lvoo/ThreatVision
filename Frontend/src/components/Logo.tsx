import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', showText = true, className }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <Shield className={cn(sizeClasses[size], 'text-primary')} />
        <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full" />
      </div>
      {showText && (
        <span className={cn(textSizeClasses[size], 'font-bold text-gradient-cyber')}>
          ThreatVision
        </span>
      )}
    </div>
  );
};

export default Logo;
