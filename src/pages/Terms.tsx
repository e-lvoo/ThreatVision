import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gradient-cyber p-6 md:p-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/register">
                    <Button variant="ghost" className="mb-8 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to registration
                    </Button>
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <Logo size="md" />
                    <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
                </div>

                <div className="glass-card p-8 md:p-12 rounded-2xl animate-fade-in space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using the ThreatVision platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. ThreatVision provides advanced network intrusion detection and malware analysis tools for security professionals.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">2. User Accounts</h2>
                        <p>
                            To access most features of the platform, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be a legal professional or an authorized representative of an organization to use the administrative features of ThreatVision.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">3. Acceptable Use</h2>
                        <p>
                            You agree not to use ThreatVision for any illegal or unauthorized purpose. Specifically, you may not:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Use the system to attack, harass, or perform unauthorized scanning of third-party networks.</li>
                            <li>Attempt to reverse engineer the underlying machine learning models without explicit authorization.</li>
                            <li>Share account access with unauthorized individuals.</li>
                            <li>Upload malicious data for purposes other than security research and analysis within the provided scope.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality of the ThreatVision platform, including but not limited to the AI models, dashboard design, and proprietary algorithms, are the exclusive property of ThreatVision and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">5. Disclaimer of Warranties</h2>
                        <p>
                            ThreatVision is provided "as is" and "as available." While we strive for high accuracy in threat detection, we do not guarantee that the system will identify all potential threats or that detections will always be accurate. Security is a shared responsibility.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
                        <p>
                            In no event shall ThreatVision be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform, including data breaches or system downtime.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">7. Termination</h2>
                        <p>
                            We reserve the right to terminate or suspend access to our platform immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
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

export default Terms;
