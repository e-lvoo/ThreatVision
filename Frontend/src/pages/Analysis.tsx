import DashboardLayout from "@/layouts/DashboardLayout";
import NetworkAnalysis from "@/components/dashboard/NetworkAnalysis";

const Analysis = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="animate-fade-in">
                    <h1 className="text-2xl font-bold text-foreground">Network Analysis</h1>
                    <p className="text-muted-foreground">Inspect raw traffic for malicious patterns using AI.</p>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <NetworkAnalysis />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Analysis;
