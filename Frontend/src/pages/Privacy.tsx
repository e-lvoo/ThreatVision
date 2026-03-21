import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-gradient-cyber p-6 md:p-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/register">
                    <Button variant="ghost" className="mb-8 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to registration
                    </Button>
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <Logo size="md" />
                    <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
                </div>

                <div className="glass-card p-8 md:p-12 rounded-2xl animate-fade-in space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-secondary" />
                            1. Information We Collect
                        </h2>
                        <p>
                            ThreatVision collects information necessary to provide network security analysis. This includes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Account Information:</strong> Email address, username, and organization details provided during registration.</li>
                            <li><strong>Network Metadata:</strong> Captured packet headers and payload fragments processed for threat detection.</li>
                            <li><strong>Usage Logs:</strong> Information on how you interact with the dashboard and API.</li>
                            <li><strong>System Metrics:</strong> Performance data related to model inference and system health.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use the collected data to:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Identify and alert you to potential security threats in your network.</li>
                            <li>Improve our machine learning models through supervised and unsupervised training (anonymized).</li>
                            <li>Manage your user account and provide technical support.</li>
                            <li>Comply with legal obligations and enforce our terms of service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-secondary" />
                            3. Data Security and Storage
                        </h2>
                        <p>
                            We implement industry-standard security measures, including end-to-end encryption for API communication and secure hashing for sensitive data. All personal data is stored in secure environments (Supabase) and is only accessible by authorized personnel.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">4. Sharing of Information</h2>
                        <p>
                            We do not sell your personal or network data to third parties. We may share anonymized, aggregated threat intelligence with the broader security community to improve collective defense, but this will never include identifiable individual or organizational information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">5. Your Rights</h2>
                        <p>
                            You have the right to access, rectify, or delete your personal data. You can manage your profile settings through the dashboard or contact our support team for a full export of your account data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">6. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the date below.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-white/10 text-sm italic">
                        Last Updated: March 2026
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
