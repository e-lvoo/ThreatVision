import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/Logo';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Analyst',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.username,
        formData.role
      );

      if (result.ok) {
        navigate('/dashboard');
      } else {
        setErrors({ ...errors, general: result.error || 'Registration failed' });
      }
    } catch (err: any) {
      setErrors({ ...errors, general: err.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-cyber">
      {/* Background effects */}
      <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-30" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />

      {/* Left side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl animate-scale-in">
            <div className="lg:hidden mb-6 flex justify-center">
              <Logo size="lg" />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Create account</h2>
              <p className="text-muted-foreground">Join ThreatVision security platform</p>
              {errors.general && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive animate-fade-in">
                  {errors.general}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type="text"
                    placeholder="johndoe"
                    className={cn('pl-10', errors.username && 'border-destructive')}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type="email"
                    placeholder="analyst@company.com"
                    className={cn('pl-10', errors.email && 'border-destructive')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className={cn('border-primary/20 bg-white/5 focus:ring-primary/50', errors.role && 'border-destructive')}>
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-dark border-primary/30 border-2">
                    <SelectItem value="Analyst" className="focus:bg-primary focus:text-primary-foreground cursor-pointer">Security Analyst</SelectItem>
                    <SelectItem value="Network Admin" className="focus:bg-primary focus:text-primary-foreground cursor-pointer">Network Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
                {errors.password && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn('pl-10 pr-10', errors.confirmPassword && 'border-destructive')}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, acceptTerms: checked as boolean })
                    }
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer leading-tight"
                  >
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-cyan-300 font-medium underline-offset-4 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:text-cyan-300 font-medium underline-offset-4 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.acceptTerms}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="cyber"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-cyan-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-secondary/10 via-transparent to-primary/10" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <Logo size="lg" className="mb-8" />
          <h1 className="text-4xl font-bold text-foreground text-center mb-4">
            Secure Your Infrastructure
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-md">
            Join thousands of security professionals using ThreatVision to protect their organizations.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '500K+', label: 'Threats Blocked' },
              { value: '24/7', label: 'Monitoring' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-3xl font-bold text-primary cyber-text-glow">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
