import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import PasswordStrength from '@/components/auth/PasswordStrength';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if we have a session (the user should be logged in via the link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Your session has expired or the link is invalid. Please request a new password reset link.');
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError('Password is required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-cyber">
            {/* Background effects */}
            <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md">
                    <div className="glass-card p-8 rounded-2xl animate-scale-in">
                        <div className="mb-8 flex justify-center">
                            <Logo size="lg" />
                        </div>

                        {isSuccess ? (
                            <div className="text-center space-y-6 animate-fade-in">
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-success" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Password Updated</h2>
                                    <p className="text-muted-foreground">
                                        Your password has been successfully updated. Redirecting you to login...
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={() => navigate('/login')}
                                >
                                    Go to login now
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Create new password</h2>
                                    <p className="text-muted-foreground">
                                        Enter your new secure password below.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className={cn('pl-10 pr-10', error && password.length < 8 && 'border-destructive')}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <PasswordStrength password={password} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className={cn('pl-10 pr-10', error && password !== confirmPassword && 'border-destructive')}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-xs text-destructive animate-fade-in">{error}</p>
                                    )}

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
                                                Updating password...
                                            </>
                                        ) : (
                                            'Update password'
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
