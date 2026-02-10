import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              level <= strength.score ? strength.color : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs font-medium transition-colors duration-300',
        strength.score === 1 && 'text-red-400',
        strength.score === 2 && 'text-yellow-400',
        strength.score === 3 && 'text-blue-400',
        strength.score === 4 && 'text-green-400'
      )}>
        Password strength: {strength.label}
      </p>
    </div>
  );
};

export default PasswordStrength;
