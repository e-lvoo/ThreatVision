import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Verify if the user exists in the profiles table first
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('email')
                .eq('email', email.trim())
                .single();

            if (profileError || !profile) {
                setError('No account found with this email address.');
                setIsLoading(false);
                return;
            }

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
            } else {
                setIsSent(true);
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

                        {isSent ? (
                            <div className="text-center space-y-6 animate-fade-in">
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-success" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
                                    <p className="text-muted-foreground">
                                        We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
                                    </p>
                                </div>
                                <Link to="/login">
                                    <Button variant="outline" className="w-full mt-4">
                                        Back to login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Reset password</h2>
                                    <p className="text-muted-foreground">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Email address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="analyst@company.com"
                                                className={cn('pl-10', error && 'border-destructive')}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {error && (
                                            <p className="text-xs text-destructive animate-fade-in">{error}</p>
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
                                                Sending link...
                                            </>
                                        ) : (
                                            'Send reset link'
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
